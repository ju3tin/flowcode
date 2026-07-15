"use client";

import { useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type ReactFlowInstance,
} from "reactflow";
import { useFlowStore } from "@/lib/flow-store";
import type { FlowNodeType } from "@/types/flow";
import { PromptNode } from "@/components/nodes/PromptNode";
import { GenerateNode } from "@/components/nodes/GenerateNode";
import { AuditNode } from "@/components/nodes/AuditNode";
import { DeployNode } from "@/components/nodes/DeployNode";
import { NoteNode } from "@/components/nodes/NoteNode";

const nodeTypes = {
  prompt: PromptNode,
  generate: GenerateNode,
  audit: AuditNode,
  deploy: DeployNode,
  note: NoteNode,
};

export function FlowCanvas() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const addNode = useFlowStore((s) => s.addNode);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ReactFlowInstance | null>(null);

  const defaultEdgeOptions = useMemo(
    () => ({ animated: true, style: { strokeWidth: 2 } }),
    []
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData(
        "application/flow-node-type"
      ) as FlowNodeType;
      if (!type || !wrapperRef.current || !instanceRef.current) return;

      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = instanceRef.current.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div ref={wrapperRef} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => (instanceRef.current = instance)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.25}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border-hairline)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={() => "var(--border-strong)"}
          maskColor="rgba(10,11,13,0.7)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
