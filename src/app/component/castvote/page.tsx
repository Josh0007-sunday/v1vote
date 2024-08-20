import React, { useState, useEffect } from 'react';
import { web3, BN } from '@project-serum/anchor';
import { getProgram, getProvider } from '../connecion/page';

interface ProposalAccountData {
    title: string;
    description: string[] | string;
    options: string[];
    startTime: BN;
    endTime: BN;
    authority: web3.PublicKey;
    isActive: boolean;
}

interface CastVoteProps {
    daoPublicKey?: string;
    proposalPublicKey?: string;
}

const CastVote: React.FC<CastVoteProps> = ({ daoPublicKey, proposalPublicKey: initialProposalPublicKey }) => {
    const [isClient, setIsClient] = useState(false);
    const [optionIndex, setOptionIndex] = useState<number | null>(null);
    const [proposalData, setProposalData] = useState<ProposalAccountData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInitializer, setIsInitializer] = useState(false);
    const [proposalPublicKey, setProposalPublicKey] = useState<string | undefined>(initialProposalPublicKey);
    const [manualProposalPublicKey, setManualProposalPublicKey] = useState<string>('');
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && proposalPublicKey) {
            fetchProposalDetails(proposalPublicKey);
        }
    }, [proposalPublicKey, isClient]);

    const fetchProposalDetails = async (pubkey: string) => {
        setError(null);
        if (!pubkey) {
            setError("Proposal public key is missing");
            return;
        }
        try {
            const program = getProgram();
            const provider = getProvider();
            if (!program || !provider) {
                setError("Solana wallet not connected");
                return;
            }
            let proposalPubkey: web3.PublicKey;
            try {
                proposalPubkey = new web3.PublicKey(pubkey);
            } catch (err) {
                setError("Invalid proposal public key");
                return;
            }
            const proposalAccount = await program.account.proposal.fetchNullable(proposalPubkey) as ProposalAccountData;
            if (proposalAccount) {
                setProposalData(proposalAccount);
                const initializerPublicKey = 'HuDEMx6hGxCYWYJKivCSFM8UX21Acgkwgd1UfFJ3qaGN';
                setIsInitializer(provider.wallet.publicKey.toString() === initializerPublicKey);
            } else {
                setError("Proposal account not found or has no data");
            }
        } catch (err) {
            console.error('Error fetching proposal details:', err);
            setError(`Error fetching proposal details: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const handleVote = async () => {
        setError(null);
        setIsVoting(true);
        if (optionIndex === null) {
            setError("Please select an option to vote");
            setIsVoting(false);
            return;
        }
        if (!daoPublicKey) {
            setError("DAO public key is missing");
            setIsVoting(false);
            return;
        }
        try {
            const program = getProgram();
            const provider = getProvider();
            if (!program || !provider) {
                setError("Solana wallet not connected");
                setIsVoting(false);
                return;
            }
            const proposalPubkey = new web3.PublicKey(proposalPublicKey!);
            const daoPubkey = new web3.PublicKey(daoPublicKey);
            const transaction = await program.methods
                .castVote(new BN(optionIndex))
                .accounts({
                    voter: provider.wallet.publicKey,
                    dao: daoPubkey,
                    proposal: proposalPubkey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .transaction();
            const signedTransaction = await provider.wallet.signTransaction(transaction);
            const txid = await provider.connection.sendRawTransaction(signedTransaction.serialize());
            console.log("Transaction sent. Waiting for confirmation...");
            const confirmation = await provider.connection.confirmTransaction(txid);
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }
            console.log("Vote cast successfully. Transaction ID:", txid);
            alert('Vote cast successfully');
            await fetchProposalDetails(proposalPublicKey!);
        } catch (err) {
            console.error('Error casting vote:', err);
            setError(`Error casting vote: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsVoting(false);
        }
    };

    const handleLoadProposal = () => {
        if (manualProposalPublicKey) {
            setProposalPublicKey(manualProposalPublicKey);
        }
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="bg-gradient-to-br from-black to-purple-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">Cast Your Vote</h2>
                {error && <p className="text-red-400 text-center">{error}</p>}
                {!proposalPublicKey && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter Proposal Public Key"
                            value={manualProposalPublicKey}
                            onChange={(e) => setManualProposalPublicKey(e.target.value)}
                            className="w-full px-3 py-2 bg-purple-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button 
                            onClick={handleLoadProposal} 
                            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300"
                        >
                            Load Proposal
                        </button>
                    </div>
                )}
                {proposalData ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white text-center">{proposalData.title}</h3>
                        <p className="text-purple-300">{Array.isArray(proposalData.description) ? proposalData.description.join(' ') : proposalData.description}</p>
                        <p className="text-purple-300">Start Time: {new Date(proposalData.startTime.toNumber() * 1000).toLocaleString()}</p>
                        <p className="text-purple-300">End Time: {new Date(proposalData.endTime.toNumber() * 1000).toLocaleString()}</p>
                        <p className="text-purple-300">Status: {proposalData.isActive ? 'Active' : 'Inactive'}</p>
                        {proposalData.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="vote"
                                    value={index}
                                    onChange={() => setOptionIndex(index)}
                                    className="form-radio text-purple-600"
                                />
                                <label className="text-purple-300">{option}</label>
                            </div>
                        ))}
                        <button 
                            onClick={handleVote} 
                            disabled={isInitializer || !proposalData.isActive || isVoting}
                            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300"
                        >
                            {isVoting ? 'Casting Vote...' : 'Cast Vote'}
                        </button>
                    </div>
                ) : (
                    proposalPublicKey && <p className="text-purple-300 text-center">Loading proposal details...</p>
                )}
            </div>
        </div>
    );
};

export default CastVote;
