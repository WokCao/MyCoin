export interface TransactionI {
    id: string;
    txIns: {
        txOutId: string;
        txOutIndex: number;
        signature: string;
    }[];
    txOuts: {
        address: string;
        amount: number;
    }[];
    publicKey: string;
    timestamp: number;
}