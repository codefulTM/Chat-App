import React from "react";

export default function MessageInput({
  text,
  setText,
  selectedFile,
  setSelectedFile,
  isUploading,
  handleSendMessage,
  handleFileSelect,
}: {
  text: string;
  setText: (value: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isUploading: boolean;
  handleSendMessage: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      {/* Input luôn dính dưới */}
      <div className="p-4 border-t flex items-center gap-2">
        <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <svg
            className="w-6 h-6 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </label>

        <div className="relative flex-1">
          <input
            type="text"
            name="submitText"
            id="submitText"
            placeholder="Nhập tin nhắn..."
            className={`w-full pr-12 pl-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--text)]`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
                setText("");
              }
            }}
            disabled={isUploading}
          />

          <button
            onClick={() => {
              if (text.trim() || selectedFile) {
                handleSendMessage();
                setText("");
              }
            }}
            disabled={isUploading || (!text.trim() && !selectedFile)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white bg-[var(--primary)] rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      {selectedFile && (
        <div className="px-4 pb-2 flex items-center text-sm text-gray-600">
          <span className="truncate max-w-xs">{selectedFile.name}</span>
          <button
            onClick={() => setSelectedFile(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
