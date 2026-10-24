"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api-client";
import type { ChatResponse } from "@/types/api";

export interface Turn {
  id: string;
  question: string;
  status: "pending" | "done" | "error";
  response?: ChatResponse;
  error?: string;
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;

/** Multi-turn chat state for one dataset. Follow-ups work because we send the conversation id back. */
export function useChat(
  datasetId: string | null,
  conversationId: string | null,
  setConversationId: (id: string | null) => void,
) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const conversationRef = useRef(conversationId);
  conversationRef.current = conversationId;

  // Restore the thread after a page refresh; start empty for a new dataset.
  useEffect(() => {
    setTurns([]);
    const existing = conversationRef.current;
    if (!datasetId || !existing) return;
    let cancelled = false;
    api
      .getConversation(existing, datasetId)
      .then((history) => {
        if (cancelled) return;
        setTurns(
          history.messages.map((m) => ({ id: m.id, question: m.question, status: "done", response: m.response })),
        );
      })
      .catch(() => {
        if (!cancelled) setConversationId(null); // expired
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  const send = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!datasetId || !text) return;
      const id = newId();
      setTurns((t) => [...t, { id, question: text, status: "pending" }]);
      try {
        const response = await api.chat({
          dataset_id: datasetId,
          question: text,
          conversation_id: conversationRef.current ?? undefined,
        });
        setConversationId(response.conversation_id);
        setTurns((t) => t.map((x) => (x.id === id ? { ...x, status: "done", response } : x)));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong.";
        setTurns((t) => t.map((x) => (x.id === id ? { ...x, status: "error", error: message } : x)));
      }
    },
    [datasetId, setConversationId],
  );

  const newConversation = useCallback(() => {
    setConversationId(null);
    setTurns([]);
  }, [setConversationId]);

  return { turns, send, busy: turns.some((t) => t.status === "pending"), newConversation };
}
