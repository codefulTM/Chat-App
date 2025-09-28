export default function Conversation({
  conversationId,
}: {
  conversationId: string | null;
}) {
  if (!conversationId) {
    return (
      <div>
        <input type="search" name="user_search" id="user_search" />
      </div>
    );
  }
  return <div>Conversation</div>;
}
