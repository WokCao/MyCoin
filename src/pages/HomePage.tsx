import { useEffect, useState } from "react"
import { faucet, getBlock, getPending, getPorfolio, sendCoin } from "../api/AllApis"
import { useWallet } from "../context/WalletContext"
import { useNavigate } from "react-router-dom"
import type { BlockI } from "../interface/Block"
import { formatDistanceToNow } from 'date-fns'
import * as elliptic from "elliptic";
import * as CryptoJS from "crypto-js";
import type { TransactionI } from "../interface/Transaction"

const ec = new elliptic.ec("secp256k1");

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
  const [toAddress, setToAddress] = useState('')
  const [marketCoin, setMarketCoin] = useState(0)
  const [numberOfTransaction, setNumberOfTransaction] = useState(0)
  const [blocks, setBlocks] = useState<BlockI[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<TransactionI[]>([])

  const { wallet } = useWallet()
  const navigate = useNavigate()

  /** Call API to get wallet's coins */
  const handleGetPorfolio = async () => {
    if (wallet) {
      const coins = await getPorfolio(wallet.address)
      setNoc(coins)
    } else {
      navigate('/wallet/access/software?type=overview')
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
      navigate('/wallet/access/software?type=overview')
    }
  }

  /** Set error if the amount of coins exceed balance */
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = Number(e.target.value) || undefined
    setCoinToTransfer(currentValue)
    if (currentValue && currentValue > noc) {
      setExceedBalance(true)
    } else {
      setExceedBalance(false)
    }
  }

  /** Send the coins to a desired address */
  const handleSendCoin = async () => {
    if (wallet && !exceedBalance && coinToTransfer) {
      await sendCoin(wallet.address, toAddress, coinToTransfer, wallet.privateKey, ec.keyFromPrivate(wallet.privateKey, "hex").getPublic().encode("hex", false))
    }
  }

  const handleGetBlocks = async () => {
    const data = await getBlock()
    setBlocks(data)
  }

  const handleGetPendingTransactions = async () => {
    const data = await getPending()
    setPendingTransactions(data)
  }

  const getAddresFromPublicKey = (publicKey: string) => {
    const sha256Hash = CryptoJS.SHA256(publicKey).toString();
    return sha256Hash.slice(-40);
  }

  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(transactionId) ? prev.filter((id) => id !== transactionId) : [...prev, transactionId],
    )
  }

  const handleSelectAll = (transactions: TransactionI[]) => {
    const allIds = transactions.map((tx) => tx.id)
    setSelectedTransactions((prev) => (prev.length === allIds.length ? [] : allIds))
  }

  const handleMineSelected = () => {
    if (selectedTransactions.length > 0) {
      // Handle mining logic here
      console.log("Mining transactions:", selectedTransactions)
    }
  }

  const handleValidateSelected = () => {
    if (selectedTransactions.length > 0) {
      // Handle validation logic here
      console.log("Validating transactions:", selectedTransactions)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const truncateHash = (hash: string, length = 8) => {
    return `${hash.slice(0, length)}...${hash.slice(-length)}`
  }

  useEffect(() => {
    handleGetPorfolio()
    setSidebarOpen(!sidebarOpen)
    handleGetBlocks()
    handleGetPendingTransactions()
  }, [activeTab])

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
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "portfolio":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Balance</h3>
                <p className="text-2xl font-bold text-gray-900">${(noc * 100.12345).toFixed(8)}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">FOZ Balance</h3>
                <p className="text-2xl font-bold text-gray-900">{noc.toFixed(8)} FOZ</p>
                <p className="text-sm text-gray-500 mt-1">= ${(noc * 100.12345).toFixed(8)}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">BTC Balance</h3>
                <p className="text-2xl font-bold text-gray-900">{(0).toFixed(8)} BTC</p>
                <p className="text-sm text-gray-500 mt-1">= ${(0 * 100).toFixed(8)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Wallet Address</h3>
                <p className="text-lg font-bold text-gray-900">{wallet?.address}</p>
              </div>
            </div>
          </div>
        )

      case "faucet":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Faucet</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Get Test Tokens</h2>
              <p className="text-gray-600 mb-6">Request test tokens for development and testing purposes.</p>
              <button className={`px-6 py-2 rounded-lg transition-colors ${isAddingCoin ? 'hover:cursor-not-allowed bg-gray-400 text-black' : 'hover:cursor-pointer bg-blue-600 hover:bg-blue-700 text-white'}`} onClick={handleGetCoin} disabled={isAddingCoin}>
                Request Tokens
              </button>
            </div>
          </div>
        )

      case "send":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Send</h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Balance</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">FOZ Balance</p>
                    <p className="text-xl font-bold text-gray-900">{noc} FOZ</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:cursor-pointer" onClick={handleGetPorfolio}>Refresh</button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Tokens</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder={toAddress === '' ? '98abvi...ytz1df' : undefined}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    className={`w-full px-3 py-2 border ${exceedBalance ? 'border-red-700' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={coinToTransfer}
                    onChange={handleAmountChange}
                    placeholder={!coinToTransfer ? '0' : undefined}
                  />
                  {exceedBalance && (<p className="text-xs text-red-600 my-1">Not enough balance to send</p>)}
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={handleSendCoin}>
                  Send Transaction
                </button>
              </div>
            </div>
          </div>
        )


      case "mining":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mining Pool</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSelectAll(pendingTransactions)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedTransactions.length === pendingTransactions.length ? "Deselect All" : "Select All"}
                </button>
                <button
                  onClick={handleValidateSelected}
                  disabled={selectedTransactions.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Validate Selected ({selectedTransactions.length})
                </button>
                <button
                  onClick={handleMineSelected}
                  disabled={selectedTransactions.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mine Selected ({selectedTransactions.length})
                </button>
              </div>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Available</h3>
                <p className="text-gray-500">Transactions will appear here when they're ready for mining.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Public Key
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className={`hover:bg-gray-50 ${selectedTransactions.includes(transaction.id) ? "bg-blue-50" : ""}`}
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
                            <div className="text-sm font-mono text-gray-900">{truncateHash(transaction.id)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {truncateHash(transaction.txOuts.filter(txOut => txOut.address === getAddresFromPublicKey(transaction.publicKey))[0].address, 6)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {truncateHash(transaction.txOuts.filter(txOut => txOut.address !== getAddresFromPublicKey(transaction.publicKey))[0].address, 6)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {(transaction.txOuts.filter(txOut => txOut.address !== getAddresFromPublicKey(transaction.publicKey))[0].amount).toFixed(8)} FOZ
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatTimestamp(transaction.timestamp)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-500">{truncateHash(transaction.publicKey, 6)}</div>
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
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Transaction Explorer</h1>

            {/* Top Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">FOZ PRICE</p>
                    <p className="text-lg font-bold text-gray-900">$100.00</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">MARKET CAP</p>
                    <p className="text-lg font-bold text-gray-900">${marketCoin * 100}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">TRANSACTIONS</p>
                    <p className="text-lg font-bold text-gray-900">{numberOfTransaction}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Transaction History in 14 Days</h2>
                <div className="text-sm text-gray-500">$500k - $600k</div>
              </div>
              <div className="h-64 flex items-end justify-between space-x-1">
                {/* Simple line chart representation */}
                <div className="flex-1 bg-gray-100 rounded-t relative overflow-hidden">
                  <svg className="w-1/5 h-1/5" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      points="0,150 50,120 100,140 150,100 200,110 250,90 300,120 350,100 400,80"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#gradient)"
                      points="0,150 50,120 100,140 150,100 200,110 250,90 300,120 350,100 400,80 400,200 0,200"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Aug 5</span>
                <span>Aug 12</span>
                <span>Aug 19</span>
              </div>
            </div>

            {/* Latest Blocks and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Blocks */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Latest Blocks</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">🔧 Customize</button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {blocks.map((block, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-blue-600 font-medium text-sm">{block.index}</p>
                            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(block.timestamp + 7 * 3600000))}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            Miner <span className="text-blue-600">{''}</span>
                          </p>
                          <p className="text-xs text-gray-500">{block.transactions.length} in 12 secs</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{0.01 + ' FoZ'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">VIEW ALL BLOCKS →</button>
                  </div>
                </div>
              </div>

              {/* Latest Transactions */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Latest Transactions</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">🔧 Customize</button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        hash: "0x8379076c20...",
                        from: "0xdad80d80...247637f1",
                        to: "0xc3a50da8...1882985E2",
                        value: "0.01581 Eth",
                        time: "17 secs ago",
                      },
                      {
                        hash: "0x66161c457...",
                        from: "0xdad80d80...247637f1",
                        to: "0xf006aa87...83C530E38",
                        value: "0.00086 Eth",
                        time: "17 secs ago",
                      },
                      {
                        hash: "0xbe025cb6f8...",
                        from: "0xdad80d80...247637f1",
                        to: "0x589524c1c...C9953E0F",
                        value: "0.00278 Eth",
                        time: "17 secs ago",
                      },
                      {
                        hash: "0x9cf5ae1386e...",
                        from: "0xdad80d80...247637f1",
                        to: "0xc6f947d9...C99588C48",
                        value: "0.00076 Eth",
                        time: "17 secs ago",
                      },
                      {
                        hash: "0x7074b068a7...",
                        from: "0xdad80d80...247637f1",
                        to: "0xd3E84926c...9FCA9CD7",
                        value: "0.0507 Eth",
                        time: "17 secs ago",
                      },
                    ].map((tx, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16l-4-4m0 0l4-4m-4 4h18"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-blue-600 font-medium text-sm">{tx.hash}</p>
                            <p className="text-xs text-gray-500">{tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right flex-1 mx-4">
                          <p className="text-xs text-gray-500">
                            From <span className="text-blue-600">{tx.from}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            To <span className="text-blue-600">{tx.to}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{tx.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      VIEW ALL TRANSACTIONS →
                    </button>
                  </div>
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
      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors hover:cursor-pointer"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors hover:cursor-pointer ${activeTab === item.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors hover:cursor-pointer">
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

      {/* Main Content */}
      <div className="flex-1 w-full overflow-auto">
        <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors hover:cursor-pointer"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Connected</span>
          </div>
        </div>

        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  )
}

export default Homepage;