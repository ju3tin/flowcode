"use client";

import { Rocket, Play } from "lucide-react";
import { NodeShell } from "./NodeShell";
import { useFlowStore } from "@/lib/flow-store";
import type {
  AuditNodeData,
  DeployNodeData,
  DeployPreviewResponse,
  GenerateNodeData,
} from "@/types/flow";
import type { NodeProps } from "reactflow";

export function DeployNode({ id, data, selected }: NodeProps<DeployNodeData>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData<DeployNodeData>);
  const getUpstreamNode = useFlowStore((s) => s.getUpstreamNode);

  async function handleRun() {
    const generateNode = getUpstreamNode(id, "generate");
    const generateData = generateNode?.data as GenerateNodeData | undefined;
    const auditNode = getUpstreamNode(id, "audit");
    const auditData = auditNode?.data as AuditNodeData | undefined;

    if (!generateData?.generatedCode || !generateData?.contractName) {
      updateNodeData(id, {
        status: "error",
        error: "Connect a Generate node with generated code first.",
      });
      return;
    }

    if (auditNode && auditData?.status !== "success") {
      updateNodeData(id, {
        status: "error",
        error: "Run the connected Audit node before previewing deployment.",
      });
      return;
    }

    updateNodeData(id, { status: "running", error: undefined });

    try {
      const res = await fetch("/api/deploy-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: generateData.generatedCode,
          contractName: generateData.contractName,
          network: data.network,
          constructorArgs: data.constructorArgs,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${res.status})`);
      }

      const result: DeployPreviewResponse = await res.json();
      updateNodeData(id, {
        status: "success",
        deployScript: result.deployScript,
        abiPreview: result.abiPreview,
      });
    } catch (e) {
      updateNodeData(id, {
        status: "error",
        error: e instanceof Error ? e.message : "Preview generation failed",
      });
    }
  }

  return (
    <NodeShell
      kind="deploy"
      icon={<Rocket size={13} />}
      eyebrow="Deploy · Preview only"
      title={data.label}
      status={data.status}
      selected={selected}
      hasOutput={false}
      width={280}
    >
      <div className="flex items-center justify-between mb-2">
        <select
          className="nodrag text-[11px] bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-md px-1.5 py-1 text-[var(--text-secondary)] focus:outline-none focus:border-[#5b8def]"
          value={data.network}
          onChange={(e) =>
            updateNodeData(id, {
              network: e.target.value as DeployNodeData["network"],
            })
          }
        >
          <option value="fuji">Fuji testnet</option>
          <option value="avalanche-mainnet">C-Chain mainnet</option>
        </select>
        <button
          onClick={handleRun}
          disabled={data.status === "running"}
          className="nodrag flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#5b8def]/12 text-[#5b8def] hover:bg-[#5b8def]/20 disabled:opacity-50 transition-colors"
        >
          <Play size={10} fill="currentColor" />
          Preview
        </button>
      </div>

      {data.deployScript && (
        <pre className="nodrag thin-scroll bg-[var(--bg-raised)] border border-[var(--border-hairline)] rounded-lg p-2 text-[10px] leading-snug text-[var(--text-secondary)] font-mono max-h-24 overflow-auto whitespace-pre-wrap">
          {data.deployScript.slice(0, 260)}…
        </pre>
      )}

      {data.error && (
        <div className="text-[10.5px] text-[var(--accent-critical)] leading-snug">
          {data.error}
        </div>
      )}

      {!data.deployScript && !data.error && data.status !== "running" && (
        <div className="text-[10.5px] text-[var(--text-tertiary)] leading-snug">
          Generates a deploy script preview — no transaction is sent.
        </div>
      )}
    </NodeShell>
  );
}
