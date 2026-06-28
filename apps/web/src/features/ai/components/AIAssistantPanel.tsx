import { useState } from "react";
import { Sparkles, Copy, Check, ChevronDown } from "lucide-react";
import { aiService } from "../../../services/ai.service";
import type { AITaskType } from "../../../services/ai/AIProvider";
import { useToast } from "../../../hooks/useToast";
import UsageLimitGuard from "../../../components/common/UsageLimitGuard";

// ─── Task Config ──────────────────────────────────────────────────────────────

const TASK_OPTIONS: { value: AITaskType; label: string; placeholder: string }[] = [
  {
    value: "improve_proposal",
    label: "Improve Proposal",
    placeholder: "Paste your proposal content or describe the project...",
  },
  {
    value: "improve_invoice_notes",
    label: "Improve Invoice Notes",
    placeholder: "Paste your current invoice notes...",
  },
  {
    value: "generate_followup_email",
    label: "Follow-up Email",
    placeholder: "Client name, project name, how long since you sent the proposal...",
  },
  {
    value: "generate_meeting_summary",
    label: "Meeting Summary",
    placeholder: "Paste raw meeting notes or bullet points...",
  },
  {
    value: "generate_client_reply",
    label: "Client Reply",
    placeholder: "Paste the client message you want to reply to...",
  },
  {
    value: "generate_project_summary",
    label: "Project Summary",
    placeholder: "Describe the project status, completed work, blockers...",
  },
  {
    value: "categorize_expense",
    label: "Categorize Expense",
    placeholder: "Describe the expense (e.g. 'Adobe subscription for design work')...",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AIAssistantPanelProps {
  defaultTask?: AITaskType;
  defaultContext?: string;
  onInsert?: (text: string) => void;
  compact?: boolean;  // embed inside a form — no title
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIAssistantPanel({
  defaultTask = "improve_proposal",
  defaultContext = "",
  onInsert,
  compact = false,
}: AIAssistantPanelProps) {
  const [task, setTask] = useState<AITaskType>(defaultTask);
  const [context, setContext] = useState(defaultContext);
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { success, error: errorToast } = useToast();

  const currentTaskCfg = TASK_OPTIONS.find((t) => t.value === task)!;

  async function handleGenerate() {
    if (!context.trim()) {
      errorToast("Context required", "Please provide some context for the AI.");
      return;
    }

    setIsGenerating(true);
    setResult("");
    try {
      const output = await aiService.generate({
        taskType: task,
        context,
        tone: "professional",
      });
      setResult(output);
    } catch (err) {
      errorToast("AI generation failed", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 shadow-sm">
      {!compact && (
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-900">AI Productivity Assistant</h3>
          <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            Beta
          </span>
        </div>
      )}

      {/* Task Selector */}
      <div className="relative mb-3">
        <select
          value={task}
          onChange={(e) => {
            setTask(e.target.value as AITaskType);
            setResult("");
          }}
          className="w-full appearance-none rounded-lg border border-indigo-200 bg-white px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {TASK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {/* Context input */}
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder={currentTaskCfg.placeholder}
        rows={4}
        className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      {/* Generate button */}
      <UsageLimitGuard action="use_ai" onProceed={handleGenerate}>
        {({ onClick }) => (
          <button
            onClick={onClick}
            disabled={isGenerating || !context.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate with AI
              </>
            )}
          </button>
        )}
      </UsageLimitGuard>

      {/* Result */}
      {result && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Result</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
              {onInsert && (
                <button
                  onClick={() => onInsert(result)}
                  className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Insert
                </button>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-white p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
              {result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
