import { useState, useEffect } from "react";
import { Play, Square, Pause, Clock } from "lucide-react";
import useProjects from "../../hooks/useProjects";
import useTimeEntries from "../../hooks/useTimeEntries";

// ─── Types ────────────────────────────────────────────────────────

type TimerState = {
  isRunning: boolean;
  startTime: number | null;
  elapsedWhenPaused: number;
  projectId: string;
  description: string;
};

const DEFAULT_STATE: TimerState = {
  isRunning: false,
  startTime: null,
  elapsedWhenPaused: 0,
  projectId: "",
  description: "",
};

// ─── Component ────────────────────────────────────────────────────

export default function GlobalTimer() {
  const { projects } = useProjects();
  const { createTimeEntry } = useTimeEntries();

  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem("ekaflow_timer_state");
    return saved ? (JSON.parse(saved) as TimerState) : DEFAULT_STATE;
  });

  const [displaySeconds, setDisplaySeconds] = useState(0);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("ekaflow_timer_state", JSON.stringify(state));
  }, [state]);

  // Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.isRunning && state.startTime) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - state.startTime!) / 1000);
        setDisplaySeconds(state.elapsedWhenPaused + diff);
      }, 1000);
    } else {
      setDisplaySeconds(state.elapsedWhenPaused);
    }
    return () => clearInterval(interval);
  }, [state.isRunning, state.startTime, state.elapsedWhenPaused]);

  const getTotalElapsed = () => {
    if (state.isRunning && state.startTime) {
      return (
        state.elapsedWhenPaused +
        Math.floor((Date.now() - state.startTime) / 1000)
      );
    }
    return state.elapsedWhenPaused;
  };

  const handleStart = () =>
    setState((s) => ({ ...s, isRunning: true, startTime: Date.now() }));

  const handlePause = () => {
    setState((s) => ({
      ...s,
      isRunning: false,
      startTime: null,
      elapsedWhenPaused: getTotalElapsed(),
    }));
  };

  const handleStop = async () => {
    const totalSeconds = getTotalElapsed();
    const durationMinutes = Math.floor(totalSeconds / 60);

    if (durationMinutes > 0 && state.projectId && state.description) {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);
      await createTimeEntry({
        project_id: state.projectId,
        description: state.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
      });
    } else if (durationMinutes === 0) {
      alert("Timer was stopped before 1 minute elapsed. Time entry not saved.");
    } else if (!state.projectId || !state.description) {
      alert(
        "Please select a project and enter a description to save the time entry.",
      );
      handlePause();
      return;
    }

    setState(DEFAULT_STATE);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const isActive = state.isRunning || state.elapsedWhenPaused > 0;

  return (
    <div
      className="flex items-center gap-2"
      style={{
        background: state.isRunning
          ? "rgba(34,197,94,0.08)"
          : "var(--ek-bg-base)",
        border: `1.5px solid ${state.isRunning ? "#BBF7D0" : "var(--ek-border)"}`,
        borderRadius: "var(--ek-radius-md)",
        padding: "6px 12px",
        transition: "all 0.2s ease",
      }}
    >
      {/* Clock icon */}
      <Clock
        size={14}
        style={{
          color: state.isRunning ? "#16A34A" : "var(--ek-text-tertiary)",
          flexShrink: 0,
          transition: "color 0.2s",
        }}
      />

      {/* Project select */}
      <select
        value={state.projectId}
        onChange={(e) => setState((s) => ({ ...s, projectId: e.target.value }))}
        style={{
          fontSize: 12,
          border: "none",
          background: "transparent",
          outline: "none",
          color: "var(--ek-text-secondary)",
          width: 88,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
        aria-label="Select project"
      >
        <option value="">Project</option>
        {projects
          .filter((p) => p.status !== "completed")
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>

      {/* Description */}
      <input
        type="text"
        placeholder="What are you working on?"
        value={state.description}
        onChange={(e) =>
          setState((s) => ({ ...s, description: e.target.value }))
        }
        style={{
          fontSize: 12,
          border: "none",
          background: "transparent",
          outline: "none",
          color: "var(--ek-text-secondary)",
          width: 130,
          fontFamily: "inherit",
        }}
        aria-label="Timer description"
      />

      {/* Timer display */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 700,
          color: state.isRunning ? "#16A34A" : "var(--ek-text-primary)",
          width: 68,
          textAlign: "center",
          letterSpacing: "0.05em",
          transition: "color 0.2s",
          flexShrink: 0,
        }}
        aria-live="polite"
        aria-label={`Timer: ${formatTime(displaySeconds)}`}
      >
        {formatTime(displaySeconds)}
      </div>

      {/* Controls */}
      <div
        className="flex items-center gap-1"
        style={{ paddingLeft: 8, borderLeft: "1px solid var(--ek-border)" }}
      >
        {!state.isRunning ? (
          <button
            onClick={handleStart}
            className="ek-btn-icon"
            title="Start timer"
            aria-label="Start timer"
            style={{ color: "#16A34A", padding: 5 }}
          >
            <Play size={15} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="ek-btn-icon"
            title="Pause timer"
            aria-label="Pause timer"
            style={{ color: "#D97706", padding: 5 }}
          >
            <Pause size={15} strokeWidth={2.5} />
          </button>
        )}

        {isActive && (
          <button
            onClick={handleStop}
            disabled={!state.projectId && state.elapsedWhenPaused === 0}
            className="ek-btn-icon"
            title="Stop and save"
            aria-label="Stop and save"
            style={{ color: "var(--ek-danger)", padding: 5 }}
          >
            <Square size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
