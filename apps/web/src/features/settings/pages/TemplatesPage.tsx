import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import useTemplates from "../../../hooks/useTemplates";
import type { TemplateType, CreateTemplatePayload, Template } from "../../../services/template.service";
import { Edit2, Plus, Trash2 } from "lucide-react";

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<TemplateType>("proposal");
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate, isDeleting } = useTemplates(activeTab);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const [formData, setFormData] = useState<CreateTemplatePayload>({
    name: "",
    template_type: "proposal",
    content: {},
    is_default: false,
  });

  const handleOpenForm = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        template_type: template.template_type,
        content: template.content,
        is_default: template.is_default,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        template_type: activeTab,
        content: {},
        is_default: false,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      await updateTemplate({ id: editingTemplate.id, payload: formData });
    } else {
      await createTemplate(formData);
    }
    handleCloseForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Manage your proposal, invoice, and email templates."
      >
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} />
          New Template
        </button>
      </PageHeader>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`pb-4 font-medium transition-colors ${activeTab === "proposal" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("proposal")}
        >
          Proposals
        </button>
        <button
          className={`pb-4 font-medium transition-colors ${activeTab === "invoice" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("invoice")}
        >
          Invoices
        </button>
        <button
          className={`pb-4 font-medium transition-colors ${activeTab === "email" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("email")}
        >
          Emails
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {isLoading ? (
          <p className="text-gray-500">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No {activeTab} templates found. Create one to get started.</p>
        ) : (
          <ul className="space-y-4">
            {templates.map(template => (
              <li key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-indigo-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {template.is_default && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Last updated: {new Date(template.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenForm(template)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm("Are you sure you want to delete this template?")) {
                        deleteTemplate(template.id);
                      }
                    }} 
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">{editingTemplate ? "Edit Template" : "New Template"}</h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON/Text)</label>
                <textarea 
                  value={typeof formData.content === 'string' ? formData.content : JSON.stringify(formData.content, null, 2)}
                  onChange={e => {
                    try {
                      setFormData({ ...formData, content: JSON.parse(e.target.value) });
                    } catch {
                      setFormData({ ...formData, content: e.target.value });
                    }
                  }}
                  rows={10}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:border-indigo-600 font-mono text-sm"
                  placeholder='{"subject": "Hello", "body": "World"}'
                />
              </div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_default}
                  onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Set as default {activeTab} template</span>
              </label>
              
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={handleCloseForm} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
