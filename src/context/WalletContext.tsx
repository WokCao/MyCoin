import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface WalletStoreI {
  privateKey: string;
  publicKey: string;
  address: string;
  type: 'mnemonic' | 'keystore' | 'privateKey';

  mnemonic?: string;
  passphrase?: string;

  keystoreData?: {
    ciphertext: string;
    algo: string;
  };
}

interface WalletContextType {
  wallet: WalletStoreI | null;
  createWallet: (data: WalletStoreI) => void;
  accessWallet: (data: WalletStoreI) => void;
  accessWalletFromKeystore: (privateKey: string, address: string, keystoreData?: any) => void;
  accessWalletFromPrivateKey: (privateKey: string, address: string, publicKey: string) => void;
  clearWallet: () => void;
  isWalletConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletStoreI | null>(null);

  const createWallet = (data: WalletStoreI) => {
    setWallet(data);
  };

  const accessWallet = (data: WalletStoreI) => {
    setWallet(data);
  };

  const clearWallet = () => {
    setWallet(null);
  };

  const accessWalletFromKeystore = (privateKey: string, address: string, keystoreData?: any) => {
    const walletData: WalletStoreI = {
      privateKey,
      publicKey: '',
      address,
      type: 'keystore',
      keystoreData
    };
    setWallet(walletData);
  };

  const accessWalletFromPrivateKey = (privateKey: string, address: string, publicKey: string) => {
    const walletData: WalletStoreI = {
      privateKey,
      publicKey,
      address,
      type: 'privateKey'
    };
    setWallet(walletData);
  };

  const isWalletConnected = !!wallet;

  return (
    <WalletContext.Provider
      value={{
        wallet,
        createWallet,
        accessWallet,
        accessWalletFromKeystore,
        accessWalletFromPrivateKey,
        clearWallet,
        isWalletConnected
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};