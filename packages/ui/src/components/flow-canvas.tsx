"use client";

import "../styles/flow-tokens.css";

import {
	Background,
	BackgroundVariant,
	Controls,
	type Edge,
	type Node,
	type NodeMouseHandler,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { useEffect } from "react";
import { FLOW_NODE_TYPES } from "./flow-nodes";
import { cn } from "../lib/utils";

export type FlowCanvasProps = {
	nodes: Node[];
	edges: Edge[];
	selectedId?: string | null;
	onNodeClick?: NodeMouseHandler;
	onNodeMoved?: (id: string, position: { x: number; y: number }) => void;
	className?: string;
	fitKey?: string;
};

function Fitter({ fitKey }: { fitKey?: string }) {
	const flow = useReactFlow();

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			void flow.fitView({ padding: 0.18, maxZoom: 1 });
		});
		return () => cancelAnimationFrame(frame);
	}, [flow, fitKey]);

	return null;
}

function Canvas({
	nodes,
	edges,
	onNodeClick,
	onNodeMoved,
	className,
	fitKey,
}: FlowCanvasProps) {
	return (
		<div className={cn("crm-flow relative min-h-0 min-w-0 flex-1", className)}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={FLOW_NODE_TYPES}
				onNodeClick={onNodeClick}
				onNodeDragStop={(_event, node) =>
					onNodeMoved?.(node.id, { x: node.position.x, y: node.position.y })
				}
				nodesConnectable={false}
				edgesFocusable={false}
				proOptions={{ hideAttribution: true }}
				minZoom={0.3}
				maxZoom={1.5}
				className="bg-muted"
			>
				<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
				<Controls showInteractive={false} position="bottom-left" />
				<Fitter fitKey={fitKey} />
			</ReactFlow>
		</div>
	);
}

export function FlowCanvas(props: FlowCanvasProps) {
	return (
		<ReactFlowProvider>
			<Canvas {...props} />
		</ReactFlowProvider>
	);
}

export type { Edge as FlowEdge, Node as FlowNode } from "@xyflow/react";
