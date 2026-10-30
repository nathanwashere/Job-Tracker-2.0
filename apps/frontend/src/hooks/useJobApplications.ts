import { useEffect, useState } from "react";
import { useUser } from "./userContextHook";
import { getJobApplications } from "../api/jobApplication";
import type { Job } from "../types/jobType";

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
