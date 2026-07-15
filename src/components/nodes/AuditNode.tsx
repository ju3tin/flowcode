"use client";

import { ShieldCheck, Play } from "lucide-react";
import { NodeShell } from "./NodeShell";
import { useFlowStore } from "@/lib/flow-store";
import type {
  AuditNodeData,
  AuditResponse,
  GenerateNodeData,
} from "@/types/flow";
import type { NodeProps } from "reactflow";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "var(--accent-critical)",
  high: "#ff8a5c",
  medium: "var(--accent-warn)",
  low: "var(--accent-signal)",
  info: "var(--text-tertiary)",
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80
      ? "var(--accent-signal)"
      : score >= 50
      ? "var(--accent-warn)"
      : "var(--accent-critical)";
  return (
    <div
      className="flex items-center justify-center w-9 h-9 rounded-full text-[11px] font-semibold shrink-0"
      style={{
        background: `conic-gradient(${color} ${score * 3.6}deg, var(--bg-raised) 0deg)`,
      }}
    >
      <div className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)]">
        {score}
      </div>
    </div>
  );
}

export function AuditNode({ id, data, selected }: NodeProps<AuditNodeData>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData<AuditNodeData>);
  const getUpstreamNode = useFlowStore((s) => s.getUpstreamNode);

  async function handleRun() {
    const generateNode = getUpstreamNode(id, "generate");
    const generateData = generateNode?.data as GenerateNodeData | undefined;

    if (!generateData?.generatedCode) {
      updateNodeData(id, {
        status: "error",
        error: "Connect a Generate node with generated code first.",
      });
      return;
    }

    updateNodeData(id, { status: "running", error: undefined });

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: generateData.generatedCode }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${res.status})`);
      }

      const result: AuditResponse = await res.json();
      updateNodeData(id, {
        status: "success",
        score: result.score,
        summary: result.summary,
        findings: result.findings,
        gasFindings: result.gasFindings,
      });
    } catch (e) {
      updateNodeData(id, {
        status: "error",
        error: e instanceof Error ? e.message : "Audit failed",
      });
    }
  }

  const topFindings = data.findings?.slice(0, 3) ?? [];

  return (
    <NodeShell
      kind="audit"
      icon={<ShieldCheck size={13} />}
      eyebrow="Audit"
      title={data.label}
      status={data.status}
      selected={selected}
      width={290}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10.5px] text-[var(--text-tertiary)]">
          Security + gas review
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

      {typeof data.score === "number" && (
        <div className="flex items-center gap-2.5 mb-2">
          <ScoreRing score={data.score} />
          <p className="text-[11px] text-[var(--text-secondary)] leading-snug line-clamp-3">
            {data.summary}
          </p>
        </div>
      )}

      {topFindings.length > 0 && (
        <div className="space-y-1 mb-1">
          {topFindings.map((f) => (
            <div key={f.id} className="flex items-start gap-1.5 text-[10.5px]">
              <span
                className="mt-[3px] w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: SEVERITY_COLOR[f.severity] }}
              />
              <span className="text-[var(--text-secondary)] leading-snug line-clamp-1">
                {f.title}
              </span>
            </div>
          ))}
          {data.findings && data.findings.length > 3 && (
            <div className="text-[10px] text-[var(--text-tertiary)]">
              +{data.findings.length - 3} more findings
            </div>
          )}
        </div>
      )}

      {data.error && (
        <div className="text-[10.5px] text-[var(--accent-critical)] leading-snug">
          {data.error}
        </div>
      )}

      {typeof data.score !== "number" && !data.error && data.status !== "running" && (
        <div className="text-[10.5px] text-[var(--text-tertiary)] leading-snug">
          Runs Claude against the connected Generate node&apos;s code.
        </div>
      )}
    </NodeShell>
  );
}
