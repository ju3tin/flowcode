import type { Node, Edge } from "reactflow";

/**
 * The kinds of nodes available on the canvas.
 * Maps 1:1 to a node component + a step in the pipeline
 * (Prompt -> Generate -> Audit -> Deploy), but nodes can be
 * wired in any order / combination the user wants.
 */
export type FlowNodeType = "prompt" | "generate" | "audit" | "deploy" | "note";

export type NodeStatus = "idle" | "running" | "success" | "error";

/** Data payload stored on a Prompt node. */
export interface PromptNodeData {
  label: string;
  prompt: string;
  status: NodeStatus;
}

/** Data payload stored on a Generate (AI codegen) node. */
export interface GenerateNodeData {
  label: string;
  status: NodeStatus;
  model: string;
  generatedCode?: string;
  contractName?: string;
  error?: string;
}

export type AuditSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface AuditFinding {
  id: string;
  severity: AuditSeverity;
  title: string;
  description: string;
  line?: number;
  recommendation: string;
}

export interface GasFinding {
  id: string;
  title: string;
  description: string;
  estimatedSavings?: string;
}

/** Data payload stored on an Audit node. */
export interface AuditNodeData {
  label: string;
  status: NodeStatus;
  findings?: AuditFinding[];
  gasFindings?: GasFinding[];
  score?: number; // 0-100 overall safety score
  summary?: string;
  error?: string;
}

export type DeployNetwork = "fuji" | "avalanche-mainnet";

/** Data payload stored on a Deploy node (preview-only, no real tx). */
export interface DeployNodeData {
  label: string;
  status: NodeStatus;
  network: DeployNetwork;
  constructorArgs?: string;
  deployScript?: string;
  abiPreview?: string;
  error?: string;
}

export interface NoteNodeData {
  label: string;
  text: string;
}

export type FlowNodeData =
  | PromptNodeData
  | GenerateNodeData
  | AuditNodeData
  | DeployNodeData
  | NoteNodeData;

export type FlowNode = Node<FlowNodeData, FlowNodeType>;
export type FlowEdge = Edge;

/** Request body for /api/generate */
export interface GenerateRequest {
  prompt: string;
}

export interface GenerateResponse {
  contractName: string;
  code: string;
  explanation: string;
}

/** Request body for /api/audit */
export interface AuditRequest {
  code: string;
}

export interface AuditResponse {
  score: number;
  summary: string;
  findings: AuditFinding[];
  gasFindings: GasFinding[];
}

/** Request body for /api/deploy-preview */
export interface DeployPreviewRequest {
  code: string;
  contractName: string;
  network: DeployNetwork;
  constructorArgs?: string;
}

export interface DeployPreviewResponse {
  deployScript: string;
  abiPreview: string;
  notes: string[];
}
