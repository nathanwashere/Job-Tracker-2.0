import { apiUrl } from "./clients";
import type { Job, JobInput } from "../types/jobType";

export async function getJobApplications(): Promise<Job[]> {
  const response = await fetch(`${apiUrl}/job-applications`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Status: ${response.status}`);
  }
  const data = await response.json();
  return data.jobApplications;
}
export async function createJobApplication(job: JobInput): Promise<void> {
  const response = await fetch(`${apiUrl}/job-applications`, {
    method: "POST",
    body: JSON.stringify(job),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(
      `Error while creating a job application, status: ${response.status}`,
    );
  }
}
export async function editJobApplication(
  id: string,
  job: JobInput,
): Promise<void> {
  const response = await fetch(`${apiUrl}/job-applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(job),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(
      `Error while editing a job application, status: ${response.status}`,
    );
  }
}
