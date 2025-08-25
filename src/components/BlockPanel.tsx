import type { BlockI } from "../interface/Block"
import type { TransactionI } from "../interface/Transaction"

const BlockPanel = ({
    block,
    isOpen,
    onClose,
    onTransactionClick,
}: {
    block: BlockI | null
    isOpen: boolean
    onClose: () => void
    onTransactionClick: (transaction: TransactionI) => void
}) => {
    if (!block) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-10 ${isOpen ? "opacity-30" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Block Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-[90%] bg-white shadow-xl transform transition-transform duration-300 z-20 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Block #{block.index}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-scroll h-[90%]">
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-4">{new Date(block.timestamp).toLocaleString()}</p>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Hash</p>
                                <p className="font-mono text-sm text-gray-900 break-all">{block.hash}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Previous Hash</p>
                                <p className="font-mono text-sm text-gray-900 break-all">{block.previousHash}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Miner Address</p>
                                <p className="font-mono text-sm text-gray-900 break-all">{block.minerAddress}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Nonce</p>
                                    <p className="font-mono text-sm text-gray-900">{block.nonce}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Difficulty</p>
                                    <p className="font-mono text-sm text-gray-900">{block.difficulty}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions ({block.transactions.length})</h3>
                            <div className="space-y-3">
                                {block.transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-mono text-sm text-gray-900">{tx.id}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {tx.txOuts.length} outputs • {new Date(tx.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onTransactionClick(tx)}
                                            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            View Details
                                        </button>
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

export default BlockPanel;