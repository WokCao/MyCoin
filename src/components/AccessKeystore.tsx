import { Check, Laptop, EyeOff, Eye, X, AlertTriangle } from "lucide-react"
import { useState, useRef, type JSX } from "react"
import CryptoJS from "crypto-js";
import { useWallet } from "../context/WalletContext";

const AccessKeystore = ({ header }: { header: JSX.Element }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [file, setFile] = useState<File>()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { accessWalletFromKeystore } = useWallet()

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files && files.length > 0) {
            const selectedFile = files[0]
            setFile(selectedFile)
            setCurrentStep(2)
        }
    };

    const handleAccessWallet = () => {
        if (!file) {
            alert("Please upload your keystore file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const keystore = JSON.parse(text);

                /** Check structure of keystore file */
                if (!keystore.crypto || !keystore.crypto.ciphertext) {
                    setError("Invalid keystore file");
                    return;
                }

                /** Decrypted by passphrase */
                const decrypted = CryptoJS.AES.decrypt(keystore.crypto.ciphertext, password).toString(CryptoJS.enc.Utf8);

                if (!decrypted) {
                    setError("Wrong password");
                    return;
                }

                accessWalletFromKeystore(decrypted, keystore.address, keystore)

                // setPrivateKey(decrypted);
                // setAddress(keystore.address);

            } catch (error) {
                console.error(error);
                setError("Failed to read keystore file");
            }
        };

        reader.readAsText(file);
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            setFile(undefined)
            setPassword('')
            setError('')
        }
    }

    const steps = [
        {
            number: 1,
            title: 'Select File',
            status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'inactive'
        },
        {
            number: 2,
            title: 'Enter Password',
            status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'inactive'
        }
    ]
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p- relative">
            <div className="w-full max-w-lg p-6 rounded-lg bg-white">
                <div className="text-center mb-8">
                    <h1 className="text-lg lg:text-2xl font-bold text-gray-900 mb-6">Access Wallet with Keystore File</h1>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center mb-4">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className="flex flex-col items-center w-24">
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
                                        <div className={`font-medium ${step.status === "active" ? "text-black" : "text-gray-400"}`}>STEP {step.number}</div>
                                        <div className={step.status === "active" ? "text-black" : "text-gray-400"}>{step.title}</div>
                                    </div>
                                </div>
                                {index < steps.length - 1 && <div className="w-12 lg:w-24 h-0.5 bg-gray-300 mx-2 mt-[-20px]" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 mb-6">
                    {currentStep === 1 && (
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <h2 className="lg:text-lg font-semibold text-gray-400 mb-0.5">STEP {currentStep}.</h2>
                                <h3 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">Select your Keystore File</h3>
                                <p className="text-xs lg:text-sm text-gray-600 mb-6">Please select keystore file that unlocks your wallet.</p>
                                <button className="bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs lg:text-sm rounded-lg text-white hover:cursor-pointer" onClick={handleButtonClick}>Select File</button>

                                <input
                                    type="file" ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".json"
                                />
                            </div>

                            <div className="w-1/3 max-w-sm flex justify-center">
                                <Laptop className="text-blue-400 h-4/5 w-4/5" />
                            </div>
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex-1 mb-4">
                                <h2 className="lg:text-lg font-semibold text-gray-400 mb-0.5">STEP {currentStep}.</h2>
                                <h3 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">Enter Password</h3>
                                <p className="text-xs lg:text-sm text-gray-600 mb-6">Enter your password to unlock your wallet.</p>

                                <div>
                                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={true}
                                            autoFocus={true}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                    {error.length !== 0 && <p className="text-xs text-red-600 mt-0.5 text-center">{error}</p>}
                                </div>
                            </div>

                            <div className="flex gap-2 justify-center">
                                {/* Back Button */}
                                <button
                                    className="bg-transparent border-green-500 text-green-500 hover:bg-green-100 px-8 py-2 border rounded-lg hover:cursor-pointer text-xs lg:text-sm"
                                    onClick={handleBack}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleAccessWallet}
                                    className={`${!password ? 'bg-gray-300 text-white font-medium hover:cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-500 text-white hover:cursor-pointer'} rounded-lg px-8 py-2 text-xs lg:text-sm`}
                                >
                                    Access Wallet
                                </button>
                            </div>
                        </div>
                    )}
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

export default AccessKeystore;