export default function Header({
    toUser,
}: {
    toUser: any;
}) {
    return (
        <div
        className={`p-4 border-b ${toUser?.username === "gemini"
          ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
          : ""
          }`}
      >
        <div className="flex items-center gap-3">
          {toUser?.username === "gemini" && (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          <h1 className="text-2xl font-bold">
            {toUser?.displayName}
            {toUser?.username === "gemini" && (
              <span className="ml-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-normal">
                (AI Assistant)
              </span>
            )}
          </h1>
        </div>
      </div>
    );
}