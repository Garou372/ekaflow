import PageHeader from "../../../components/common/PageHeader";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Welcome to EkaFlow" />

      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">🚀 EkaFlow Dashboard</h2>

        <p className="mt-2 text-gray-500">
          Proposal → Contract → Invoice → Payment
        </p>
      </div>
    </div>
  );
}
