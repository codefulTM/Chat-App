export default function OnlineUsers({
  onlineUsers,
  user,
  onBubbleClick,
}: {
  onlineUsers: Map<string, any>;
  user: any;
  onBubbleClick: Function;
}) {
  return (
    <div className="flex overflow-x-auto py-2 gap-3 px-1 hide-scrollbar">
      {Array.from(onlineUsers.values()).map((onlineUser) => {
        const lastName = onlineUser.displayName?.split(" ").pop();
        return (
          onlineUser._id !== user?.id && (
            <div
              key={onlineUser._id}
              className="flex flex-col items-center shrink-0"
              title={onlineUser.displayName} // Show full name on hover
              onClick={() => {
                onBubbleClick(onlineUser._id);
              }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                {lastName?.[0]?.toUpperCase() || "?"}
              </div>
              <span className="text-xs mt-1 truncate max-w-[50px]">
                {lastName}
              </span>
            </div>
          )
        );
      })}
    </div>
  );
}
