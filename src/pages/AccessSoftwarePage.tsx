import { ArrowLeft, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AccessOverview from "../components/AccessOverview";
import AccessKeystore from "../components/AccessKeystore";
import AccessMnemonic from "../components/AccessMnemonic";

const AccessSoftwarePage = () => {
    const [searchParams] = useSearchParams()
    const type = searchParams.get('type') ?? 'overview'
    const navigate = useNavigate()

    const renderHeader = (showBackButton: boolean) => (
        <div className="absolute top-0 left-0 w-full">
            <div className={`flex items-center ${showBackButton ? 'justify-between' : 'justify-end'} p-2`}>
                {showBackButton && (
                    <ArrowLeft 
                        onClick={() => navigate('/wallet/access/software?type=overview')}
                        className="text-gray-500 hover:text-gray-700 hover:cursor-pointer" 
                    />
                )}
                <X 
                    onClick={() => navigate('/wallet/access')}
                    className="text-gray-500 hover:text-gray-700 hover:cursor-pointer" 
                />
            </div>
        </div>
    );

    
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
            {type === 'overview' && <AccessOverview header={renderHeader(false)} />}
            {type === 'keystore' && <AccessKeystore header={renderHeader(true)} />}
            {type === 'mnemonic' && <AccessMnemonic header={renderHeader(true)} />}
        </div>
    );
}

export default AccessSoftwarePage;