/** Mirrors backend `app/schemas/*`. Keep in sync when the API changes. */

export type DatasetStatus = "processing" | "ready" | "failed";
export type FileStatus = "queued" | "processing" | "ready" | "failed";
export type ColumnKind = "integer" | "float" | "boolean" | "date" | "timestamp" | "text";

export interface TopValue {
  value: string;
  count: number;
}

export interface ColumnProfile {
  name: string;
  sql_type: string;
  kind: ColumnKind;
  non_null: number;
  null_count: number;
  null_pct: number;
  distinct_count: number;
  is_unique: boolean;
  min: number | string | null;
  max: number | string | null;
  mean: number | null;
  outlier_count: number | null;
  invalid_values: number;
  top_values: TopValue[];
  sample_values: string[];
}

export interface CleaningReport {
  rows_read: number;
  rows_written: number;
  empty_rows_removed: number;
  duplicate_rows_removed: number;
  dropped_columns: string[];
  renamed_columns: Record<string, string>;
  encoding: string;
}

export interface TableProfile {
  name: string;
  source_file: string;
  row_count: number;
  column_count: number;
  primary_key: string | null;
  columns: ColumnProfile[];
  cleaning: CleaningReport;
}

export interface Relationship {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
  cardinality: "many_to_one" | "one_to_one";
  match_rate: number | null;
}

export interface DatasetProfile {
  tables: TableProfile[];
  relationships: Relationship[];
  suggested_questions: string[];
}

export interface FileInfo {
  filename: string;
  table_name: string;
  size_bytes: number;
  status: FileStatus;
  error: string | null;
}

export interface DatasetRecord {
  id: string;
  status: DatasetStatus;
  created_at: string;
  updated_at: string;
  files: FileInfo[];
  profile: DatasetProfile | null;
  error: string | null;
  progress: number;
}

export type ChartType = "bar" | "line" | "area" | "pie" | "scatter";

export interface ChartPayload {
  type: ChartType;
  title: string | null;
  x_key: string;
  x_label: string | null;
  y_label: string | null;
  x_is_time: boolean;
  stacked: boolean;
  series: { key: string; label: string }[];
  data: Record<string, string | number | null>[];
  truncated: boolean;
}

export interface ResultTableData {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  total_rows: number;
  truncated: boolean;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
  sql: string | null;
  chart: ChartPayload | null;
  table: ResultTableData | null;
  followups: string[];
  assumptions: string[];
  meta: { elapsed_ms: number; sql_attempts: number; cached: boolean; row_count: number };
}

export interface StoredTurn {
  id: string;
  question: string;
  response: ChatResponse;
  created_at: string;
}

export interface ConversationHistory {
  conversation_id: string;
  dataset_id: string;
  messages: StoredTurn[];
}

export interface ChatRequest {
  dataset_id: string;
  question: string;
  conversation_id?: string;
}
