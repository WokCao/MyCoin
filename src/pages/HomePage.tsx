import type React from "react"
import { useEffect, useState } from "react"
import {
  faucet,
  getAllUnspent,
  getBlock,
  getConfirmedTransactions,
  getPending,
  getPorfolio,
  getTransactions,
  miningTransaction,
  sendCoin,
} from "../api/AllApis"
import { useWallet } from "../context/WalletContext"
import { useNavigate } from "react-router-dom"
import type { BlockI } from "../interface/Block"
import { formatDistanceToNow } from "date-fns"
import * as elliptic from "elliptic"
import * as CryptoJS from "crypto-js"
import type { TransactionI } from "../interface/Transaction"
import type { TxOut } from "../interface/TxOut"
import type { TransactionPagI } from "../interface/TransactionPag"
import type { ChainPagI } from "../interface/ChainPag"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ec = new elliptic.ec("secp256k1")
const FOZ_PRICE = 100.12345

const Homepage = () => {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  /** Get the total coin of the account */
  const [noc, setNoc] = useState(0)
  /** Check if adding coin is processing */
  const [isAddingCoin, setAddingCoin] = useState(false)
  /** Check if the coins for transfering are enough  */
  const [exceedBalance, setExceedBalance] = useState(false)
  /** Number of coin to transfer */
  const [coinToTransfer, setCoinToTransfer] = useState<number>()
  /** Address that will receive the coins */
  const [toAddress, setToAddress] = useState("")
  /** Check if sending coin is successful */
  const [isSendingCoinSuccessful, setSendingCoinSuccessful] = useState(false)
  /** Total current coins */
  const [marketCoin, setMarketCoin] = useState(0)
  /** Total confirmed transactions */
  const [numberOfTransaction, setNumberOfTransaction] = useState(0)
  /** Blocks in blockchain */
  const [blocks, setBlocks] = useState<BlockI[]>([])
  /** Ids of selected transactions */
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  /** Pending transaction list */
  const [pendingTransactions, setPendingTransactions] = useState<TransactionI[]>([])
  /** Confirmed transactions */
  const [confirmedTransactions, setConfirmedTransactions] = useState<TransactionI[]>([])
  /** Search query for transaction explorer */
  const [searchQuery, setSearchQuery] = useState("")
  /** Search filter type for transaction explorer */
  const [searchFilter, setSearchFilter] = useState("all")
  /** Current page of chain */
  const [currentPageChain, setCurrentPageChain] = useState(1)
  /** Total page of chain */
  const [totalPageChain, setTotalPageChain] = useState(1)
  /** Current page of transactions */
  const [currentPageTransactions, setCurrentPageTransactions] = useState(1)
  /** Total page of transactions */
  const [totalPageTransactions, setTotalPageTransactions] = useState(1)

  const { wallet } = useWallet()
  const navigate = useNavigate()

  /** Call API to get wallet's coins */
  const handleGetPorfolio = async () => {
    if (wallet) {
      const coins = await getPorfolio(wallet.address)
      setNoc(coins)
    } else {
      navigate("/wallet/access/software?type=overview")
    }
  }

  /** Call API to get free coins */
  const handleGetCoin = async () => {
    setAddingCoin(true)
    if (wallet) {
      await faucet(wallet.address, ec.keyFromPrivate(wallet.privateKey, "hex").getPublic().encode("hex", false))
      handleGetPorfolio()
      setAddingCoin(false)
    } else {
      navigate("/wallet/access/software?type=overview")
    }
  }

  /** Set error if the amount of coins exceed balance */
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = Number(e.target.value) || undefined
    setCoinToTransfer(currentValue)
    if ((currentValue && currentValue > noc) || !currentValue) {
      setExceedBalance(true)
    } else {
      setExceedBalance(false)
    }
  }

  /** Send the coins to a desired address */
  const handleSendCoin = async () => {
    if (wallet && !exceedBalance && coinToTransfer) {
      const response = await sendCoin(
        wallet.address,
        toAddress,
        coinToTransfer,
        wallet.privateKey,
        ec.keyFromPrivate(wallet.privateKey, "hex").getPublic().encode("hex", false),
      )
      if (response) {
        handleGetPorfolio()
        setToAddress("")
        setCoinToTransfer(0)
        setSendingCoinSuccessful(true)
      } else {
        setSendingCoinSuccessful(false)
      }
    }
  }

  /** Get all unspent output (total coins) */
  const handleGetUnspent = async () => {
    const data = await getAllUnspent()
    setMarketCoin(data)
  }

  const handleGetConfirmedTransactions = async () => {
    const data = await getConfirmedTransactions()
    setNumberOfTransaction(data)
  }

  /** Get all current blocks */
  const handleGetBlocks = async () => {
    const data: ChainPagI = await getBlock({ page: currentPageChain })
    setBlocks(data.blocks)
    setTotalPageChain(data.totalPages)
  }

  /** Get transactions */
  const handleGetTransactions = async () => {
    const data: TransactionPagI = await getTransactions({ page: currentPageTransactions })
    console.log(data)
    setConfirmedTransactions(data.transactions)
    setTotalPageTransactions(data.totalPages)
  }

  /** Get all pending transactions */
  const handleGetPendingTransactions = async () => {
    const data = await getPending()
    setPendingTransactions(data)
  }

  /** Get address from public key */
  const getAddresFromPublicKey = (publicKey: string) => {
    const sha256Hash = CryptoJS.SHA256(publicKey).toString()
    return sha256Hash.slice(-40)
  }

  /** Handle adding transaction when choose one */
  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId) ? prev.filter((id) => id !== transactionId) : [...prev, transactionId],
    )
  }

  /** Handle select/deselect all transactions */
  const handleSelectAll = (transactions: TransactionI[]) => {
    const allIds = transactions.map((tx) => tx.id)
    setSelectedTransactions((prev) => (prev.length === allIds.length ? [] : allIds))
  }

  /** Mine all the selected transactions */
  const handleMineSelected = async () => {
    if (selectedTransactions.length > 0 && wallet) {
      await miningTransaction(wallet.address, selectedTransactions)
      handleGetPendingTransactions()
      setSelectedTransactions([])
    }
  }

  /** Format time */
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  /** Show less character on address, transaction id,... */
  const truncateHash = (hash: string, length = 8) => {
    return `${hash.slice(0, length)}...${hash.slice(-length)}`
  }

  /** Handle from, to, value */
  const handleFromToValue = (txOuts: TxOut[], publicKey: string, type: "from" | "to" | "value" = "from") => {
    if (type === "from") {
      const filterTxOuts = txOuts.filter((txOut) => txOut.address === getAddresFromPublicKey(publicKey))
      if (filterTxOuts.length > 0) {
        return truncateHash(filterTxOuts[0].address, 6)
      } else return 'System'
    } else if (type === "to") {
      const filterTxOuts = txOuts.filter((txOut) => txOut.address !== getAddresFromPublicKey(publicKey))
      if (filterTxOuts.length > 0) {
        return truncateHash(filterTxOuts[0].address, 6)
      } else {
        return truncateHash(getAddresFromPublicKey(publicKey), 6)
      }
    } else {
      const filterTxOuts = txOuts.filter((txOut) => txOut.address !== getAddresFromPublicKey(publicKey))
      if (filterTxOuts.length > 0) {
        return filterTxOuts[0].amount
      } else {
        return txOuts[0].amount
      }
    }
  }

  /** Handle tab change */
  const handleTabChange = () => {
    switch (activeTab) {
      case "portfolio": {
        handleGetPorfolio()
        break
      }
      case "send": {
        handleGetPorfolio()
        setToAddress("")
        setCoinToTransfer(undefined)
        setSendingCoinSuccessful(true)
        break
      }
      case "mining": {
        handleGetPendingTransactions()
        setSelectedTransactions([])
        break
      }
      case "history": {
        handleGetUnspent()
        handleGetConfirmedTransactions()
        handleGetBlocks()
        handleGetTransactions()
        break
      }
      default: {
        break
      }
    }
  }

  useEffect(() => {
    setSidebarOpen(!sidebarOpen)
    handleTabChange()
  }, [activeTab])

  useEffect(() => {
    handleGetBlocks()
  }, [currentPageChain])

  useEffect(() => {
    handleGetTransactions()
  }, [currentPageTransactions])

  const menuItems = [
    {
      id: "portfolio",
      label: "Portfolio",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "faucet",
      label: "Faucet",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
    {
      id: "send",
      label: "Send",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      id: "mining",
      label: "Mining",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 2l3 3m0 0l-3 3m3-3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-6m-3-3l3 3m0 0l3-3m-3 3v12"
          />
          <circle cx="12" cy="16" r="2" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "Transaction Explorer",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "portfolio":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Overview</h1>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
              </div>
            </div>

            {/* Enhanced balance cards with gradients and better styling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="text-blue-600 text-sm font-medium">USD</div>
                </div>
                <h3 className="text-sm font-medium text-blue-700 mb-2">Total Balance</h3>
                <p className="text-2xl font-bold text-blue-900">${(noc * FOZ_PRICE).toFixed(8)}</p>
                <p className="text-sm text-blue-600 mt-1">≈ {noc.toFixed(4)} FOZ</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="text-emerald-600 text-sm font-medium">FOZ</div>
                </div>
                <h3 className="text-sm font-medium text-emerald-700 mb-2">FOZ Balance</h3>
                <p className="text-2xl font-bold text-emerald-900">{noc.toFixed(8)}</p>
                <p className="text-sm text-emerald-600 mt-1">${(noc * FOZ_PRICE).toFixed(2)} USD</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="text-amber-600 text-sm font-medium">BTC</div>
                </div>
                <h3 className="text-sm font-medium text-amber-700 mb-2">BTC Balance</h3>
                <p className="text-2xl font-bold text-amber-900">{(0).toFixed(8)}</p>
                <p className="text-sm text-amber-600 mt-1">${(0 * 120.0).toFixed(2)} USD</p>
              </div>
            </div>

            {/* Enhanced wallet address card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Wallet Address</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-sm font-mono text-gray-900 break-all">{wallet?.address}</p>
              </div>
            </div>
          </div>
        )

      case "faucet":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Token Faucet</h1>
              <p className="text-gray-600">Get free test tokens for development and testing</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Test Tokens</h2>
                <p className="text-gray-600 mb-8">Click the button below to receive test FOZ tokens in your wallet.</p>
                <button
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${isAddingCoin
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                    }`}
                  onClick={handleGetCoin}
                  disabled={isAddingCoin}
                >
                  {isAddingCoin ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Request Test Tokens"
                  )}
                </button>
              </div>
            </div>
          </div>
        )

      case "send":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Tokens</h1>
              <p className="text-gray-600">Transfer FOZ tokens to another wallet address</p>
            </div>

            {/* Enhanced balance display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Available Balance</p>
                    <p className="text-2xl font-bold text-blue-900">{noc} FOZ</p>
                    <p className="text-sm text-blue-600">${(noc * FOZ_PRICE).toFixed(2)} USD</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                  onClick={handleGetPorfolio}
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Enhanced send form */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Transfer Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="Enter wallet address (e.g., 98abvi...ytz1df)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (FOZ)</label>
                  <div className="relative">
                    <input
                      type="number"
                      className={`w-full px-4 py-3 border ${exceedBalance ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
                      value={coinToTransfer || ""}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      step="0.00000001"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 text-sm">FOZ</span>
                    </div>
                  </div>
                  {exceedBalance && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm">Insufficient balance for this transaction</p>
                    </div>
                  )}
                  {!isSendingCoinSuccessful && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm">Transaction failed. Please check your balance and try again.</p>
                    </div>
                  )}
                </div>
                <button
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendCoin}
                  disabled={!toAddress || !coinToTransfer || exceedBalance}
                >
                  Send Transaction
                </button>
              </div>
            </div>
          </div>
        )

      case "mining":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mining Pool</h1>
                <p className="text-gray-600">Select and mine pending transactions</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSelectAll(pendingTransactions)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {selectedTransactions.length === pendingTransactions.length ? "Deselect All" : "Select All"}
                </button>
                <button
                  onClick={handleMineSelected}
                  disabled={selectedTransactions.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Mine Selected ({selectedTransactions.length})
                </button>
              </div>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Pending Transactions</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Transactions will appear here when they're ready for mining. Check back later or refresh the page.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Public Key
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className={`hover:bg-gray-50 transition-colors ${selectedTransactions.includes(transaction.id) ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(transaction.id)}
                              onChange={() => handleTransactionSelect(transaction.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-blue-600">{truncateHash(transaction.id)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {truncateHash(
                                transaction.txOuts.filter(
                                  (txOut) => txOut.address === getAddresFromPublicKey(transaction.publicKey),
                                )[0].address,
                                6,
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {truncateHash(
                                transaction.txOuts.filter(
                                  (txOut) => txOut.address !== getAddresFromPublicKey(transaction.publicKey),
                                )[0].address,
                                6,
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.txOuts
                                .filter((txOut) => txOut.address !== getAddresFromPublicKey(transaction.publicKey))[0]
                                .amount.toFixed(8)}{" "}
                              FOZ
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatTimestamp(transaction.timestamp)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-500">
                              {truncateHash(transaction.publicKey, 6)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )

      case "history":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Explorer</h1>
              <p className="text-gray-600">Real-time blockchain data and transaction history</p>
            </div>

            {/* Enhanced search bar with filter dropdown */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="all">All Filters</option>
                    <option value="address">Address</option>
                    <option value="txn">Txn Hash</option>
                    <option value="block">Block</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Address / Txn Hash / Block"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    onKeyDown={(e) => e.key === "Enter"}
                  />
                </div>
                <button
                  onClick={() => { }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Enhanced metrics section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 uppercase tracking-wide font-medium">FOZ PRICE</p>
                    <p className="text-2xl font-bold text-blue-900">${FOZ_PRICE}</p>
                    <p className="text-sm text-blue-600">Live Price</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 uppercase tracking-wide font-medium">MARKET CAP</p>
                    <p className="text-2xl font-bold text-emerald-900">${(marketCoin * FOZ_PRICE).toLocaleString()}</p>
                    <p className="text-sm text-emerald-600">Total Value</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700 uppercase tracking-wide font-medium">TRANSACTIONS</p>
                    <p className="text-2xl font-bold text-purple-900">{numberOfTransaction.toLocaleString()}</p>
                    <p className="text-sm text-purple-600">Total Count</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced blocks and transactions section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latest Blocks */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Latest Blocks</h2>
                  </div>
                </div>
                <div className="p-3">
                  <div className="space-y-4">
                    {blocks.map((block, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-4 w-1/2 lg:w-1/3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 00-2 2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Block #{block.index}</p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(block.timestamp))} ago
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs lg:text-sm font-mono text-gray-900">
                            {block.index !== 0 ? truncateHash(block.minerAddress, 4) : "Genesis"}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-500">{block.transactions.length} txns</p>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs lg:text-sm font-medium">
                          {((block.index !== 0 && block.transactions[0]?.txIns?.length > 0) ? 0.01 : 0).toFixed(2)} FOZ
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPageChain > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Page {currentPageChain} of {totalPageChain}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPageChain(Math.max(1, currentPageChain - 1))}
                          disabled={currentPageChain === 1}
                          className="p-1 font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center space-x-1">
                          {totalPageChain <= 5
                            ?
                            Array.from({ length: totalPageChain }, (_, i) => {
                              const pageNum = i + 1
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPageChain(pageNum)}
                                  className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${currentPageChain === pageNum ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })
                            : // Show first, middle 3, and last pages when more than 5
                            (() => {
                              const pages = []
                              const startMiddle = Math.max(2, Math.min(currentPageChain - 1, totalPageChain - 3))
                              const endMiddle = Math.min(totalPageChain - 1, startMiddle + 2)

                              // First page
                              pages.push(
                                <button
                                  key={1}
                                  onClick={() => setCurrentPageChain(1)}
                                  className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${currentPageChain === 1 ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                  1
                                </button>,
                              )

                              // Ellipsis
                              if (startMiddle > 2) {
                                pages.push(
                                  <span key="ellipsis1" className="px-2 text-gray-400">
                                    ...
                                  </span>,
                                )
                              }

                              // Middle pages
                              for (let i = startMiddle; i <= endMiddle; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => setCurrentPageChain(i)}
                                    className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${currentPageChain === i ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                                      }`}
                                  >
                                    {i}
                                  </button>,
                                )
                              }

                              // Ellipsis
                              if (endMiddle < totalPageChain - 1) {
                                pages.push(
                                  <span key="ellipsis2" className="px-2 text-gray-400">
                                    ...
                                  </span>,
                                )
                              }

                              // Last page
                              if (totalPageChain > 1) {
                                pages.push(
                                  <button
                                    key={totalPageChain}
                                    onClick={() => setCurrentPageChain(totalPageChain)}
                                    className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${currentPageChain === totalPageChain
                                      ? "bg-blue-600 text-white"
                                      : "text-gray-500 hover:bg-gray-50"
                                      }`}
                                  >
                                    {totalPageChain}
                                  </button>,
                                )
                              }

                              return pages
                            })()}
                        </div>
                        <button
                          onClick={() => setCurrentPageChain(Math.min(totalPageChain, currentPageChain + 1))}
                          disabled={currentPageChain === totalPageChain}
                          className="p-1 font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Latest Transactions */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Latest Transactions</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {confirmedTransactions.map((tx, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16l-4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 font-mono text-xs lg:text-sm">{truncateHash(tx.id, 4)}</p>
                            <p className="text-xs lg:text-sm text-gray-500">{formatDistanceToNow(new Date(tx.timestamp))} ago</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs lg:text-sm text-gray-500">
                            <span className="font-mono">{handleFromToValue(tx.txOuts, tx.publicKey, "from")}</span>
                          </p>
                          <p className="text-xs lg:text-sm text-gray-500">
                            → <span className="font-mono">{handleFromToValue(tx.txOuts, tx.publicKey, "to")}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 text-xs lg:text-base">
                            {Number(handleFromToValue(tx.txOuts, tx.publicKey, "value")).toFixed(4)} FOZ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPageTransactions > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Page {currentPageTransactions} of {totalPageTransactions}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPageTransactions(Math.max(1, currentPageTransactions - 1))}
                          disabled={currentPageTransactions === 1}
                          className="p-1 text-xs lg:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center space-x-1">
                          {totalPageTransactions <= 5
                            ?
                            Array.from({ length: totalPageTransactions }, (_, i) => {
                              const pageNum = i + 1
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPageTransactions(pageNum)}
                                  className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${currentPageTransactions === pageNum ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })
                            : // Show first, middle 3, and last pages when more than 5
                            (() => {
                              const pages = []
                              const startMiddle = Math.max(2, Math.min(currentPageTransactions - 1, totalPageTransactions - 3))
                              const endMiddle = Math.min(totalPageTransactions - 1, startMiddle + 2)

                              // First page
                              pages.push(
                                <button
                                  key={1}
                                  onClick={() => setCurrentPageTransactions(1)}
                                  className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${currentPageTransactions === 1 ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                  1
                                </button>,
                              )

                              // Ellipsis
                              if (startMiddle > 2) {
                                pages.push(
                                  <span key="ellipsis1" className="px-2 text-gray-400">
                                    ...
                                  </span>,
                                )
                              }

                              // Middle pages
                              for (let i = startMiddle; i <= endMiddle; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => setCurrentPageTransactions(i)}
                                    className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${currentPageTransactions === i ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                                      }`}
                                  >
                                    {i}
                                  </button>,
                                )
                              }

                              // Ellipsis
                              if (endMiddle < totalPageTransactions - 1) {
                                pages.push(
                                  <span key="ellipsis2" className="px-2 text-gray-400">
                                    ...
                                  </span>,
                                )
                              }

                              // Last page
                              if (totalPageTransactions > 1) {
                                pages.push(
                                  <button
                                    key={totalPageTransactions}
                                    onClick={() => setCurrentPageTransactions(totalPageTransactions)}
                                    className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${currentPageTransactions === totalPageTransactions
                                      ? "bg-blue-600 text-white"
                                      : "text-gray-500 hover:bg-gray-50"
                                      }`}
                                  >
                                    {totalPageTransactions}
                                  </button>,
                                )
                              }

                              return pages
                            })()}
                        </div>
                        <button
                          onClick={() => setCurrentPageTransactions(Math.min(totalPageTransactions, currentPageTransactions + 1))}
                          disabled={currentPageTransactions === totalPageTransactions}
                          className="p-1 font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Select a menu item</div>
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Enhanced backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">MCW</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === item.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 w-full overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  )
}

export default Homepage
