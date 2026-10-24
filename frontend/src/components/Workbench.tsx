"use client";

import { ChatPanel } from "@/components/chat/ChatPanel";
import { DatasetPanel } from "@/components/dataset/DatasetPanel";
import { UploadPanel } from "@/components/upload/UploadPanel";
import { Spinner } from "@/components/ui/Spinner";
import { useAnalysisSession } from "@/hooks/useAnalysisSession";

export function Workbench() {
  const session = useAnalysisSession();
  const { dataset } = session;
  const uploadError = session.upload.error?.message ?? session.loadSample.error?.message;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[340px_1fr]">
      <aside className="space-y-6 border-b border-rule bg-paper p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <header>
          <h1 className="text-xl font-bold tracking-tight">CSV Analyst</h1>
          <p className="mt-1 text-sm text-muted">Ask questions across several CSV files and get answers with charts.</p>
        </header>

        {!session.hydrated || session.isLoadingDataset ? (
          <Spinner label="Loading" />
        ) : dataset ? (
          <DatasetPanel dataset={dataset} onReplace={session.reset} />
        ) : (
          <UploadPanel
            onUpload={(files) => session.upload.mutate(files)}
            onUseSample={() => session.loadSample.mutate()}
            busy={session.upload.isPending || session.loadSample.isPending}
            error={uploadError}
          />
        )}
      </aside>

      <main className="min-h-[70vh] min-w-0 bg-paper lg:h-screen">
        {dataset ? (
          <ChatPanel dataset={dataset} conversationId={session.conversationId} setConversationId={session.setConversationId} />
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-semibold">Start with your files</h2>
              <p className="text-sm text-muted">
                Add one or more CSV files on the left. We clean them, find how they connect, and then you can ask
                anything, like “Compare revenue across regions from two different files”.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
