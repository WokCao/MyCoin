import { useState } from "react"
import { Eye, EyeOff, X, Check, AlertTriangle, Shield, Share, HardDrive, Wallet } from "lucide-react"
import Header from "../components/Header"
import { Link, useNavigate } from "react-router-dom"
import { LoadingSpinner } from "../components/LoadingSpinner"

const KeyStorePage = () => {
    const [currentStep, setCurrentStep] = useState(1)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [confirmPasswordError, setConfirmPasswordError] = useState("")
    const [isLoading, setLoading] = useState(false)
    const navigate = useNavigate()

    const steps = [
        {
            number: 1,
            title: "Create password",
            status: currentStep > 1 ? "completed" : currentStep === 1 ? "active" : "inactive",
        },
        {
            number: 2,
            title: "Download keystore file",
            status: currentStep > 2 ? "completed" : currentStep === 2 ? "active" : "inactive",
        },
        {
            number: 3,
            title: "Well done",
            status: currentStep === 3 ? "active" : "inactive"
        },
    ]

    const handleCreateWallet = () => {
        if (password && confirmPassword && password === confirmPassword && password.length >= 8) {
            setLoading(true);
            setTimeout(() => {
                setCurrentStep(2)
                setLoading(false)
            }, 2000)
        }
    }

    const handleDownload = () => {
        setLoading(true);
        setTimeout(() => {
            setCurrentStep(3)
            setLoading(false)
        }, 2000)
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            setLoading(false)
        } else {
            navigate('/wallet/create/overview')
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setPassword(value);
        if (value.length < 8) {
            setPasswordError("Password length must be at least 8.")
        } else {
            if (value === confirmPassword || confirmPassword.length === 0) {
                setConfirmPasswordError("");
            } else {
                setConfirmPasswordError("Password doesn't match.")
            }
            setPasswordError("");
        }
    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setConfirmPassword(value);
        if (value !== password) {
            setConfirmPasswordError("Password doesn't match.")
        } else {
            setConfirmPasswordError("");
        }
    }

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
                            <a href="#" className="text-blue-200 underline hover:text-white transition-colors">
                                Access Wallet
                            </a>
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
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">Create password</h3>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required={true}
                                                autoFocus={true}
                                                value={password}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter your password"
                                                className="w-full px-4 py-3 pr-16 outline-gray-400 outline rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm truncate"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5 hover:cursor-pointer" /> : <Eye className="w-5 h-5 hover:cursor-pointer" />}
                                                </button>
                                                <X onClick={() => setPassword("")} className="w-5 h-5 text-gray-400 hover:text-gray-800 hover:cursor-pointer" />
                                            </div>
                                        </div>
                                        {passwordError.length !== 0 && <p className="text-xs text-red-600 mt-0.5">{passwordError}</p>}
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required={true}
                                                value={confirmPassword}
                                                onChange={handleConfirmPasswordChange}
                                                placeholder="Enter your password again"
                                                className="w-full px-4 py-3 pr-16 outline-gray-400 outline rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:text-sm truncate"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5 hover:cursor-pointer" /> : <Eye className="w-5 h-5 hover:cursor-pointer" />}
                                                </button>
                                                <X onClick={() => setConfirmPassword("")} className="w-5 h-5 text-gray-400 hover:text-gray-800 hover:cursor-pointer" />
                                            </div>
                                        </div>
                                        {confirmPasswordError.length !== 0 && <p className="text-xs text-red-600 mt-0.5">{confirmPasswordError}</p>}
                                    </div>
                                </div>

                                {isLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="flex gap-2 justify-center">
                                        {/* Back Button */}
                                        <button
                                            className="bg-transparent border-green-500 text-green-500 hover:bg-green-100 px-8 py-2 border rounded-lg hover:cursor-pointer text-xs lg:text-sm"
                                            onClick={handleBack}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCreateWallet}
                                            className={`${!password || !confirmPassword || password !== confirmPassword ? 'bg-gray-300 text-white font-medium hover:cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-500 text-white'} rounded-lg px-8 py-2 text-xs lg:text-sm hover:cursor-pointer`}
                                        >
                                            Create Wallet
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="lg:text-xl font-bold text-gray-400 mb-0.5">STEP 2.</h2>
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">Download keystore file</h3>
                                    <p className="text-red-600 text-xs lg:text-sm mt-1">
                                        Important things to know before downloading your keystore file.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 border-2 border-teal-200 rounded-lg">
                                        <div className="flex flex-col items-center">
                                            <div className="p-2 lg:p-3 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                                                <Shield className="w-4 lg:w-6 h-4 lg:h-6 text-teal-600" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">Don't lose it</h4>
                                            <p className="text-xs text-gray-600">Be careful, it can not be recovered if you lose it.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 border-2 border-teal-200 rounded-lg">
                                        <div className="flex flex-col items-center">
                                            <div className="p-2 lg:p-3 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                                                <Share className="w-4 lg:w-6 h-4 lg:h-6 text-teal-600" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">Don't share it</h4>
                                            <p className="text-xs text-gray-600">
                                                Your funds will be stolen if you use this file on a malicious phishing site.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 border-2 border-teal-200 rounded-lg">
                                        <div className="flex flex-col items-center">
                                            <div className="p-2 lg:p-3 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                                                <HardDrive className="w-4 lg:w-6 h-4 lg:h-6 text-teal-600" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">Make a backup</h4>
                                            <p className="text-xs text-gray-600">
                                                Secure it like the millions of dollars it may one day be worth.
                                            </p>
                                        </div>
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
                                        <button onClick={handleDownload} className="bg-teal-400 hover:bg-teal-500 text-white rounded-lg px-8 py-2 text-xs lg:text-sm hover:cursor-pointer">
                                            Acknowledge & Download
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
                                            You are now ready to take advantage of all that MyCoin has to offer! Access with keystore file
                                            should only be used in an offline setting.
                                        </p>

                                        <div className="space-y-2">
                                            <button className="w-full bg-teal-400 hover:bg-teal-500 rounded-lg py-4 lg:py-2 hover:cursor-pointer text-xs lg:text-base">
                                                <Link to=''>
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
                                        This information is sensitive, and these options should only be used in offline settings by
                                        experienced crypto users. You will need your keystore file + password to access your wallet. Please
                                        save them in a secure location. We CAN NOT retrieve or reset your keystore/password if you lose them.
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

export default KeyStorePage;