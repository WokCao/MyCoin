import { AlertTriangle, FileCode, FileText } from "lucide-react"
import Header from "../components/Header"
import { Link } from "react-router-dom";
const CreateOverviewPage = () => {
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
                            <Link to='/wallet/access' className="text-blue-200 underline hover:text-white transition-colors">
                                Access Wallet
                            </Link>
                        </p>
                    </div>

                    {/* Keystore File Option */}
                    <div className="bg-transparent border border-white/30 rounded-lg p-6 hover:border-white hover:bg-white/20 transition-colors hover:cursor-pointer">
                        <Link to='/wallet/create/keystore'>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <FileCode className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-lg mb-2">Keystore File</h3>
                                    <p className="text-blue-100 text-sm leading-relaxed">
                                        Using a Keystore file online makes your wallet more vulnerable to loss of funds. We don't recommend this
                                        method of wallet creation.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Mnemonic Phrase Option */}
                    <div className="bg-transparent border border-white/30 rounded-lg p-6 hover:border-white hover:bg-white/20 transition-colors hover:cursor-pointer">
                        <Link to='/wallet/create/mnemonic'>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-lg mb-2">Mnemonic Phrase</h3>
                                    <p className="text-blue-100 text-sm leading-relaxed">
                                        Using a Mnemonic Phrase online makes your wallet more vulnerable to loss of funds. We don't recommend
                                        this method of wallet creation.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Back Button */}
                    <Link to='/wallet/create'>
                        <div className="flex justify-center pt-2">
                            <button
                                className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-2 border rounded-lg hover:cursor-pointer"
                            >
                                Back To Create Wallet
                            </button>
                        </div>
                    </Link>
                </div>
            </div>
            
            {/* Warning Banner */}
            <div className="bg-yellow-100 border-t border-yellow-200 p-4">
                <div className="max-w-4xl mx-auto flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="font-semibold text-gray-900 mb-1">NOT RECOMMENDED</div>
                        <p className="text-gray-700 text-sm">
                            This information is sensitive, and these options should only be used in offline settings by experienced
                            crypto users.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateOverviewPage;
