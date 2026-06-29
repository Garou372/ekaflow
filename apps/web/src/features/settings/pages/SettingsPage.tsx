import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, CheckCircle } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import {
  getCompanyInfo,
  saveCompanyInfo,
  type CompanyInfo,
} from "../utils/companyInfo";

// ─── Schema ───────────────────────────────────────────────────────

const settingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  website: z.string().optional(),
  taxId: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// ─── Field component ──────────────────────────────────────────────

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="ek-label" htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p
          className="mt-1.5 text-xs font-medium"
          style={{ color: "var(--ek-danger)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    reset(getCompanyInfo());
  }, [reset]);

  const onSubmit = (data: SettingsFormData) => {
    saveCompanyInfo(data as CompanyInfo);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your company profile and billing preferences."
      />

      <div className="ek-card max-w-2xl overflow-hidden">
        {/* Card header */}
        <div
          className="px-6 py-5"
          style={{ borderBottom: "1px solid var(--ek-border)", background: "var(--ek-bg-subtle)" }}
        >
          <h2
            className="font-bold"
            style={{ fontSize: 16, color: "var(--ek-text-primary)" }}
          >
            Company Information
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--ek-text-secondary)" }}
          >
            Displayed on your proposals and invoices.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Company name */}
            <div className="md:col-span-2">
              <FormField
                id="companyName"
                label="Company name"
                error={errors.companyName?.message}
              >
                <input
                  id="companyName"
                  className="ek-input mt-1"
                  placeholder="Acme Studio"
                  {...register("companyName")}
                  aria-invalid={!!errors.companyName}
                />
              </FormField>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <FormField
                id="address"
                label="Business address"
                error={errors.address?.message}
              >
                <textarea
                  id="address"
                  rows={3}
                  className="ek-input mt-1 resize-none"
                  placeholder="123 Main Street, City, State 400001"
                  {...register("address")}
                  aria-invalid={!!errors.address}
                />
              </FormField>
            </div>

            {/* Email */}
            <FormField
              id="email"
              label="Business email"
              error={errors.email?.message}
            >
              <input
                id="email"
                type="email"
                className="ek-input mt-1"
                placeholder="hello@acme.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
            </FormField>

            {/* Website */}
            <FormField id="website" label="Website (optional)">
              <input
                id="website"
                className="ek-input mt-1"
                placeholder="https://acme.com"
                {...register("website")}
              />
            </FormField>

            {/* Tax ID */}
            <div className="md:col-span-2">
              <FormField id="taxId" label="Tax ID / GST number (optional)">
                <input
                  id="taxId"
                  className="ek-input mt-1"
                  placeholder="27AABCU9603R1ZX"
                  {...register("taxId")}
                />
              </FormField>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-4 pt-5"
            style={{ borderTop: "1px solid var(--ek-border)" }}
          >
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="ek-btn ek-btn-primary ek-btn-md"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                    style={{ animation: "ek-spin 0.8s linear infinite" }}
                  />
                  Saving…
                </span>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>

            {isSaved && (
              <span
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--ek-success)" }}
              >
                <CheckCircle size={15} />
                Saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
