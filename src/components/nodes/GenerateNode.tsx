"use client";

import { Sparkles, Play, FileCode2 } from "lucide-react";
import { NodeShell } from "./NodeShell";
import { useFlowStore } from "@/lib/flow-store";
import type {
  GenerateNodeData,
  GenerateResponse,
  PromptNodeData,
} from "@/types/flow";
import type { NodeProps } from "reactflow";

export function GenerateNode({ id, data, selected }: NodeProps<GenerateNodeData>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData<GenerateNodeData>);
  const getUpstreamNode = useFlowStore((s) => s.getUpstreamNode);

  async function handleRun() {
    const promptNode = getUpstreamNode(id, "prompt");
    const promptData = promptNode?.data as PromptNodeData | undefined;

    if (!promptData?.prompt?.trim()) {
      updateNodeData(id, {
        status: "error",
        error: "Connect a Prompt node with a description first.",
      });
      return;
    }

    updateNodeData(id, { status: "running", error: undefined });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptData.prompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${res.status})`);
      }

      const result: GenerateResponse = await res.json();
      updateNodeData(id, {
        status: "success",
        generatedCode: result.code,
        contractName: result.contractName,
      });
    } catch (e) {
      updateNodeData(id, {
        status: "error",
        error: e instanceof Error ? e.message : "Generation failed",
      });
    }
  }

  return (
    <NodeShell
      kind="generate"
      icon={<Sparkles size={13} />}
      eyebrow="Generate"
      title={data.label}
      status={data.status}
      selected={selected}
      width={280}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono">
          {data.model}
        </span>
        <button
          onClick={handleRun}
          disabled={data.status === "running"}
          className="nodrag flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--accent-avax)]/12 text-[var(--accent-avax)] hover:bg-[var(--accent-avax)]/20 disabled:opacity-50 transition-colors"
        >
          <Play size={10} fill="currentColor" />
          Run
        </button>
      </div>

      {data.contractName && (
        <div className="flex items-center gap-1.5 mb-1.5 text-[11.5px] text-[var(--text-primary)]">
          <FileCode2 size={12} className="text-[var(--text-tertiary)]" />
          <span className="font-mono truncate">{data.contractName}.sol</span>
        </div>
      )}

      {data.generatedCode && (
        <pre className="nodrag thin-scroll bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-lg p-2 text-[10px] leading-snug text-[var(--text-secondary)] font-mono max-h-24 overflow-auto whitespace-pre-wrap">
          {data.generatedCode.slice(0, 300)}
          {data.generatedCode.length > 300 ? "…" : ""}
        </pre>
      )}

      {data.error && (
        <div className="text-[10.5px] text-[var(--accent-critical)] leading-snug">
          {data.error}
        </div>
      )}

      {!data.generatedCode && !data.error && data.status !== "running" && (
        <div className="text-[10.5px] text-[var(--text-tertiary)] leading-snug">
          Runs Claude against the connected Prompt node.
        </div>
      )}
    </NodeShell>
  );
}
