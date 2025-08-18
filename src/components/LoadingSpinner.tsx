export const LoadingSpinner = () => {
    return (
        <div className="flex space-x-2 justify-center">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
            ))}
        </div>
    );
};