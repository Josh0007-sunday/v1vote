"use client";
import { Connection, PublicKey } from '@solana/web3.js';
import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;

const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/fuyZ3lLserrbWFkt-xA3JJC3AY20feGa');
const nftCollectionAddress = new PublicKey('8TtouGqvJfjPKRkDVJVw7vN3qk6SM3E8D8iFj72KrKAv');

export async function checkOwnership(walletAddress: string): Promise<string | null> {
    try {
        console.log(`Checking ownership for wallet: ${walletAddress}`);
        const tokenAccounts = await connection.getTokenAccountsByOwner(new PublicKey(walletAddress), {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        });

        console.log('Token accounts retrieved:', tokenAccounts.value.length);

        for (const account of tokenAccounts.value) {
            console.log('Checking token account:', account.pubkey.toString());
            const accountInfo = await connection.getParsedAccountInfo(account.pubkey);

            if (!accountInfo.value) {
                console.log('No account info found for:', account.pubkey.toString());
                continue;
            }

            const parsedAccountInfo = accountInfo.value.data;
            if (!('parsed' in parsedAccountInfo)) {
                console.log('Account data not parsed for:', account.pubkey.toString());
                continue;
            }

            const mintAddress = new PublicKey(parsedAccountInfo.parsed.info.mint);
            console.log('Mint address:', mintAddress.toString());
            
            let metadataPDA;
            try {
                metadataPDA = await Metadata.getPDA(mintAddress);
                console.log('Metadata PDA:', metadataPDA.toString());
            } catch (error) {
                console.error('Error getting metadata PDA for mint address:', mintAddress.toString(), error);
                continue;
            }
            
            let metadataAccount;
            try {
                metadataAccount = await Metadata.load(connection, metadataPDA);
                console.log('Metadata account loaded:', metadataAccount.pubkey.toString());
            } catch (error) {
                console.error('Error loading metadata for PDA:', metadataPDA.toString(), error);
                continue;
            }

            if (metadataAccount.data.collection?.verified && new PublicKey(metadataAccount.data.collection.key).equals(nftCollectionAddress)) {
                console.log('NFT from the collection found:', metadataAccount.data.collection.key);
                return mintAddress.toString();
            }
        }
        console.log('No NFT from the collection found.');
        return null;
    } catch (error) {
        console.error('Error checking NFT ownership:', error);
        throw new Error('Internal server error');
    }
}