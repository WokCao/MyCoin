import { ShieldAlert } from "lucide-react";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const CreateWalletPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex flex-col">
            {/* Header with coin icon and MCW text */}
            <Header />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center text-white space-y-2">
                        <h1 className="text-2xl font-bold">Create a new wallet</h1>
                        <p className="text-blue-100">Please select a method to create a new wallet</p>
                        <p className="text-sm">
                            Already have a wallet?{" "}
                            <a href="#" className="text-blue-200 underline hover:text-white transition-colors">
                                Access Wallet
                            </a>
                        </p>
                    </div>

                    {/* Wallet Options */}
                    <div className="space-y-4">
                        {/* Hardware Wallet Option - Disabled */}
                        <div className="bg-white rounded-lg p-4 opacity-50 cursor-not-allowed">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">Buy a hardware wallet</h3>
                                    <p className="text-sm text-gray-600">
                                        For the highest standard of security, buy a hardware wallet and use it with MCW
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Software Option */}
                        <Link to='/wallet/create/overview'>
                            <div className="rounded-lg p-4 border border-blue-300 relative hover:cursor-pointer hover:border-white hover:bg-white/20 transition-colors">
                                <div className="absolute top-3 right-3">
                                    <span className=" text-orange-400 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                                        <ShieldAlert />
                                        <span>NOT RECOMMENDED</span>
                                    </span>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white mb-1">Software</h3>
                                        <p className="text-sm text-blue-100 line-clamp-3">
                                            Software methods like Keystore File and Mnemonic Phrase should only be used in offline settings by
                                            experienced users
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default CreateWalletPage;