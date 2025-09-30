import { useRouter } from "next/navigation";
import { destroyCookie } from "nookies";

export default function Menu({ setIsMenuVisible }: { setIsMenuVisible: any }) {
  const router = useRouter();

  const handleSignOut = () => {
    destroyCookie(null, "jwt", { path: "/" });
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-y-2 p-2">
      <span className="block p-2 hover:bg-stone-100" onClick={handleSignOut}>
        Sign out
      </span>
      <span
        className="block p-2 hover:bg-stone-100"
        onClick={() => {
          setIsMenuVisible(false);
        }}
      >
        Close
      </span>
    </div>
  );
}
