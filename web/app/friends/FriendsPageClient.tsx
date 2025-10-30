"use client";

import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { ChangeEvent } from "react";
import { parseCookies } from "nookies";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function FriendsPageClient() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(
    new Set()
  );
  const [acceptingRequests, setAcceptingRequests] = useState<Set<string>>(
    new Set()
  );
  type Friend = {
    _id: string;
    username: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };

  const [friends, setFriends] = useState<Map<string, Friend>>(new Map());
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set()
  );
  const { user } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const handleSearchBarChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    const cookies = parseCookies();
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      router.push("/login");
    }
    setToken(jwtToken);
  }, []);

  // Load all friend-related data when component mounts or token changes
  useEffect(() => {
    const loadFriendData = async () => {
      if (!token) return;

      try {
        // Fetch all friend-related data in parallel
        const [friendsRes, requestsRes, sentRequestsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friendships`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friendships/requests`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/friendships/sent-requests`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        // Process friends data
        if (friendsRes.ok) {
          const friendsData = await friendsRes.json();
          if (friendsData.success) {
            const friendsMap = new Map<string, Friend>();
            friendsData.message.forEach((friendship: any) => {
              const friend =
                friendship.senderId._id === user?.id
                  ? friendship.receiverId
                  : friendship.senderId;
              friendsMap.set(friend._id, {
                _id: friend._id,
                username: friend.username,
                displayName: friend.displayName,
                email: friend.email,
                avatarUrl: friend.avatarUrl,
              });
            });
            setFriends(friendsMap);
          }
        }

        // Process received requests
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          if (requestsData.success) {
            setFriendRequests(requestsData.data || []);
          }
        }

        // Process sent requests
        if (sentRequestsRes.ok) {
          const sentRequestsData = await sentRequestsRes.json();
          if (sentRequestsData.success) {
            setPendingRequests(
              new Set<string>(
                sentRequestsData.data.map(
                  (request: any) => request.receiverId._id
                )
              )
            );
          }
        }
      } catch (error) {
        console.error("Error loading friend data:", error);
      }
    };

    loadFriendData();
  }, [token]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users?name=${encodeURIComponent(
          searchValue
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers(data.message || []);
      } else {
        console.error("Search failed:", data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    }
  };

  const unfriend = async (friendId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friendships/unfriend/${friendId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update the UI by removing the friend from the friends map
        setFriends((prev) => {
          const newFriends = new Map(prev);
          newFriends.delete(friendId);
          return newFriends;
        });
      } else {
        console.error("Failed to unfriend:", data.message);
      }
    } catch (error) {
      console.error("Error unfriending user:", error);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      setSendingRequests((prev) => new Set(prev).add(userId));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friendships/request/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        // Update the pending requests set
        setPendingRequests((prev) => new Set(prev).add(userId));
        alert("Friend request sent successfully!");
      } else {
        alert(data.message || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request");
    } finally {
      setSendingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const acceptFriendRequest = async (friendship: any) => {
    try {
      setAcceptingRequests((prev) => new Set(prev).add(friendship._id));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friendships/${friendship._id}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update friend requests list
        setFriendRequests((prev) =>
          prev.filter((req) => req._id !== friendship._id)
        );

        // Add the new friend directly to friends set instead of refetching
        setFriends((prev) => {
          const newFriends = new Map(prev);
          newFriends.set(friendship.senderId._id, friendship.senderId);
          return newFriends;
        });

        alert("Friend request accepted!");
      } else {
        alert(data.message || "Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request");
    } finally {
      setAcceptingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(friendship._id);
        return newSet;
      });
    }
  };

  const getButtonState = (user: any) => {
    const isFriend = friends.has(user._id);
    const hasPendingRequest = pendingRequests.has(user._id);
    const isSending = sendingRequests.has(user._id);

    if (isFriend) {
      return {
        text: "Unfriend",
        disabled: false,
        className: "bg-red-500 hover:bg-red-600 text-white cursor-pointer",
      };
    }
    if (hasPendingRequest) {
      return {
        text: "Request Sent",
        disabled: true,
        className: "bg-gray-300 text-gray-500 cursor-not-allowed",
      };
    }
    if (isSending) {
      return {
        text: "Sending...",
        disabled: true,
        className: "bg-blue-400 text-white cursor-wait",
      };
    }
    return {
      text: "Add Friend",
      disabled: false,
      className: "bg-blue-600 text-white hover:bg-blue-700",
    };
  };

  return (
    <div className="flex flex-1">
      <div className="w-2/3 p-2">
        <SearchBar
          value={searchValue}
          onSearchBarChange={handleSearchBarChange}
          onSearch={handleSearch}
        />
        {users.map((user: any) => (
          <div
            key={user._id}
            className="p-2 flex items-center justify-between border-b border-gray-200"
          >
            <div>
              <p className="font-medium">{user.displayName}</p>
              {user.email && (
                <p className="text-sm text-gray-600">{user.email}</p>
              )}
            </div>
            <button
              onClick={() => {
                if (getButtonState(user).text === "Add Friend") {
                  sendFriendRequest(user._id);
                } else {
                  unfriend(user._id);
                }
              }}
              disabled={getButtonState(user).disabled}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                getButtonState(user).className
              }`}
            >
              {getButtonState(user).text}
            </button>
          </div>
        ))}
      </div>
      <div className="w-1/3 p-2 flex flex-col">
        <div className="h-1/2 overflow-y-auto flex-1">
          <h1 className="text-xl font-bold mb-4">Friend Requests</h1>
          {friendRequests.length === 0 ? (
            <p className="text-gray-500">No friend requests</p>
          ) : (
            friendRequests.map((request: any) => (
              <div
                key={request._id}
                className="p-3 border-b border-gray-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      request.senderId?.avatarUrl ||
                      "https://i.pravatar.cc/150?u=default"
                    }
                    alt={request.senderId?.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      {request.senderId?.displayName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Sent {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => acceptFriendRequest(request)}
                  disabled={acceptingRequests.has(request._id)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    acceptingRequests.has(request._id)
                      ? "bg-green-400 text-white cursor-wait"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {acceptingRequests.has(request._id)
                    ? "Accepting..."
                    : "Accept"}
                </button>
              </div>
            ))
          )}
        </div>
        <div className="h-1/2 overflow-y-auto">
          <h1 className="text-xl font-bold mb-4">Friend List</h1>
          {friends.size === 0 ? (
            <p className="text-gray-500">No friends</p>
          ) : (
            Array.from(friends.values()).map((friend) => (
              <div
                key={friend._id}
                className="p-3 border-b border-gray-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      friend.avatarUrl || "https://i.pravatar.cc/150?u=default"
                    }
                    alt={friend.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{friend.displayName}</p>
                    <p className="text-sm text-gray-600">{friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => unfriend(friend._id)}
                  disabled={sendingRequests.has(friend._id)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    sendingRequests.has(friend._id)
                      ? "bg-red-400 text-white cursor-wait"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {sendingRequests.has(friend._id)
                    ? "Unfriending..."
                    : "Unfriend"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
