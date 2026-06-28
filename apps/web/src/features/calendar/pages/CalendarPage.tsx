import { useMemo, useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import CalendarGrid from "../components/CalendarGrid";
import type { CalendarEvent } from "../components/CalendarGrid";
import useProjects from "../../../hooks/useProjects";
import useInvoices from "../../../hooks/useInvoices";
import useProposals from "../../../hooks/useProposals";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const { projects, isLoading: loadingProjects } = useProjects();
  const { invoices, isLoading: loadingInvoices } = useInvoices();
  const { proposals, isLoading: loadingProposals } = useProposals();

  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const d = new Date();
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const events = useMemo(() => {
    const evts: CalendarEvent[] = [];

    // Projects
    projects.forEach((p) => {
      if (p.due_date) {
        evts.push({
          id: `proj-due-${p.id}`,
          date: p.due_date.split("T")[0],
          title: `Due: ${p.name}`,
          type: "project",
          color: "red",
        });
      }
      if (p.start_date) {
        evts.push({
          id: `proj-start-${p.id}`,
          date: p.start_date.split("T")[0],
          title: `Start: ${p.name}`,
          type: "project",
          color: "blue",
        });
      }
    });

    // Invoices
    invoices.forEach((inv) => {
      if (inv.dueDate && inv.status !== "paid" && inv.status !== "cancelled") {
        evts.push({
          id: `inv-due-${inv.id}`,
          date: inv.dueDate.split("T")[0],
          title: `Inv Due: #${inv.invoiceNumber}`,
          type: "invoice",
          color: inv.status === "overdue" ? "red" : "yellow",
        });
      }
      if (inv.issueDate) {
        evts.push({
          id: `inv-issue-${inv.id}`,
          date: inv.issueDate.split("T")[0],
          title: `Inv Issued: #${inv.invoiceNumber}`,
          type: "invoice",
          color: "gray",
        });
      }
    });

    // Proposals
    proposals.forEach((prop) => {
      if (prop.created_at) {
        evts.push({
          id: `prop-${prop.id}`,
          date: prop.created_at.split("T")[0],
          title: `Prop: ${prop.title}`,
          type: "proposal",
          color: prop.status === "accepted" ? "green" : "purple",
        });
      }
    });

    return evts;
  }, [projects, invoices, proposals]);

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const isLoading = loadingProjects || loadingInvoices || loadingProposals;

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="Track all your deadlines, invoices, and proposals." />

      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 w-48">
            {monthName} {year}
          </h2>
          <button
            onClick={handleToday}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Loading calendar data...</div>
      ) : (
        <CalendarGrid year={year} month={month} events={events} />
      )}
    </div>
  );
}
