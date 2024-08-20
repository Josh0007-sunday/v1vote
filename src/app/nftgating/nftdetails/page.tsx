"use client";
import { Connection, PublicKey } from '@solana/web3.js';
import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/fuyZ3lLserrbWFkt-xA3JJC3AY20feGa');

interface NftMetadata {
    name: string;
    uri: string;
    image: string;
    mint: string;
    traits: Record<string, any>[];
}

export const fetchNftDetails = async (mintAddress: string): Promise<NftMetadata | null> => {
    try {
        const mintPubKey = new PublicKey(mintAddress);
        const metadataPDA = await Metadata.getPDA(mintPubKey);
        const metadataAccount = await Metadata.load(connection, metadataPDA);

        const metadataResponse = await fetch(metadataAccount.data.data.uri);
        const metadataJson = await metadataResponse.json();

        return {
            name: metadataJson.name,
            uri: metadataAccount.data.data.uri,
            image: metadataJson.image,
            mint: mintAddress,
            traits: metadataJson.attributes || [],
        };
    } catch (error) {
        console.error('Error fetching NFT details:', error);
        return null;
    }
};