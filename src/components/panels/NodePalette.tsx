"use client";

import {
  MessageSquareText,
  Sparkles,
  ShieldCheck,
  Rocket,
  StickyNote,
  Mountain,
} from "lucide-react";
import type { FlowNodeType } from "@/types/flow";
import type { DragEvent } from "react";

const PALETTE: {
  type: FlowNodeType;
  label: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    type: "prompt",
    label: "Prompt",
    hint: "Describe the contract in plain English",
    icon: <MessageSquareText size={15} />,
    accent: "#3ddc97",
  },
  {
    type: "generate",
    label: "Generate",
    hint: "AI writes Solidity for Avalanche",
    icon: <Sparkles size={15} />,
    accent: "#e84142",
  },
  {
    type: "audit",
    label: "Audit",
    hint: "Security + gas review",
    icon: <ShieldCheck size={15} />,
    accent: "#f0b429",
  },
  {
    type: "deploy",
    label: "Deploy",
    hint: "Preview a Fuji deploy script",
    icon: <Rocket size={15} />,
    accent: "#5b8def",
  },
  {
    type: "note",
    label: "Note",
    hint: "Freeform annotation",
    icon: <StickyNote size={15} />,
    accent: "#5c626c",
  },
];

function onDragStart(e: DragEvent<HTMLDivElement>, type: FlowNodeType) {
  e.dataTransfer.setData("application/flow-node-type", type);
  e.dataTransfer.effectAllowed = "move";
}

export function NodePalette() {
  return (
    <aside className="w-[220px] shrink-0 border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-[var(--border-hairline)]">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--accent-avax)]/15 text-[var(--accent-avax)]">
          <Mountain size={15} />
        </span>
        <div>
          <div className="text-[13px] font-semibold leading-tight">
            Flow Builder
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">
            Avalanche C-Chain
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        Nodes
      </div>

      <div className="px-3 flex flex-col gap-1.5">
        {PALETTE.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className="group cursor-grab active:cursor-grabbing flex items-start gap-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-2.5 py-2.5 hover:border-[var(--border-strong)] transition-colors"
          >
            <span
              className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
              style={{ background: `${item.accent}1a`, color: item.accent }}
            >
              {item.icon}
            </span>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-[var(--text-primary)] leading-tight">
                {item.label}
              </div>
              <div className="text-[10.5px] text-[var(--text-tertiary)] leading-snug mt-0.5">
                {item.hint}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto px-4 py-4 border-t border-[var(--border-hairline)]">
        <p className="text-[10.5px] text-[var(--text-tertiary)] leading-snug">
          Drag a node onto the canvas, then connect Prompt → Generate → Audit
          → Deploy.
        </p>
      </div>
    </aside>
  );
}
