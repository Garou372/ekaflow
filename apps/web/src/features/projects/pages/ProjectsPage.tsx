import { useMemo, useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import type { Project } from "../types/project";
import type { CreateProjectPayload } from "../types/project";
import useProjects from "../../../hooks/useProjects";
import useClients from "../../../hooks/useClients";
import useTimeEntries from "../../../hooks/useTimeEntries";
import useInvoices from "../../../hooks/useInvoices";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import InvoiceEditor from "../../invoices/components/InvoiceEditor";
import { getNextInvoiceNumber } from "../../invoices/utils/invoiceNumber";
import { timeEntriesToInvoiceLines } from "../../invoices/utils/timeToInvoice";
import type { CreateInvoiceInput } from "../../invoices/types/invoice";

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    creating,
    updating,
    deleting,
  } = useProjects();

  const { clients } = useClients();
  const { timeEntries, updateTimeEntry } = useTimeEntries();
  const { invoices, createInvoice, creating: creatingInvoice } = useInvoices();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [invoicingProject, setInvoicingProject] = useState<Project | undefined>();

  const nextInvoiceNumber = useMemo(
    () => getNextInvoiceNumber(invoices[0]?.invoiceNumber),
    [invoices],
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = search.toLowerCase();
      const clientName = clients.find((c) => c.id === project.client_id)?.name?.toLowerCase() || "";
      return (
        project.name.toLowerCase().includes(q) ||
        clientName.includes(q) ||
        (project.description && project.description.toLowerCase().includes(q))
      );
    });
  }, [projects, search, clients]);

  async function handleSubmit(payload: CreateProjectPayload) {
    if (editingProject) {
      await updateProject({ id: editingProject.id, payload });
    } else {
      await createProject(payload);
    }
    setEditingProject(undefined);
    setOpen(false);
  }

  function handleEdit(project: Project) {
    setEditingProject(project);
    setOpen(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await deleteProject(deletingId);
    } finally {
      setDeletingId(null);
    }
  }

  function handleInvoiceTime(project: Project) {
    setInvoicingProject(project);
  }

  async function handleInvoiceSubmit(data: CreateInvoiceInput) {
    await createInvoice(data);
    
    // Mark time entries as billed
    const unbilledEntries = timeEntries.filter(
      (e) => e.project_id === invoicingProject?.id && !e.is_billed
    );
    for (const entry of unbilledEntries) {
      await updateTimeEntry({ id: entry.id, payload: { is_billed: true } });
    }
    
    setInvoicingProject(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Manage your ongoing and completed projects.">
        <button
          onClick={() => {
            setEditingProject(undefined);
            setOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + New Project
        </button>
      </PageHeader>

      <input
        placeholder="Search projects by name, client, or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-2"
      />

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center bg-white">
          <h3 className="text-xl font-semibold text-gray-900">No Projects Found</h3>
          <p className="mt-2 text-gray-500">Create a project to start organizing your work.</p>
          <button
            onClick={() => setOpen(true)}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Add Project
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const unbilledTime = timeEntries
              .filter((e) => e.project_id === project.id && !e.is_billed)
              .reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);

            return (
              <ProjectCard
                key={project.id}
                project={project}
                clientName={clients.find((c) => c.id === project.client_id)?.name}
                unbilledMinutes={unbilledTime}
                onEdit={handleEdit}
                onDelete={setDeletingId}
                onInvoiceTime={handleInvoiceTime}
              />
            );
          })}
        </div>
      )}

      {open && (
        <ProjectForm
          clients={clients}
          initialValues={
            editingProject && {
              client_id: editingProject.client_id,
              name: editingProject.name,
              description: editingProject.description,
              status: editingProject.status,
              budget: editingProject.budget,
              hourly_rate: editingProject.hourly_rate,
              start_date: editingProject.start_date,
              due_date: editingProject.due_date,
              notes: editingProject.notes,
            }
          }
          onSubmit={handleSubmit}
          onClose={() => {
            setOpen(false);
            setEditingProject(undefined);
          }}
          isSubmitting={creating || updating}
        />
      )}

      {deletingId && (
        <DeleteConfirmModal
          title="Delete Project"
          description="Are you sure you want to delete this project? This will remove all associated time entries and expenses."
          isDeleting={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {invoicingProject && (
        <InvoiceEditor
          clients={clients}
          isSubmitting={creatingInvoice}
          nextInvoiceNumber={nextInvoiceNumber}
          conversionValues={{
            clientId: invoicingProject.client_id,
            projectId: invoicingProject.id,
            invoiceNumber: nextInvoiceNumber,
            issueDate: new Date().toISOString().split("T")[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            lineItems: timeEntriesToInvoiceLines(
              timeEntries.filter((e) => e.project_id === invoicingProject.id && !e.is_billed),
              invoicingProject.hourly_rate
            ),
            discountRate: 0,
            taxRate: 0,
          }}
          onSubmit={handleInvoiceSubmit}
          onClose={() => setInvoicingProject(undefined)}
        />
      )}
    </div>
  );
}
