import React from "react";
import ReactMarkdown from "react-markdown";

export default function MessagesList({
  messages,
  messagesContainerRef,
  messagesEndRef,
  handleScroll,
  setMessageRef,
  user,
  currentReadMessage,
}: {
  messages: any[];
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  setMessageRef: (messageId: string, el: HTMLDivElement | null) => void;
  user: any;
  currentReadMessage: any;
}) {
  return (
    <div
      className="flex-1 overflow-y-auto space-y-4"
      ref={messagesContainerRef}
      onScroll={handleScroll}
    >
      {messages.map((message: any, index: number) => {
        const showName =
          index === 0 ||
          messages[index - 1].sender._id !== message.sender._id;
        return (
          <div
            key={message._id}
            ref={(el) => setMessageRef(message._id, el)}
            data-message-id={message._id}
            className={`${
              message.sender._id === user?.id ? "text-right" : "text-left"
            }`}
          >
            {showName && (
              <div
                className={`flex items-center gap-2 mb-1 ${
                  message.sender._id === user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <h2 className="text-lg font-bold">
                  {message.sender.displayName}
                </h2>
                {message.sender.username === "gemini" && (
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
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
              </div>
            )}
            <div
              className={`flex flex-col ${
                message.sender._id === user?.id ? "items-end" : "items-start"
              }`}
            >
              {message.content !== "" && (
                <div
                  className={`${
                    message.sender._id === user?.id
                      ? "bg-[var(--primary)]"
                      : message.sender.username === "gemini"
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700"
                      : document.documentElement.classList.contains("dark")
                      ? "bg-[var(--secondary)]"
                      : "bg-[var(--surface)]"
                  } p-3 rounded-lg max-w-100 shadow-sm`}
                >
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }) {
                        const isInline =
                          !className || !className.includes("language-");

                        return !isInline ? (
                          <pre className="overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 text-white rounded-md my-2 ">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code
                            className={`${className} inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm align-baseline text-white`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              {message.fileUrl &&
                (() => {
                  // Check if file is an image
                  const isImage =
                    message.fileName &&
                    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(message.fileName);

                  return isImage ? (
                    <div className="mt-2">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${message.fileUrl}`}
                        alt={message.fileName || "Image"}
                        className={`max-w-xs max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
                          message.sender.username === "gemini"
                            ? "ring-2 ring-purple-200 dark:ring-purple-700"
                            : ""
                        }`}
                        onClick={() =>
                          window.open(
                            `${process.env.NEXT_PUBLIC_API_URL}${message.fileUrl}`,
                            "_blank"
                          )
                        }
                        style={{ objectFit: "cover" }}
                      />
                      {message.sender.username === "gemini" && (
                        <div className="mt-1 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Generated by Gemini
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${message.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        {message.fileName || "Download File"}
                      </a>
                    </div>
                  );
                })()}
            </div>
            {message.sender._id === user?.id &&
              message._id === currentReadMessage?._id && <i>Read</i>}
          </div>
        );
      })}
      <div ref={messagesEndRef}></div>
    </div>
  );
}
