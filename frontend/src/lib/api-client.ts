import { API_URL } from "@/lib/config";
import type {
  ChatRequest,
  ChatResponse,
  ConversationHistory,
  DatasetRecord,
} from "@/types/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(0, "network_error", "Can't reach the server. Check that the backend is running.");
  }
  if (!res.ok) {
    let body: { error?: { code?: string; message?: string; details?: unknown } } = {};
    try {
      body = await res.json();
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(
      res.status,
      body.error?.code ?? "http_error",
      body.error?.message ?? `Request failed (${res.status})`,
      body.error?.details,
    );
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  uploadDataset(files: File[]): Promise<DatasetRecord> {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return request("/datasets", { method: "POST", body: form });
  },
  createSampleDataset: (): Promise<DatasetRecord> => request("/datasets/sample", { method: "POST" }),
  getDataset: (id: string): Promise<DatasetRecord> => request(`/datasets/${id}`),
  deleteDataset: (id: string): Promise<void> => request(`/datasets/${id}`, { method: "DELETE" }),
  chat: (body: ChatRequest): Promise<ChatResponse> => request("/chat", json(body)),
  getConversation: (conversationId: string, datasetId: string): Promise<ConversationHistory> =>
    request(`/conversations/${conversationId}?dataset_id=${encodeURIComponent(datasetId)}`),
};
