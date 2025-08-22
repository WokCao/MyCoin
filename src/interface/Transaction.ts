import type { TxIn } from "./TxIn";
import type { TxOut } from "./TxOut";

export interface TransactionI {
    id: string;
    txIns: TxIn[];
    txOuts: TxOut[];
    publicKey: string;
    timestamp: number;
}