"use client";

import { Program, AnchorProvider, web3, Wallet } from '@project-serum/anchor';
import { Connection, PublicKey, Commitment } from '@solana/web3.js';
import idl from './idl.json';

const programID = new PublicKey('AYeEDK27myF9FbFyULmKMWFZCMEzxyhzRUMwrcvaXAdZ');
const network = 'https://api.devnet.solana.com';
const opts: { preflightCommitment: Commitment } = { preflightCommitment: 'processed' };

export const getProvider = () => {
    if (typeof window === 'undefined' || !window.solana) {
        return null;
    }
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana as Wallet, opts);
    return provider;
};

export const getProgram = () => {
    const provider = getProvider();
    if (!provider) return null;
    const program = new Program(idl as any, programID, provider);
    return program;
};