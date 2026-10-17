// Types shared by the frontend and the backend.

export const JOB_STATUSES = [
  "Pending",
  "Accepted",
  "Rejected",
  "Interview Rejected",
  "Ghosted",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export type Job = {
  _id: string;
  company: string;
  position: string;
  status: JobStatus;
  date: string;
  location?: string;
  jobType?: string;
};

export type User = {
  firstName: string;
  lastName: string;
  email: string;
};
