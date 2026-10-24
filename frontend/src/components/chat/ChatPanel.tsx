"use client";

import { MessageSquarePlus } from "lucide-react";
import { useEffect, useRef } from "react";

import { Composer } from "@/components/chat/Composer";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { TurnView } from "@/components/chat/TurnView";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useChat } from "@/hooks/useChat";
import type { DatasetRecord } from "@/types/api";

interface Props {
  dataset: DatasetRecord;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
}

export function ChatPanel({ dataset, conversationId, setConversationId }: Props) {
  const { turns, send, busy, newConversation } = useChat(dataset.id, conversationId, setConversationId);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  if (dataset.status === "processing") {
    return (
      <Centered>
        <Spinner label="Cleaning and profiling your files. This usually takes a few seconds." />
      </Centered>
    );
  }
  if (dataset.status === "failed" || !dataset.profile) {
    return (
      <Centered>
        <p role="alert" className="text-sm text-danger">
          {dataset.error ?? "We couldn't process these files."} Replace the files and try again.
        </p>
      </Centered>
    );
  }

  const suggestions = dataset.profile.suggested_questions;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-12" aria-live="polite">
        <div className="mx-auto max-w-3xl space-y-10">
          {turns.length === 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">What do you want to know?</h2>
              <p className="max-w-prose text-sm text-muted">
                Ask in plain language. Questions can span every file you added, and you can follow up
                (“now break it down by category”).
              </p>
              <SuggestionChips items={suggestions} onPick={send} disabled={busy} />
            </section>
          ) : (
            turns.map((turn, i) => (
              <TurnView key={turn.id} turn={turn} isLatest={i === turns.length - 1} onFollowUp={send} busy={busy} />
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-rule bg-paper px-6 py-4 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-2">
          <Composer onSend={send} disabled={busy} />
          {turns.length > 0 && (
            <Button variant="ghost" size="sm" onClick={newConversation} disabled={busy}>
              <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
              Start a new thread
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted">{children}</div>;
}
