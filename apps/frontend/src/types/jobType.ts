export type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  date: string;
  location?: string;
  jobType?: string;
  notes?: string;
};
export type JobInput = Omit<Job, "_id">; // "copy Job, but remove _id"
