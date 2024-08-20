"use client";
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { getProgram, getProvider } from '../connecion/page';

const initializerPublicKey = 'HuDEMx6hGxCYWYJKivCSFM8UX21Acgkwgd1UfFJ3qaGN';

const CreateDAO = ({ onDaoCreated }: { onDaoCreated: (publicKey: string) => void }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitializer, setIsInitializer] = useState(false);
    const wallet = useWallet();

    useEffect(() => {
        const checkInitializer = async () => {
            setIsLoading(true);
            try {
                const provider = getProvider();
                if (provider && provider.wallet && provider.wallet.publicKey) {
                    const walletPublicKey = provider.wallet.publicKey.toString();
                    setIsInitializer(walletPublicKey === initializerPublicKey);
                } else {
                    setIsInitializer(false);
                }
            } catch (err) {
                console.error('Error checking initializer:', err);
                setError('Failed to connect to the wallet.');
                setIsInitializer(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkInitializer();
    }, [wallet.connected]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isInitializer) {
            setError('Only the initializer can create DAOs.');
            return;
        }

        const program = getProgram();
        const provider = getProvider();

        if (!program || !provider) {
            setError("Solana wallet not connected");
            return;
        }

        const daoKeypair = web3.Keypair.generate();

        try {
            await program.methods
                .createDao(name, description)
                .accounts({
                    authority: provider.wallet.publicKey,
                    dao: daoKeypair.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([daoKeypair])
                .rpc();

            onDaoCreated(daoKeypair.publicKey.toString());
            alert('DAO Created Successfully');
        } catch (err) {
            console.error('Error creating DAO:', err);
            setError(`Error creating DAO: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    if (isLoading) {
        return <p className="text-white">Checking wallet status...</p>;
    }

    if (!isInitializer) {
        return <p className="text-white">Enter Proposal Key.</p>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-black">
            <div className="bg-gradient-to-br from-black to-purple-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">Create DAO</h2>
                {isLoading ? (
                    <p className="text-white text-center">Checking wallet status...</p>
                ) : !isInitializer ? (
                    <p className="text-white text-center">Enter Proposal Key</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-purple-300 mb-2">DAO Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-300"
                        >
                            Create DAO
                        </button>
                        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateDAO;