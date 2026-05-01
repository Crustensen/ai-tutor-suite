import { IntelligentDashboard } from "@/components/dashboard/intelligent-dashboard";
import { SiteNav } from "@/components/site-nav";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav className="sticky top-0 z-10 backdrop-blur-sm" />
      <IntelligentDashboard />
    </div>
  );
}
