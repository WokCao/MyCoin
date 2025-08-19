import { FileText, Key, AlertTriangle, FileJson } from "lucide-react"
import type { JSX } from "react";
import { Link } from "react-router-dom"

const AccessOverview = ({ header }: { header: JSX.Element }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
            <div className="w-full max-w-lg p-6 rounded-lg bg-white">
                <div className="text-center mb-8">
                    <h1 className="text-lg lg:text-2xl font-bold text-gray-900 mb-2">Select Software Wallet</h1>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="px-4 py-10 hover:shadow-md transition-shadow cursor-pointer rounded-lg border border-gray-200">
                        <div className="w-full">
                            <Link to='/wallet/access/software?type=keystore'>
                                <div className="flex items-center justify-between gap-4 w-full">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Keystore</h3>
                                    </div>
                                    <div className="p-2 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <FileJson className="w-6 h-6 text-teal-600" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="px-4 py-10 hover:shadow-md transition-shadow cursor-pointer rounded-lg border border-gray-200">
                        <div className="w-full">
                            <Link to='/wallet/access/software?type=mnemonic'>
                                <div className="flex items-center justify-between gap-4 w-full">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Mnemonic Phrase</h3>
                                    </div>
                                    <div className="p-2 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-teal-600" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="px-4 py-10 hover:shadow-md transition-shadow cursor-pointer rounded-lg border border-gray-200">
                        <div className="w-full">
                            <div className="flex items-center justify-between gap-4 w-full">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Private Key</h3>
                                </div>
                                <div className="p-2 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Key className="w-6 h-6 text-teal-600" />
                                </div>
                            </div>
                        </div>
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

            {header}
        </div>
    )
}

export default AccessOverview;