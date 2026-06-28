import { supabase } from "../lib/supabase";

export interface JobDefinition {
  job_name: string;
  payload: Record<string, any>;
  run_at?: string; // ISO String, defaults to now
}

export interface JobRecord extends JobDefinition {
  id: string;
  run_at: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
}

export interface JobProvider {
  enqueue(job: JobDefinition): Promise<void>;
  processDueJobs(): Promise<void>;
}

// Map of job_name to handler functions
type JobHandler = (payload: any) => Promise<void>;
const jobHandlers: Record<string, JobHandler> = {
  // Example dummy job for the mock ecosystem
  "email_follow_up": async (payload) => {
    console.log(`[JobHandler: email_follow_up] Executing for payload:`, payload);
    // In reality, this would call emailService.sendEmail(...)
  }
};

export class DefaultJobProvider implements JobProvider {
  async enqueue(job: JobDefinition): Promise<void> {
    const { error } = await supabase.from("job_queue").insert([{
      job_name: job.job_name,
      payload: job.payload,
      run_at: job.run_at || new Date().toISOString(),
      status: "pending"
    }]);

    if (error) {
      console.error("[JobProvider] Failed to enqueue job", error);
    }
  }

  async processDueJobs(): Promise<void> {
    try {
      // 1. Fetch pending jobs that are due
      const { data, error } = await supabase
        .from("job_queue")
        .select("*")
        .eq("status", "pending")
        .lte("run_at", new Date().toISOString())
        .limit(10); // Process in batches

      if (error) throw error;
      if (!data || data.length === 0) return;

      const jobs = data as JobRecord[];

      // 2. Mark them as processing
      const jobIds = jobs.map((j) => j.id);
      await supabase
        .from("job_queue")
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .in("id", jobIds);

      // 3. Execute handlers
      for (const job of jobs) {
        try {
          const handler = jobHandlers[job.job_name];
          if (handler) {
            await handler(job.payload);
          } else {
            console.warn(`[JobProvider] No handler found for job: ${job.job_name}`);
          }

          // Mark as completed
          await supabase
            .from("job_queue")
            .update({ status: "completed", updated_at: new Date().toISOString() })
            .eq("id", job.id);
        } catch (jobError: any) {
          console.error(`[JobProvider] Job ${job.id} failed:`, jobError);
          // Mark as failed
          await supabase
            .from("job_queue")
            .update({ 
              status: "failed", 
              error_message: jobError.message || "Unknown error",
              updated_at: new Date().toISOString() 
            })
            .eq("id", job.id);
        }
      }
    } catch (err) {
      console.error("[JobProvider] Error processing jobs", err);
    }
  }
}

export const jobService = new DefaultJobProvider();

/**
 * Browser-side scheduler simulator.
 * In a real SaaS, a backend Cron (e.g. pg_cron or Vercel Cron) would hit an API endpoint that calls `jobService.processDueJobs()`.
 * Here, we simulate that backend trigger via `setInterval`.
 */
export class BrowserJobScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(intervalMs: number = 60000) {
    if (this.intervalId) return;
    console.log(`[BrowserJobScheduler] Started polling every ${intervalMs}ms`);
    
    // Initial run
    jobService.processDueJobs();
    
    this.intervalId = setInterval(() => {
      jobService.processDueJobs();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log(`[BrowserJobScheduler] Stopped`);
    }
  }
}

export const browserScheduler = new BrowserJobScheduler();
