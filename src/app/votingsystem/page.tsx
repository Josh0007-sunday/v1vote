import { useState } from 'react';
import dynamic from 'next/dynamic';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const CastVote = dynamic(() => import('../component/castvote/page'), { ssr: false });
const CheckOwnershipBtn = dynamic(() => import('../nftgating/checkmain/page'), { ssr: false });
const CreateDAO = dynamic(() => import('../component/createdao/page'), { ssr: false });
const CreateProposal = dynamic(() => import('../component/proposal/page'), { ssr: false });

const VotingSystem = () => {
    const [daoPublicKey, setDaoPublicKey] = useState<string | undefined>(undefined);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="flex justify-between items-center p-4 bg-purple-800">
                <div className="flex items-center space-x-4">
                    <img src="/logo.png" alt="Logo" className="h-8" /> {/* Replace with your logo */}
                    <h1 className="text-xl font-bold">Solana Voting System</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="text-white hover:underline">Home</button>
                    <button className="text-white hover:underline">Proposals</button>
                    <button className="text-white hover:underline">About</button>
                    <WalletMultiButton />
                </div>
            </nav>

            <div className="flex flex-col">
                {!daoPublicKey ? (
                    <CreateDAO onDaoCreated={setDaoPublicKey} />
                ) : (
                    <CreateProposal daoPublicKey={daoPublicKey} />
                )}

                <CheckOwnershipBtn />
            </div>
        </div>
    );
};

export default VotingSystem;
