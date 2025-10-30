import { ChangeEventHandler } from "react";

export default function SearchBar({
  value,
  onSearchBarChange,
  onSearch,
}: {
  value: string;
  onSearchBarChange: ChangeEventHandler<HTMLInputElement>;
  onSearch?: () => void;
}) {
  return (
    <div className="flex w-full">
      <input
        autoComplete="off"
        className="flex-1 py-2 px-3 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        type="text"
        placeholder="Search"
        value={value}
        onChange={onSearchBarChange}
      />
      <button
        onClick={onSearch}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md border border-blue-600 hover:border-blue-700 transition-colors duration-200 flex items-center justify-center"
        type="button"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
}
