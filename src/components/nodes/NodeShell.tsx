"use client";

import { Handle, Position } from "reactflow";
import type { ReactNode } from "react";
import type { NodeStatus } from "@/types/flow";
import { Loader2, Check, X } from "lucide-react";

const ACCENT: Record<string, string> = {
  prompt: "#3ddc97",
  generate: "#e84142",
  audit: "#f0b429",
  deploy: "#5b8def",
  note: "#5c626c",
};

function StatusDot({ status }: { status?: NodeStatus }) {
  if (!status || status === "idle") return null;
  if (status === "running")
    return <Loader2 size={13} className="animate-spin text-[var(--text-secondary)]" />;
  if (status === "success")
    return (
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--accent-signal)]/15">
        <Check size={10} className="text-[var(--accent-signal)]" strokeWidth={3} />
      </span>
    );
  return (
    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--accent-critical)]/15">
      <X size={10} className="text-[var(--accent-critical)]" strokeWidth={3} />
    </span>
  );
}

interface NodeShellProps {
  kind: keyof typeof ACCENT;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  status?: NodeStatus;
  hasInput?: boolean;
  hasOutput?: boolean;
  selected?: boolean;
  width?: number;
  children?: ReactNode;
}

export function NodeShell({
  kind,
  icon,
  eyebrow,
  title,
  status,
  hasInput = true,
  hasOutput = true,
  selected,
  width = 260,
  children,
}: NodeShellProps) {
  const accent = ACCENT[kind];

  return (
    <div
      style={{ width }}
      className="rounded-xl overflow-hidden transition-shadow"
    >
      <div
        className="rounded-xl bg-[var(--bg-surface)] border"
        style={{
          borderColor: selected ? accent : "var(--border-hairline)",
          boxShadow: selected
            ? `0 0 0 1px ${accent}, 0 8px 24px -8px ${accent}55`
            : "0 4px 12px -6px rgba(0,0,0,0.4)",
        }}
      >
        {/* accent top bar */}
        <div className="h-[3px] w-full" style={{ background: accent }} />

        <div className="px-3.5 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2.5">
            <span
              className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
              style={{ background: `${accent}1a`, color: accent }}
            >
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="text-[9.5px] font-medium uppercase tracking-wider leading-none mb-0.5"
                style={{ color: accent }}
              >
                {eyebrow}
              </div>
              <div className="text-[13px] font-medium text-[var(--text-primary)] leading-tight truncate">
                {title}
              </div>
            </div>
            <StatusDot status={status} />
          </div>

          {children}
        </div>
      </div>

      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: 24 }}
        />
      )}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ top: 24 }}
        />
      )}
    </div>
  );
}
