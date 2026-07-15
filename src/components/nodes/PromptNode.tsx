"use client";

import { MessageSquareText } from "lucide-react";
import { NodeShell } from "./NodeShell";
import { useFlowStore } from "@/lib/flow-store";
import type { PromptNodeData } from "@/types/flow";
import type { NodeProps } from "reactflow";

export function PromptNode({ id, data, selected }: NodeProps<PromptNodeData>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData<PromptNodeData>);

  return (
    <NodeShell
      kind="prompt"
      icon={<MessageSquareText size={13} />}
      eyebrow="Prompt"
      title={data.label}
      hasInput={false}
      selected={selected}
      width={280}
    >
      <textarea
        className="nodrag w-full text-[12px] leading-snug bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-lg p-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none focus:outline-none focus:border-[var(--accent-signal)] transition-colors"
        rows={4}
        value={data.prompt}
        placeholder="Describe the contract you want in plain English…"
        onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
      />
      <div className="mt-1.5 text-[10px] text-[var(--text-tertiary)]">
        Feeds into a Generate node
      </div>
    </NodeShell>
  );
}
