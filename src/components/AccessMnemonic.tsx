import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState, type JSX } from "react";
import { accessWalletWithMnemonic } from "../utils/WalletUtils";
import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";

const AccessMnemonic = ({ header }: { header: JSX.Element }) => {
    const [wordCount, setWordCount] = useState<12 | 24>(12)
    const [showExtraWord, setShowExtraWord] = useState(true)
    const [extraWord, setExtraWord] = useState("")
    const [words, setWords] = useState<string[]>(Array(24).fill(""))
    const [error, setError] = useState("")
    const { accessWallet } = useWallet()
    const navigate = useNavigate()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
        const value = e.target.value;
        setWords(prevWords => {
            const newWords = [...prevWords];
            newWords[i] = value;
            return newWords;
        });
    }

    const handleClearInput = () => {
        setExtraWord('')
        setWords(prevWords => prevWords.map(() => ''));
    }

    const handleAccessWallet = async () => {
        const mnemonicFormation = words.join(' ').trim()
        try {
            const wallet = await accessWalletWithMnemonic(mnemonicFormation, extraWord.trim());
            accessWallet(wallet)
            navigate('/wallet/dashboard')
          } catch (err) {
            setError("Invalid mnemonic or passphrase");
          }
    }

    const areAllFilled = words.indexOf('') > -1 ? false : true;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
            <div className="w-full max-w-lg p-6 rounded-lg bg-white">
                <div className="text-center mb-8">
                    <h1 className="text-lg lg:text-2xl font-bold text-gray-900 mb-6">Access Wallet with Mnemonic Phrase</h1>
                    {/* Header with Update button and word count toggle */}
                    <div className="flex justify-end items-center mb-6 gap-3">
                        <div className="flex bg-gray-100 rounded-md p-1">
                            <button
                                onClick={() => setWordCount(12)}
                                className={`px-3 py-1 rounded text-xs lg:text-sm font-medium transition-colors ${wordCount === 12 ? "bg-teal-500 text-white" : "text-gray-600 hover:text-gray-800 hover:cursor-pointer"
                                    }`}
                            >
                                12 words
                            </button>
                            <button
                                onClick={() => setWordCount(24)}
                                className={`px-3 py-1 rounded text-xs lg:text-sm font-medium transition-colors ${wordCount === 24 ? "bg-teal-500 text-white" : "text-gray-600 hover:text-gray-800 hover:cursor-pointer"
                                    }`}
                            >
                                24 words
                            </button>
                        </div>
                    </div>

                    {/* Mnemonic words grid */}
                    <div className={`grid gap-3 mb-6 ${wordCount === 12 ? "grid-cols-3" : "grid-cols-4"}`}>
                        {words.slice(0, wordCount).map((word, index) => (
                            <div key={index} className="relative">
                                <input
                                    type="text"
                                    value={word}
                                    autoFocus={index === 0 ? true : false}
                                    onChange={(e) => handleInputChange(e, index)}
                                    className="w-full pl-6 pr-3 py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-600 text-gray-800 text-xs lg:text-sm"
                                />
                                <span className="absolute left-0 top-2 text-sm text-gray-400 font-medium">{index + 1}.</span>
                            </div>
                        ))}
                    </div>

                    {/* Add Extra Word section */}
                    <div className="border-t py-4">
                        <button
                            onClick={() => setShowExtraWord(!showExtraWord)}
                            className="flex items-center justify-between w-full text-left text-gray-700 hover:text-gray-900 font-medium"
                        >
                            <span className="text-sm lg:text-base">Enter Extra Word</span>
                            {showExtraWord ? <ChevronUp className="w-5 h-5 hover:cursor-pointer" /> : <ChevronDown className="w-5 h-5 hover:cursor-pointer" />}
                        </button>

                        {showExtraWord && (
                            <div className="mt-4">
                                <input
                                    type="text"
                                    value={extraWord}
                                    onChange={(e) => setExtraWord(e.target.value)}
                                    placeholder="Extra word"
                                    className="w-full px-3 py-2 outline border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs lg:text-sm"
                                />
                            </div>
                        )}

                        {error.length !== 0 && <p className="text-xs text-red-600 mt-0.5 text-center">{error}</p>}
                    </div>

                    <div className="flex gap-2 justify-center">
                        {/* Clear Button */}
                        <button
                            className="bg-transparent border-green-500 text-green-500 hover:bg-green-100 px-8 py-2 border rounded-lg hover:cursor-pointer text-xs lg:text-sm"
                            onClick={handleClearInput}
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleAccessWallet}
                            className={`${!areAllFilled ? 'bg-gray-300 text-white font-medium hover:cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-500 text-white hover:cursor-pointer'} rounded-lg px-8 py-2 text-xs lg:text-sm`}
                            disabled={!areAllFilled}
                        >
                            Access Wallet
                        </button>
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

export default AccessMnemonic;