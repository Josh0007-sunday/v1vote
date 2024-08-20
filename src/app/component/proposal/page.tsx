"use client";
import { useState } from 'react';
import { web3, BN } from '@project-serum/anchor';
import { getProgram, getProvider } from '../connecion/page';

const CreateProposal = ({ daoPublicKey }: { daoPublicKey: string }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState<string[]>(['']);
    const [startTime, setStartTime] = useState(new BN(Math.floor(Date.now() / 1000)));
    const [endTime, setEndTime] = useState(new BN(Math.floor(Date.now() / 1000)));
    const [error, setError] = useState<string | null>(null);
    const [proposalPublicKey, setProposalPublicKey] = useState<string | null>(null); // State to store the proposal public key

    const isValidPublicKey = (value: string): boolean => {
        try {
            new web3.PublicKey(value);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const program = getProgram();
        const provider = getProvider();

        if (!program || !provider) {
            setError("Solana wallet not connected");
            return;
        }

        const wallet = provider.wallet;

        const initializerPublicKey = 'HuDEMx6hGxCYWYJKivCSFM8UX21Acgkwgd1UfFJ3qaGN';
        if (!isValidPublicKey(initializerPublicKey)) {
            setError('Invalid initializer public key.');
            return;
        }
        if (wallet.publicKey.toString() !== initializerPublicKey) {
            setError('Only the initializer can create proposals.');
            return;
        }

        const proposalKeypair = web3.Keypair.generate();

        try {
            if (!isValidPublicKey(daoPublicKey)) {
                setError('Invalid DAO public key.');
                return;
            }
            const daoPublicKeyObj = new web3.PublicKey(daoPublicKey);

            console.log('Sending proposal data:', {
                title,
                description,
                options,
                startTime: startTime.toString(),
                endTime: endTime.toString()
            });

            await program.methods
                .createProposal(
                    title,
                    description,
                    options,
                    startTime,
                    endTime
                )
                .accounts({
                    authority: wallet.publicKey,
                    dao: daoPublicKeyObj,
                    proposal: proposalKeypair.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([proposalKeypair])
                .rpc();

            // Store the proposal public key in the state
            setProposalPublicKey(proposalKeypair.publicKey.toString());

            alert('Proposal Created Successfully');
        } catch (err) {
            console.error('Error creating proposal:', err);
            setError(`Error creating proposal: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const unixToISO = (timestamp: BN) => {
        return new Date(timestamp.toNumber() * 1000).toISOString().slice(0, 16);
    };

    const isoToUnix = (isoString: string) => {
        return new BN(Math.floor(new Date(isoString).getTime() / 1000));
    };

    return (
           <div className="flex justify-center items-center min-h-screen bg-black">
            <div className="bg-gradient-to-br from-black to-purple-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">Create Proposal</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-purple-300 mb-2">Proposal Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-purple-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-purple-300 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-purple-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={4}
                        />
                    </div>
                    {options.map((option, index) => (
                        <div key={index}>
                            <label className="block text-purple-300 mb-2">Option {index + 1}</label>
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="w-full px-3 py-2 bg-purple-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={() => setOptions([...options, ''])}
                        className="text-purple-300 hover:text-purple-100"
                    >
                        Add Option
                    </button>
                    <div>
                        <label className="block text-purple-300 mb-2">Start Time</label>
                        <input
                            type="datetime-local"
                            value={unixToISO(startTime)}
                            onChange={(e) => setStartTime(isoToUnix(e.target.value))}
                            required
                            className="w-full px-3 py-2 bg-purple-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-purple-300 mb-2">End Time</label>
                        <input
                            type="datetime-local"
                            value={unixToISO(endTime)}
                            onChange={(e) => setEndTime(isoToUnix(e.target.value))}
                            required
                            className="w-full px-3 py-2 bg-purple-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-300"
                    >
                        Create Proposal
                    </button>
                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                </form>
                {proposalPublicKey && (
                    <div className="mt-6">
                        <p className="text-purple-300 text-center">Proposal Public Key:</p>
                        <p className="text-white break-all text-center">{proposalPublicKey}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateProposal;
