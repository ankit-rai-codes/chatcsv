"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import { usePersistentState } from "@/hooks/usePersistentState";
import { ApiError, api } from "@/lib/api-client";
import { STORAGE_KEYS } from "@/lib/config";
import type { DatasetRecord } from "@/types/api";

/** Owns "which dataset / conversation are we on" and keeps the dataset status fresh. */
export function useAnalysisSession() {
  const queryClient = useQueryClient();
  const [datasetId, setDatasetId, hydrated] = usePersistentState<string | null>(STORAGE_KEYS.datasetId, null);
  const [conversationId, setConversationId] = usePersistentState<string | null>(STORAGE_KEYS.conversationId, null);

  const datasetQuery = useQuery<DatasetRecord, ApiError>({
    queryKey: ["dataset", datasetId],
    queryFn: () => api.getDataset(datasetId as string),
    enabled: hydrated && !!datasetId,
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 1000 : false),
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
  });

  const adopt = useCallback(
    (record: DatasetRecord) => {
      queryClient.setQueryData(["dataset", record.id], record);
      setConversationId(null);
      setDatasetId(record.id);
    },
    [queryClient, setConversationId, setDatasetId],
  );

  const upload = useMutation<DatasetRecord, ApiError, File[]>({ mutationFn: api.uploadDataset, onSuccess: adopt });
  const loadSample = useMutation<DatasetRecord, ApiError, void>({ mutationFn: api.createSampleDataset, onSuccess: adopt });

  const reset = useCallback(() => {
    setConversationId(null);
    setDatasetId(null);
  }, [setConversationId, setDatasetId]);

  // The dataset expired server-side (TTL) or was deleted: start fresh.
  useEffect(() => {
    if (datasetQuery.error instanceof ApiError && datasetQuery.error.status === 404) reset();
  }, [datasetQuery.error, reset]);

  return {
    hydrated,
    datasetId,
    dataset: datasetId ? datasetQuery.data : undefined,
    isLoadingDataset: datasetQuery.isLoading,
    conversationId,
    setConversationId,
    upload,
    loadSample,
    reset,
  };
}
