import { CirclePoundSterling } from "lucide-react";

const Header = () => {
    return (
        <header className="flex items-center justify-center py-6">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <CirclePoundSterling />
                </div>
                <h1 className="text-2xl font-bold text-white">MCW</h1>
            </div>
        </header>
    )
}

export default Header;