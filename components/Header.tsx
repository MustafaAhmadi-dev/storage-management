import Image from "next/image";
import { signoutUser } from "@/lib/actions/user.actions";
import FileUploader from "./FileUploader";
import { Button } from "./ui/button";
import Search from "./Search";

export default function Header({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={userId} accountId={accountId} />

        <form
          action={async () => {
            "use server";
            await signoutUser();
          }}
        >
          <Button type="submit" className="sign-out-button">
            <Image
              src="/assets/icons/logout.svg"
              alt="Logout"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </form>
      </div>
    </header>
  );
}
