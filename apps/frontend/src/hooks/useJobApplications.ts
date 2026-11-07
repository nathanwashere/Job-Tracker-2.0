import { useEffect, useState } from "react";
import { useUser } from "./userContextHook";
import { getJobApplications } from "../api/jobApplication";
import type { Job } from "../types/jobType";

// Filters by company, position, location or job type (ignores upper/lower case)
export function searchJobs(jobs: Job[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return jobs;
  return jobs.filter(
    (j) =>
      j.company?.toLowerCase().includes(q) ||
      j.position?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.jobType?.toLowerCase().includes(q),
  );
}

export function useJobApplications() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function wrapperGetJobApplications() {
    if (!user) {
      return;
    }
    try {
      const jobApplications = await getJobApplications();
      setJobs(jobApplications);
    } catch (error) {
      console.error(
        `Error while using 'useJobApplications.ts', error: ${error}`,
      );
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    wrapperGetJobApplications();
  }, [user]);

  return { jobs, setJobs, loaded };
}
