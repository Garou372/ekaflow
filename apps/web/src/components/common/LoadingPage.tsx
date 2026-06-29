import { Zap } from "lucide-react";

export default function LoadingPage() {
  return (
    <div
      className="flex h-[50vh] w-full items-center justify-center"
      role="status"
      aria-label="Loading content"
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        {/* Animated logo mark */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #5B5CEB 0%, #8B5CF6 100%)",
            boxShadow: "0 4px 20px rgba(91, 92, 235, 0.30)",
            animation: "ek-pulse 1.6s ease-in-out infinite",
          }}
        >
          <Zap size={22} color="white" strokeWidth={2.5} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p
            className="font-semibold"
            style={{ fontSize: 14, color: "var(--ek-text-primary)" }}
          >
            Loading…
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--ek-text-tertiary)" }}
          >
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
}
