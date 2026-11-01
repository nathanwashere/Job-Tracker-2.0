import { apiUrl } from "./clients";
import type { Resume } from "../types/resumeType";
export async function getAllResumes(): Promise<Resume[]> {
  const response = await fetch(`${apiUrl}/resume`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(
      `Error while fetching all resumes, status: ${response.status}`,
    );
  }
  const data = await response.json();
  console.log(data);
  return data.resumes;
}

export async function uploadResume(file: File, name: string): Promise<Resume> {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("name", name);

  // No Content-Type header: the browser sets it (with the form boundary) for FormData
  const response = await fetch(`${apiUrl}/resume/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Error while uploading resume, status: ${response.status}`,
    );
  }
  const data = await response.json();
  return data.resume;
}

export async function deleteResume(id: string): Promise<void> {
  const response = await fetch(`${apiUrl}/resume/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Error while deleting resume, status: ${response.status}`,
    );
  }
}

// Send only what changes: { name } to rename, { tag } to change the tag
export async function updateResume(
  id: string,
  changes: { name?: string; tag?: string },
): Promise<Resume> {
  const response = await fetch(`${apiUrl}/resume/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
    credentials: "include",
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Error while updating resume, status: ${response.status}`,
    );
  }
  const data = await response.json();
  return data.resume;
}

// Gets the file itself, for downloading or previewing
export async function getResumeFile(
  id: string,
  mode: "download" | "preview",
): Promise<Blob> {
  const response = await fetch(`${apiUrl}/resume/${id}/${mode}`, {
    credentials: "include",
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Error while loading resume file, status: ${response.status}`,
    );
  }
  return response.blob();
}
