import { AlertTriangle, Check, ChevronDown, ChevronUp, RefreshCw, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import * as bip39 from 'bip39';
import { LoadingSpinner } from "../components/LoadingSpinner";

interface Option {
    text: string;
    isCorrect: boolean;
}

interface Question {
    number: number;
    options: Option[];
}

const MnemonicPage = () => {
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setLoading] = useState(false)
    const [wordCount, setWordCount] = useState<12 | 24>(12)
    const [showExtraWord, setShowExtraWord] = useState(true)
    const [words, setWords] = useState<string[]>(Array(24).fill(""))
    const [extraWord, setExtraWord] = useState("")
    const [confirmExtraWord, setConfirmExtraWord] = useState("")
    const [questions, setQuestions] = useState<Question[]>([])
    const [selected, setSelected] = useState<number[]>([0, 0, 0])
    const [optionsError, setOptionsError] = useState("")
    const navigate = useNavigate()

    const steps = [
        {
            number: 1,
            title: "Write down the words",
            status: currentStep > 1 ? "completed" : currentStep === 1 ? "active" : "inactive",
        },
        {
            number: 2,
            title: "Verification",
            status: currentStep > 2 ? "completed" : currentStep === 2 ? "active" : "inactive",
        },
        {
            number: 3,
            title: "Well done",
            status: currentStep === 3 ? "active" : "inactive"
        },
    ]

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            setLoading(false)
        } else {
            navigate('/wallet/create/overview')
        }
    }

    const handleVerify = () => {
        setLoading(true)
        const areAllCorrect = questions.every((q, i) => q.options[selected[i]].isCorrect)
        const isSameExtraWord = extraWord.trim().length > 0 ? extraWord.trim() === confirmExtraWord.trim() : true
        if (areAllCorrect && isSameExtraWord) {
            setOptionsError('')
            setTimeout(() => {
                setLoading(false)
                setCurrentStep(3)
            }, 2000)
        } else {
            setLoading(false)
            setOptionsError('Wrong values. Please try again!')
        }
    }

    const handleSelect = (qIndex: number, optionIndex: number) => {
        const updated = [...selected];
        updated[qIndex] = optionIndex;
        setSelected(updated);
    };

    const handleShuffleArray = (arr: any[]) => {
        return arr.sort(() => Math.random() - 0.5);
    }

    const handleGenerateQuestions = () => {
        /** Select 9 words after shuffling */
        const selectedWords = handleShuffleArray([...words]).slice(0, 9)
        const questionsFormation: Question[] = [];
        for (let i = 0; i < 3; i++) {
            let options: Option[] = [
                { text: selectedWords[i * 3], isCorrect: true },
                { text: selectedWords[i * 3 + 1], isCorrect: false },
                { text: selectedWords[i * 3 + 2], isCorrect: false },
            ]
            options = handleShuffleArray(options)
            questionsFormation.push({ number: words.indexOf(selectedWords[i * 3]) + 1, options })
        }

        questionsFormation.sort((a, b) => a.number - b.number)
        setQuestions(questionsFormation);
    }

    const handleAfterWritingDown = () => {
        setLoading(true)
        setTimeout(() => {
            setCurrentStep(2)
            setOptionsError('')
            setSelected([0, 0, 0])
            setConfirmExtraWord('')
            handleGenerateQuestions()
            setLoading(false)
        }, 2000)
    }

    const handleGetWords = async () => {
        const strength = wordCount === 12 ? 128 : 256
        const data = bip39.generateMnemonic(strength)
        setWords(data.split(' '))
    }

    useEffect(() => {
        handleGetWords()
    }, [wordCount])

    const currentWords = words.slice(0, wordCount)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex flex-col">
            {/* Header with coin icon and MCW text */}
            <Header />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-lg space-y-6">
                    <div className="text-center text-white space-y-2">
                        <h1 className="text-xl lg:text-2xl font-bold">Create a new wallet</h1>
                        <p className="text-blue-100">Please select a method to create a new wallet</p>
                        <p className="text-sm">
                            Already have a wallet?{" "}
                            <Link to='/wallet/access' className="text-blue-200 underline hover:text-white transition-colors">
                                Access Wallet
                            </Link>
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center my-8">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${step.status === "completed"
                                            ? "bg-blue-600 text-white"
                                            : step.status === "active"
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-300 text-gray-600"
                                            }`}
                                    >
                                        {step.status === "completed" ? <Check className="w-5 h-5" /> : step.number}
                                    </div>
                                    <div className="mt-2 text-xs text-center">
                                        <div className={`font-medium ${step.status === "active" ? "text-white" : "text-blue-900"}`}>STEP {step.number}</div>
                                        <div className={step.status === "active" ? "text-white" : "text-blue-700"}>{step.title}</div>
                                    </div>
                                </div>
                                {index < steps.length - 1 && <div className="w-12 lg:w-24 h-0.5 bg-gray-300 mx-2 mt-[-20px]" />}
                            </div>
                        ))}
                    </div>

                    {/* Main Content Card */}
                    <div className="p-8 bg-white rounded-lg">
                        {currentStep === 1 && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="lg:text-lg font-bold text-gray-400 mb-0.5">STEP 1.</h2>
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">Write down these words</h3>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {/* Header with Update button and word count toggle */}
                                    <div className="flex justify-between items-center mb-6 gap-3">
                                        <button className="text-teal-500 hover:text-teal-600 font-medium flex items-center gap-2 hover:cursor-pointer" onClick={handleGetWords} title="Refresh word list">
                                            <RefreshCw className="h-4 w-4" />
                                            <span className="text-xs lg:text-sm">Update</span>
                                        </button>
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
                                        {currentWords.map((word, index) => (
                                            <div key={index} className="relative">
                                                <input
                                                    type="text"
                                                    value={word}
                                                    readOnly={true}
                                                    className="w-full pl-6 pr-3 py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-600 text-gray-800 text-xs lg:text-sm"
                                                />
                                                <span className="absolute left-0 top-2 text-sm text-gray-400 font-medium">{index + 1}.</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Extra Word section */}
                                    <div className="border-t pt-4">
                                        <button
                                            onClick={() => setShowExtraWord(!showExtraWord)}
                                            className="flex items-center justify-between w-full text-left text-gray-700 hover:text-gray-900 font-medium"
                                        >
                                            <span className="text-sm lg:text-base">Add Extra Word</span>
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
                                    </div>
                                </div>

                                {isLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            className="bg-transparent border-green-500 text-green-500 hover:bg-green-100 px-8 py-2 border rounded-lg hover:cursor-pointer text-xs lg:text-sm"
                                            onClick={handleBack}
                                        >
                                            Back
                                        </button>
                                        <button className="bg-teal-400 hover:bg-teal-500 text-white rounded-lg px-8 py-2 text-xs lg:text-sm hover:cursor-pointer" onClick={handleAfterWritingDown}>
                                            I wrote them down
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="lg:text-xl font-bold text-gray-400 mb-0.5">STEP 2.</h2>
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">Verification</h3>
                                    <p className="text-xs lg:text-sm mt-1">
                                        Please select correct words based on their numbers.
                                    </p>
                                </div>

                                <div className="flex flex-col mb-4">
                                    <div className="space-y-4 w-full lg:w-4/5 mx-auto">
                                        <div className="space-y-4">
                                            {questions.map((q, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 bg-white border-gray-300 border rounded-lg shadow-sm">
                                                    <span className="font-medium text-gray-700">{q.number}.</span>
                                                    <div className="flex flex-1 justify-between">
                                                        {q.options.map((option, i) => (
                                                            <label key={i} className="flex items-center gap-1 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`question-${idx}`}
                                                                    className="form-radio text-teal-500 focus:ring-teal-500"
                                                                    checked={selected[idx] === i}
                                                                    onChange={() => handleSelect(idx, i)}
                                                                />
                                                                <span className="text-gray-700 text-xs lg:text-sm">{option.text}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {extraWord.trim().length > 0 && (
                                            <>
                                                <label htmlFor="extra-word" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                                                    Confirm extra word
                                                </label>
                                                <input
                                                    id="extra-word"
                                                    type="text"
                                                    value={confirmExtraWord}
                                                    onChange={(e) => setConfirmExtraWord(e.target.value)}
                                                    placeholder="Enter extra word"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs lg:text-sm"
                                                />
                                            </>
                                        )}

                                        {optionsError && (
                                            <p className="text-red-600 text-xs lg:text-sm text-center">{optionsError}</p>
                                        )}
                                    </div>
                                </div>

                                {isLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            className="bg-transparent border-green-500 text-green-500 hover:bg-green-100 px-8 py-2 border rounded-lg hover:cursor-pointer text-xs lg:text-sm"
                                            onClick={handleBack}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleVerify}
                                            className={`${extraWord.trim().length > 0 && confirmExtraWord.trim().length > 0 || extraWord.trim().length === 0 ? 'bg-teal-400 hover:bg-teal-500 text-white hover:cursor-pointer' : 'bg-gray-400 hover:bg-gray-500 text-white hover:cursor-not-allowed'} rounded-lg px-8 py-2 text-xs lg:text-sm`}
                                            disabled={extraWord.trim().length > 0 ? confirmExtraWord.trim().length === 0 : false}
                                        >
                                            Verify
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-400 mb-0.5">STEP 3.</h2>
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">You are done!</h3>
                                </div>

                                <div className="flex items-center gap-8 mb-8">
                                    <div className="flex-1">
                                        <p className="text-gray-600 mb-6 text-xs">
                                            You are now ready to take advantage of all that MyCoin has to offer! Access with mnemonic phrase should only be used in an offline setting.
                                        </p>

                                        <div className="space-y-2">
                                            <button className="w-full bg-teal-400 hover:bg-teal-500 rounded-lg py-4 lg:py-2 hover:cursor-pointer text-xs lg:text-base">
                                                <Link to='/wallet/access' className="text-blue-200 underline hover:text-white transition-colors">
                                                    Access Wallet
                                                </Link>
                                            </button>
                                            <button
                                                className="w-full text-teal-500 border-teal-600 hover:bg-teal-50 bg-transparent rounded-lg py-4 lg:py-2 hover:cursor-pointer text-xs lg:text-base"
                                            >
                                                <Link to='/wallet/create'>
                                                    Create Another Wallet
                                                </Link>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-[0.5] flex justify-center">
                                        <div className="relative">
                                            <div className="p-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
                                                <Wallet className="text-green-800" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full"></div>
                                            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full"></div>
                                            <div className="absolute top-4 -left-4 w-3 h-3 bg-teal-400 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Warning Banner */}
                        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium text-orange-800 mb-1">NOT RECOMMENDED</div>
                                    <p className="text-xs lg:text-sm text-orange-700">
                                        This information is sensitive, and these options should only be used in offline settings by experienced crypto users. Your phrase is the key to your wallet. Please make sure to write it down and save it in a secure location. We CAN NOT retrieve or reset your phrase if you lose it.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MnemonicPage;