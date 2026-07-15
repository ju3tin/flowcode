"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useFlowStore } from "@/lib/flow-store";

export function TopBar() {
  const loadStarterFlow = useFlowStore((s) => s.loadStarterFlow);
  const nodes = useFlowStore((s) => s.nodes);

  function handleClear() {
    useFlowStore.setState({ nodes: [], edges: [] });
  }

  return (
    <header className="h-14 shrink-0 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] flex items-center justify-between px-5">
      <div>
        <h1 className="text-[13.5px] font-semibold leading-tight">
          Untitled flow
        </h1>
        <p className="text-[10.5px] text-[var(--text-tertiary)] leading-tight">
          {nodes.length} node{nodes.length === 1 ? "" : "s"} · Fuji preview mode
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-md border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Trash2 size={12} />
          Clear
        </button>
        <button
          onClick={loadStarterFlow}
          className="flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-md bg-[var(--accent-avax)] text-white hover:bg-[var(--accent-avax)]/85 transition-colors"
        >
          <RotateCcw size={12} />
          Load starter flow
        </button>
      </div>
    </header>
  );
}
