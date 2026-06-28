import { useState, useEffect } from "react";
import PageHeader from "../../../components/common/PageHeader";
import { Users, Building2, CreditCard, MessageSquare } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, workspaces: 0, mrr: 0, feedback: 0 });
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      // Note: In a real app, these would be admin-only RPC calls or secure views
      // For Sprint 11, we assume the admin has proper RLS bypass or these are 
      // queried securely.
      
      try {
        const [
          { count: usersCount },
          { count: workspacesCount },
          { data: recentUsers },
          { data: recentFeedback, count: feedbackCount }
        ] = await Promise.all([
          supabase.from("users_secure_view").select("*", { count: 'exact', head: true }), // Assuming a view exists or we mock it
          supabase.from("workspaces").select("*", { count: 'exact', head: true }),
          supabase.from("users_secure_view").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("feedback").select("*", { count: 'exact' }).order("created_at", { ascending: false }).limit(10)
        ]);

        setStats({
          users: usersCount || 0,
          workspaces: workspacesCount || 0,
          mrr: 0, // Mocked for now
          feedback: feedbackCount || 0
        });

        setRecentSignups(recentUsers || []);
        setFeedbacks(recentFeedback || []);
      } catch (e) {
        console.error("Failed to load admin data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading platform statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Platform statistics and system management" />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Workspaces", value: stats.workspaces, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "MRR (₹)", value: `₹${stats.mrr}`, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Feedback Items", value: stats.feedback, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-100" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Signups */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold text-gray-900">Recent Signups</h3>
          </div>
          <div className="p-0">
            {recentSignups.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">No recent signups.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentSignups.map((user, i) => (
                  <li key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name || "Unknown User"}</p>
                      <p className="text-sm text-gray-500">{user.email || "No email"}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Feedback List */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold text-gray-900">Recent Feedback & Bugs</h3>
          </div>
          <div className="p-0">
            {feedbacks.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">No feedback yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {feedbacks.map((item, i) => (
                  <li key={i} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium capitalize ${
                        item.feedback_type === "bug" ? "bg-red-100 text-red-700" :
                        item.feedback_type === "feature" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {item.feedback_type}
                      </span>
                      <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
