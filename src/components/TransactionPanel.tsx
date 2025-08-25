import type { TransactionI } from "../interface/Transaction"

const TransactionPanel = ({
    transaction,
    isOpen,
    onClose,
}: {
    transaction: TransactionI | null
    isOpen: boolean
    onClose: () => void
}) => {
    if (!transaction) return null

    return (
        <>
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-30 ${isOpen ? "opacity-30" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            <div
                className={`fixed top-0 right-0 h-full w-[80%] bg-white shadow-xl transform transition-transform duration-300 z-40 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-scroll h-[90%]">
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Transaction ID</p>
                            <p className="font-mono text-sm text-gray-900 break-all">{transaction.id}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Public Key</p>
                            <p className="font-mono text-sm text-gray-900 break-all">{transaction.publicKey}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Timestamp</p>
                            <p className="text-sm text-gray-900">{new Date(transaction.timestamp).toLocaleString()}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inputs ({transaction.txIns.length})</h3>
                            <div className="space-y-3">
                                {transaction.txIns.map((txIn, index) => (
                                    <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Output ID</p>
                                        <p className="font-mono text-sm text-gray-900 break-all mb-2">{txIn.txOutId}</p>
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Index</p>
                                                <p className="text-sm text-gray-900">{txIn.txOutIndex}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500">Signature</p>
                                                <p className="font-mono text-xs text-gray-900 break-all">{txIn.signature}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Outputs ({transaction.txOuts.length})</h3>
                            <div className="space-y-3">
                                {transaction.txOuts.map((txOut, index) => (
                                    <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                                                <p className="font-mono text-sm text-gray-900 break-all">{txOut.address}</p>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Amount</p>
                                                <p className="text-lg font-semibold text-green-600">{txOut.amount}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">TX Index</p>
                                            <p className="text-sm text-gray-900">{txOut.txIndex}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TransactionPanel;