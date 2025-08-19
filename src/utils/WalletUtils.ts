import * as bip39 from "bip39";
import CryptoJS from "crypto-js";
import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");

export const generateMnemonic = (wordCount: 12 | 24 = 12) => {
    const strength = wordCount === 12 ? 128 : 256;
    return bip39.generateMnemonic(strength);
};

// Hàm tạo ví từ mnemonic + passphrase
export const generateWallet = async (mnemonic: string, passphrase: string) => {
    // Derive seed
    const seedBuffer = await bip39.mnemonicToSeed(mnemonic.trim(), passphrase.trim());
    const seedHex = seedBuffer.toString("hex");

    // Lấy private key = 32 bytes đầu
    const privateKey = seedHex.slice(0, 64);

    // Derive public key
    const keyPair = ec.keyFromPrivate(privateKey);
    const publicKey = keyPair.getPublic("hex");

    // Hash public key → address
    const address = CryptoJS.SHA256(publicKey).toString().slice(-40);

    return {
        privateKey,
        publicKey,
        address,
        type: 'mnemonic' as const,
        mnemonic,
        passphrase,
    };
};

// Hàm dùng để truy cập ví từ mnemonic + passphrase
export const accessWalletWithMnemonic = async (mnemonic: string, passphrase: string) => {
    // Có thể validate mnemonic trước
    const isValid = bip39.validateMnemonic(mnemonic.trim());
    if (!isValid) {
        throw new Error("Invalid mnemonic phrase");
    }

    // Gọi lại generateWallet
    return await generateWallet(mnemonic, passphrase);
};