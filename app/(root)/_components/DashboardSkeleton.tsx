import { Separator } from "@/components/ui/separator";

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-container">
      <section>
        <div className="w-full h-64 rounded-[20px] bg-gray-300 animate-pulse" />

        <ul className="dashboard-summary-list">
          <div className="space-y-4 h-28 rounded-[20px] bg-gray-300 animate-pulse">
            <div className="flex justify-between gap-3" />
            <Separator className="bg-light-400" />
          </div>
          <div className="space-y-4 h-28 rounded-[20px] bg-gray-300 animate-pulse">
            <div className="flex justify-between gap-3" />
            <Separator className="bg-light-400" />
          </div>
        </ul>
      </section>

      <section className="dashboard-recent-files animate-pulse rounded-[20px] bg-gray-300">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>

        <ul className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="recent-file-name">Trying to fetch data ...</p>
          </div>
        </ul>
      </section>
    </div>
  );
}
