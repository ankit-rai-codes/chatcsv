const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const API_URL = `${base.replace(/\/$/, "")}/api/v1`;
export const MAX_FILES = 20;
export const STORAGE_KEYS = {
  datasetId: "chatcsv.datasetId",
  conversationId: "chatcsv.conversationId",
} as const;
