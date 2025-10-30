import Link from "next/link";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Menu from "./Menu";

export default function Header({
  isMenuVisible,
  setIsMenuVisible,
}: {
  isMenuVisible: boolean;
  setIsMenuVisible: (value: boolean | ((prev: boolean) => boolean)) => void;
}) {
  return (
    <header className="flex-none h-12 bg-[var(--primary)] flex justify-end items-center">
      <div className="flex items-center gap-6 mr-4">
        <Link
          href="/"
          className="text-[var(--background)] hover:text-[var(--primary-light)] transition-colors duration-200"
        >
          Home
        </Link>
        <Link
          href="/chats"
          className="text-[var(--background)] hover:text-[var(--primary-light)] transition-colors duration-200"
        >
          Chat
        </Link>
        <Link
          href="/friends"
          className="text-[var(--background)] hover:text-[var(--primary-light)] transition-colors duration-200"
        >
          Friends
        </Link>
        <Link
          href="/notifications"
          className="text-[var(--background)] hover:text-[var(--primary-light)] transition-colors duration-200"
        >
          Notification
        </Link>
      </div>
      <div className="relative">
        <FontAwesomeIcon
          icon={faUser}
          className="!w-9 !h-9 text-[var(--background)] mx-2 hover:cursor-pointer"
          onClick={() => {
            setIsMenuVisible((prev: boolean) => {
              return !prev;
            });
          }}
        ></FontAwesomeIcon>
        {isMenuVisible && (
          <div className="absolute right-0 mt-2 mr-2 z-50 w-64">
            <Menu setIsMenuVisible={setIsMenuVisible} />
          </div>
        )}
      </div>
    </header>
  );
}
