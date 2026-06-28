import { useState, useEffect, useRef } from "react";
import { Play, Square, Pause } from "lucide-react";
import useProjects from "../../hooks/useProjects";
import useTimeEntries from "../../hooks/useTimeEntries";

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

export default function GlobalTimer() {
  const { projects } = useProjects();
  const { createTimeEntry } = useTimeEntries();

  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem("ekaflow_timer_state");
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });

  const [displaySeconds, setDisplaySeconds] = useState(0);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ekaflow_timer_state", JSON.stringify(state));
  }, [state]);

  // Timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (state.isRunning && state.startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - state.startTime!) / 1000);
        setDisplaySeconds(state.elapsedWhenPaused + diff);
      }, 1000);
    } else {
      setDisplaySeconds(state.elapsedWhenPaused);
    }

    return () => clearInterval(interval);
  }, [state.isRunning, state.startTime, state.elapsedWhenPaused]);

  // Calculate total elapsed seconds right now
  const getTotalElapsed = () => {
    if (state.isRunning && state.startTime) {
      return state.elapsedWhenPaused + Math.floor((Date.now() - state.startTime) / 1000);
    }
    return state.elapsedWhenPaused;
  };

  const handleStart = () => {
    setState((s) => ({
      ...s,
      isRunning: true,
      startTime: Date.now(),
    }));
  };

  const handlePause = () => {
    setState((s) => {
      const elapsed = getTotalElapsed();
      return {
        ...s,
        isRunning: false,
        startTime: null,
        elapsedWhenPaused: elapsed,
      };
    });
  };

  const handleStop = async () => {
    const totalSeconds = getTotalElapsed();
    const durationMinutes = Math.floor(totalSeconds / 60);

    if (durationMinutes > 0 && state.projectId && state.description) {
      // Calculate a theoretical start time by subtracting total duration from now
      // This works even if it was paused.
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
      alert("Please select a project and enter a description to save the time entry.");
      // We don't reset state here so they can fill it in and then save? 
      // Wait, if they hit stop and it fails validation, let's pause it instead.
      handlePause();
      return;
    }

    // Reset
    setState(DEFAULT_STATE);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 border px-3 py-1.5 shadow-sm">
      <select
        value={state.projectId}
        onChange={(e) => setState((s) => ({ ...s, projectId: e.target.value }))}
        className="text-xs border-none bg-transparent outline-none w-24 sm:w-32 truncate"
      >
        <option value="">Select Project</option>
        {projects.filter(p => p.status !== "completed").map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="What are you working on?"
        value={state.description}
        onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
        className="text-xs border-none bg-transparent outline-none w-32 sm:w-48 placeholder-gray-400 focus:ring-0"
      />

      <div className="font-mono text-sm font-medium text-gray-900 w-16 sm:w-20 text-center">
        {formatTime(displaySeconds)}
      </div>

      <div className="flex items-center gap-1 border-l pl-2">
        {!state.isRunning ? (
          <button
            onClick={handleStart}
            className="text-gray-500 hover:text-emerald-600 transition-colors"
            title="Start timer"
          >
            <Play size={18} />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="text-amber-500 hover:text-amber-600 transition-colors"
            title="Pause timer"
          >
            <Pause size={18} />
          </button>
        )}
        {(state.isRunning || state.elapsedWhenPaused > 0) && (
          <button
            onClick={handleStop}
            className="text-gray-500 hover:text-red-600 transition-colors"
            title="Stop and save"
          >
            <Square size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
