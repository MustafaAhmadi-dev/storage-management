import { Suspense } from "react";
import Dashboard from "./_components/Dashboard";
import DashboardSkeleton from "./_components/DashboardSkeleton";

export default function Home() {
  return (
    <>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  );
}
