import type { TransactionI } from "./Transaction";

export interface BlockI {
    index: number;
    timestamp: number;
    transactions: TransactionI[];
    previousHash: string;
    nonce: number;
    difficulty: number;
    hash: string;
    minerAddress: string;
}