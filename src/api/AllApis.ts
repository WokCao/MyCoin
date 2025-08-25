import axios from "axios"
import type { TransactionI } from "../interface/Transaction";
import type { TransactionPagI } from "../interface/TransactionPag";
import type { ChainPagI } from "../interface/ChainPag";
import type { UnspentTxOI } from "../interface/UnspentTxO";
const BASE_URL = "http://localhost:3000";

export const getPorfolio = async (address: string): Promise<number> => {
    try {
        const res = await axios.get(`${BASE_URL}/address/${address}/balance`);
        const balance = res.data.balance || 0;

        return balance
    } catch (err) {
        // console.error("Failed to fetch portfolio", err);
        return 0
    }
}

export const faucet = async (address: string, publicKey: string, amount = 50) => {
    try {
        const res = await axios.post(`${BASE_URL}/faucet`, { address, amount, publicKey });
        return res.data;
    } catch (err) {
        // console.error("Faucet error:", err);
        throw err;
    }
};

export const getBlock = async ({ page = 1 }: { page?: number }): Promise<ChainPagI> => {
    try {
        const res = await axios.get(`${BASE_URL}/chain?page=${page}`)

        return res.data
    } catch (err) {
        // console.error("Failed to fetch blocks", err)
        return {
            blocks: [],
            currentPage: 1,
            totalPages: 1,
            totalBlocks: 0
        }
    }
}

export const sendCoin = async (transaction: TransactionI): Promise<boolean> => {
    try {
        await axios.post(`${BASE_URL}/send`, transaction, {
            headers: { "Content-Type": "application/json" }
        });
        return true
    } catch (err) {
        // console.error("Failed to send coins", err)
        return false
    }
}

export const getPending = async (): Promise<TransactionI[]> => {
    try {
        const res = await axios.get(`${BASE_URL}/pending`)
        return res.data
    } catch (err) {
        // console.error("Failed to get pending transactions", err)
        return []
    }
}

export const miningTransaction = async (minerAddress: string, txIds: string[]) => {
    try {
        const res = await axios.post(`${BASE_URL}/mineSelected`, { minerAddress, txIds })
        return res.data
    } catch (err) {
        // console.error("Failed to mine transactions", err)
    }
}

export const getAllUnspent = async (): Promise<number> => {
    try {
        const res = await axios.get(`${BASE_URL}/unspent`)
        return res.data
    } catch (err) {
        return 0
    }
}

export const getAvailableUnspent = async (address: string): Promise<UnspentTxOI[]> => {
    try {
        const res = await axios.get(`${BASE_URL}/unspent/${address}`)
        return res.data
    } catch (err) {
        return []
    }
}

export const getConfirmedTransactions = async (): Promise<number> => {
    try {
        const res = await axios.get(`${BASE_URL}/confirmedTransactions`)
        return res.data
    } catch (err) {
        return 0
    }
}

export const getTransactions = async ({ page = 1 }: { page?: number }): Promise<TransactionPagI> => {
    try {
        const res = await axios.get(`${BASE_URL}/transactions?page=${page}`)
        return res.data as TransactionPagI
    } catch (err) {
        return {
            transactions: [],
            currentPage: 1,
            totalPages: 1,
            totalTransactions: 0
        }
    }
}