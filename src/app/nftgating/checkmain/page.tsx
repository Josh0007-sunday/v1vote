import React, { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { checkOwnership } from '../checkowner/page';
import { fetchNftDetails } from '../nftdetails/page';
import CastVote from '@/app/component/castvote/page';

interface NftMetadata {
    name: string;
    uri: string;
    image: string;
    mint: string;
    traits: Record<string, any>[];
}

const CheckOwnershipBtn: React.FC = () => {
    const { publicKey, connected } = useWallet();
    const [nftDetails, setNftDetails] = useState<NftMetadata | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleCheckOwnership = useCallback(async () => {
        setError(null);
        setLoading(true);

        if (publicKey) {
            try {
                const ownedNftMintAddress = await checkOwnership(publicKey.toString());
                if (ownedNftMintAddress) {
                    const nft = await fetchNftDetails(ownedNftMintAddress);
                    setNftDetails(nft);
                } else {
                    setNftDetails(null);
                }
            } catch (checkError) {
                setError('Error checking NFT ownership');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Wallet not connected');
            setLoading(false);
        }
    }, [publicKey]);

    useEffect(() => {
        if (publicKey && connected) {
            handleCheckOwnership();
        }
    }, [publicKey, connected, handleCheckOwnership]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
            <div className="flex space-x-4 bg-gray-800 p-6 rounded-xl shadow-lg max-w-4xl w-full">
                <div className="bg-gradient-to-br from-gray-800 to-purple-900 p-6 rounded-lg shadow-lg flex-1 max-w-xs text-white">
                    {loading && <div className="text-white text-center">Loading...</div>}
                    {nftDetails ? (
                        <>
                            <h1 className="text-2xl font-bold mb-4 text-center">{nftDetails.name}</h1>
                            <img src={nftDetails.image} alt={nftDetails.name} className="w-48 h-48 mx-auto mb-6 rounded-lg shadow-md" />
                            <div className="space-y-2">
                                <p><span className="font-semibold">Mint Address:</span> {nftDetails.mint}</p>
                                <p><span className="font-semibold">URI:</span> {nftDetails.uri}</p>
                                <div className="mt-4">
                                    <h2 className="text-lg font-bold mb-2">Traits:</h2>
                                    <ul className="grid grid-cols-2 gap-2">
                                        {nftDetails.traits.map((trait, index) => (
                                            <li key={index} className="text-sm bg-purple-800 p-2 rounded-lg">
                                                <span className="font-medium">{trait.trait_type}:</span> {trait.value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        !loading && <div className="text-red-400 text-center">User does not own any NFT from the collection</div>
                    )}
                    {error && <div className="text-red-400 mt-4 text-center">{error}</div>}
                </div>
                <div className=" flex-1 max-w-xs text-white">
                    {nftDetails ? (
                        <CastVote />
                    ) : (
                        <div className="text-center text-yellow-300">
                            You need to own an NFT from the collection to cast a vote.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckOwnershipBtn;
