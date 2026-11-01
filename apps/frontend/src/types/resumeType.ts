export type Resume = {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  tag?: string;
  isDefault?: boolean;
  uploadedAt: string;
};
