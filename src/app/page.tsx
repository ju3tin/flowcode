"use client";

import { ReactFlowProvider } from "reactflow";
import { NodePalette } from "@/components/panels/NodePalette";
import { TopBar } from "@/components/panels/TopBar";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { EmptyCanvasState } from "@/components/flow/EmptyCanvasState";
import { useFlowStore } from "@/lib/flow-store";

export default function Home() {
  const nodeCount = useFlowStore((s) => s.nodes.length);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NodePalette />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="relative flex-1">
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
          {nodeCount === 0 && <EmptyCanvasState />}
        </div>
      </div>
    </div>
  );
}
