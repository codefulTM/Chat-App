export default function UserSearch({
  displayName,
  setDisplayName,
  users,
  setToUser,
  isDarkMode,
}: {
  displayName: string;
  setDisplayName: (value: string) => void;
  users: any[];
  setToUser: (user: any) => void;
  isDarkMode: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <input
        className={`w-full px-4 py-2 ${
          isDarkMode ? "bg-[var(--surface)]" : "bg-white"
        } border border-[var(--border)] ${
          isDarkMode ? "text-[var(--text)]" : "text-[var(--text)]"
        } rounded-md shadow-sm focus:ring-[var(--primary)] focus:border-[var(--primary)]`}
        type="search"
        autoComplete="off"
        name="user_search"
        id="user_search"
        placeholder="Search users..."
        value={displayName}
        onChange={(e) => {
          setDisplayName(e.target.value);
        }}
      />
      <ul className="list-none flex flex-col gap-2">
        {users.map((user: any) => {
          return (
            <li
              key={user._id}
              onClick={() => {
                setToUser({ ...user });
              }}
              className="cursor-pointer hover:bg-[var(--primary)] hover:text-[var(--background)] p-2 rounded-md"
            >
              {user.displayName}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
