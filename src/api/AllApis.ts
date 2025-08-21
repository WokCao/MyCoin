import axios from "axios"
import type { BlockI } from "../interface/Block";
import type { TransactionI } from "../interface/Transaction";
const BASE_URL = "http://localhost:3000";

export const getPorfolio = async (address: string): Promise<number> => {
    try {
        const res = await axios.get(`${BASE_URL}/address/${address}/balance`);
        const balance = res.data.balance || 0;

        return balance
    } catch (err) {
        console.error("Failed to fetch portfolio", err);
        return 0
    }
}

export const faucet = async (address: string, publicKey: string, amount = 50) => {
    try {
        const res = await axios.post(`${BASE_URL}/faucet`, { address, amount, publicKey });
        return res.data;
    } catch (err) {
        console.error("Faucet error:", err);
        throw err;
    }
};

export const getBlock = async (): Promise<BlockI[]> => {
    try {
        const res = await axios.get(`${BASE_URL}/chain`)

        return res.data
    } catch (err) {
        console.error("Failed to fetch blocks", err)
        return []
    }
}

export const sendCoin = async (fromAddress: string, toAddress: string, amount: number, privateKey: string, publicKey: string) => {
    try {
        const body = {
            fromAddress,
            toAddress,
            amount,
            privateKey,
            publicKey
        }
        const res = await axios.post(`${BASE_URL}/send`, body)
        return res.data
    } catch (err) {
        console.error("Failed to send coins", err)
    }
}

export const getPending = async (): Promise<TransactionI[]> => {
    try {
        const res = await axios.get(`${BASE_URL}/pending`)
        return res.data
    } catch (err) {
        console.error("Failed to get pending transactions", err)
        return []
    }
}

export const miningTransaction = async (minerAddress: string, txIds: string[]) => {
    try {
        const res = await axios.post(`${BASE_URL}/mineSelected`, { minerAddress, txIds })
        return res.data
    } catch (err) {
        console.error("Failed to mine transactions", err)
    }
}