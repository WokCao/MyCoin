import type { TransactionI } from "./Transaction";

export interface TransactionPagI {
    transactions: TransactionI[];
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
}