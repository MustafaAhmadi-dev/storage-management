import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";
import MobileNavigation from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Loader from "./loading";

export const dynamic = "force-dynamic";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser} />
      <section className="flex flex-col flex-1 h-full">
        <MobileNavigation {...currentUser} />

        <Header userId={currentUser.$id} accountId={currentUser.accountId} />

        <div className="main-content">
          <Suspense fallback={<Loader />}>{children}</Suspense>
        </div>
      </section>

      <Toaster />
    </main>
  );
}
