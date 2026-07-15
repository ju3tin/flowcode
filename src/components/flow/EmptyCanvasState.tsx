"use client";

import { Workflow } from "lucide-react";
import { useFlowStore } from "@/lib/flow-store";

export function EmptyCanvasState() {
  const loadStarterFlow = useFlowStore((s) => s.loadStarterFlow);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center max-w-sm pointer-events-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-hairline)] mb-4">
          <Workflow size={20} className="text-[var(--text-tertiary)]" />
        </div>
        <h2 className="text-[15px] font-semibold mb-1.5">
          Your canvas is empty
        </h2>
        <p className="text-[12.5px] text-[var(--text-tertiary)] leading-relaxed mb-4">
          Drag nodes from the left panel to build a pipeline, or start from
          the standard Prompt → Generate → Audit → Deploy flow.
        </p>
        <button
          onClick={loadStarterFlow}
          className="text-[12px] font-medium px-4 py-2 rounded-md bg-[var(--accent-avax)] text-white hover:bg-[var(--accent-avax)]/85 transition-colors"
        >
          Load starter flow
        </button>
      </div>
    </div>
  );
}
