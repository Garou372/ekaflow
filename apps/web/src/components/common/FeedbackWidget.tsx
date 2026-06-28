import { useState } from "react";
import { MessageSquarePlus, X, Send, Camera } from "lucide-react";
import { submitFeedback, type FeedbackType } from "../../services/feedback.service";
import { useToast } from "../../hooks/useToast";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const { error } = await submitFeedback({
      feedback_type: type,
      title,
      description,
      screenshot: screenshot || undefined,
    });

    setIsSubmitting(false);

    if (error) {
      showError("Failed to submit feedback", error.message);
    } else {
      success("Feedback submitted", "Thank you for your feedback!");
      setIsOpen(false);
      setTitle("");
      setDescription("");
      setScreenshot(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-transform hover:scale-110"
        aria-label="Give Feedback"
      >
        <MessageSquarePlus size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between bg-gray-50 px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Send Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
              {(["bug", "feature", "general"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md capitalize transition-colors ${
                    type === t
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <input
                type="text"
                placeholder={
                  type === "bug"
                    ? "What went wrong?"
                    : type === "feature"
                    ? "What would you like?"
                    : "Feedback summary"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <textarea
                rows={4}
                placeholder="Please describe in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <div className="p-2 bg-gray-50 rounded-lg border">
                  <Camera size={16} />
                </div>
                <span>
                  {screenshot ? screenshot.name : "Attach Screenshot (Optional)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title || !description}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send size={16} /> Send Feedback
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
