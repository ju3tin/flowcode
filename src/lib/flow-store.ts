import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "reactflow";
import type {
  FlowEdge,
  FlowNode,
  FlowNodeData,
  FlowNodeType,
  GenerateNodeData,
  AuditNodeData,
  DeployNodeData,
  PromptNodeData,
} from "@/types/flow";

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function defaultDataFor(type: FlowNodeType): FlowNodeData {
  switch (type) {
    case "prompt":
      return {
        label: "Prompt",
        prompt: "Create a simple staking token with a 30-day lock period",
        status: "idle",
      } satisfies PromptNodeData;
    case "generate":
      return {
        label: "Generate Contract",
        status: "idle",
        model: "claude-sonnet-4-6",
      } satisfies GenerateNodeData;
    case "audit":
      return {
        label: "Audit Contract",
        status: "idle",
      } satisfies AuditNodeData;
    case "deploy":
      return {
        label: "Deploy to Fuji",
        status: "idle",
        network: "fuji",
      } satisfies DeployNodeData;
    case "note":
    default:
      return { label: "Note", text: "Add notes about this flow…" };
  }
}

interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: FlowNodeType, position: { x: number; y: number }) => string;
  updateNodeData: <T>(id: string, data: Partial<T>) => void;
  removeNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;

  getUpstreamNode: (id: string, type: FlowNodeType) => FlowNode | undefined;
  loadStarterFlow: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as FlowNode[] });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, animated: true, style: { strokeWidth: 2 } },
        get().edges
      ),
    });
  },

  addNode: (type, position) => {
    const id = nextId(type);
    const node: FlowNode = {
      id,
      type,
      position,
      data: defaultDataFor(type),
    };
    set({ nodes: [...get().nodes, node] });
    return id;
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  getUpstreamNode: (id, type) => {
    const { edges, nodes } = get();
    const incoming = edges.filter((e) => e.target === id);
    for (const edge of incoming) {
      const upstream = nodes.find((n) => n.id === edge.source);
      if (upstream?.type === type) return upstream;
      if (upstream) {
        // walk further upstream (chain of nodes)
        const found = get().getUpstreamNode(upstream.id, type);
        if (found) return found;
      }
    }
    return undefined;
  },

  loadStarterFlow: () => {
    const promptId = nextId("prompt");
    const generateId = nextId("generate");
    const auditId = nextId("audit");
    const deployId = nextId("deploy");

    const nodes: FlowNode[] = [
      {
        id: promptId,
        type: "prompt",
        position: { x: 60, y: 200 },
        data: defaultDataFor("prompt"),
      },
      {
        id: generateId,
        type: "generate",
        position: { x: 420, y: 200 },
        data: defaultDataFor("generate"),
      },
      {
        id: auditId,
        type: "audit",
        position: { x: 780, y: 200 },
        data: defaultDataFor("audit"),
      },
      {
        id: deployId,
        type: "deploy",
        position: { x: 1140, y: 200 },
        data: defaultDataFor("deploy"),
      },
    ];

    const edges: FlowEdge[] = [
      {
        id: nextId("edge"),
        source: promptId,
        target: generateId,
        animated: true,
        style: { strokeWidth: 2 },
      },
      {
        id: nextId("edge"),
        source: generateId,
        target: auditId,
        animated: true,
        style: { strokeWidth: 2 },
      },
      {
        id: nextId("edge"),
        source: auditId,
        target: deployId,
        animated: true,
        style: { strokeWidth: 2 },
      },
    ];

    set({ nodes, edges });
  },
}));
