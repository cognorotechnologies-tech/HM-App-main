import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
    MarkerType
} from '@xyflow/react';
import type {
    Connection,
    Edge,
    Node,
    NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import dagre from 'dagre';
import { Plus, MessageSquare, Clock, GitBranch, Mail, MessageCircle, Smartphone } from 'lucide-react';

import StartNode from './nodes/StartNode';
import ActionNode from './nodes/ActionNode';
import CommunicationNode from './nodes/CommunicationNode';
import LogicNode from './nodes/LogicNode';
import DelayNode from './nodes/DelayNode';
import ConfigPanel from './ConfigPanel';

const nodeTypes: NodeTypes = {
    start: StartNode,
    action: ActionNode,
    communication: CommunicationNode,
    logic: LogicNode,
    delay: DelayNode
};

const initialNodes: Node[] = [
    {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Workflow Trigger' },
        deletable: false
    }
];

interface WorkflowCanvasProps {
    initialSteps: any[];
    onStepsChange: (steps: any[]) => void;
}

// Layout Helper
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 120 });

    nodes.forEach((node) => {
        if (node && node.id) {
            // Adjust dimensions based on type
            const width = node.type === 'logic' ? 300 : 250;
            const height = node.type === 'delay' ? 80 : 100;
            dagreGraph.setNode(node.id, { width, height });
        }
    });

    // Validation: Ensure all edges point to existing nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    edges.forEach((edge) => {
        if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
            dagreGraph.setEdge(edge.source, edge.target);
        }
    });

    try {
        dagre.layout(dagreGraph);
    } catch (err) {
        console.warn('Dagre layout failed:', err);
        return { nodes, edges }; // Return original if layout fails
    }

    return {
        nodes: nodes.map((node) => {
            try {
                const nodeWithPosition = dagreGraph.node(node.id);
                // Fallback if node not found in graph for some reason
                if (!nodeWithPosition) return node;

                return {
                    ...node,
                    position: {
                        x: nodeWithPosition.x - 125, // center
                        y: nodeWithPosition.y - 50,
                    },
                };
            } catch (e) {
                return node;
            }
        }),
        edges
    };
};

// --- MAIN CANVAS COMPONENT ---
function Canvas({ initialSteps, onStepsChange }: WorkflowCanvasProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Ref to access current nodes without adding to dependency array
    const nodesRef = useRef<Node[]>(nodes);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Ref to track if the update came from internal changes
    // This prevents the canvas from resetting when the parent updates props due to our own change
    const lastExportedSteps = useRef<string>('');

    // Initial Load & Sync: Convert linear steps to Graph
    useEffect(() => {
        if (!initialSteps) return;

        const currentStepsJson = JSON.stringify(initialSteps);
        if (currentStepsJson === lastExportedSteps.current) {
            return;
        }

        if (initialSteps.length === 0) {
            setNodes(initialNodes);
            setEdges([]);
            return;
        }

        const loadedNodes: Node[] = [initialNodes[0]];
        const loadedEdges: Edge[] = [];
        let previousNodeId = 'start';

        // Sort by order
        const sortedSteps = [...initialSteps].sort((a, b) => a.step_order - b.step_order);

        sortedSteps.forEach((step, index) => {
            const nodeId = step.id || `temp-${index}`;
            // Map legacy step types to new components
            let type = 'action';
            let data: any = { ...step, label: step.step_name };

            if (['send_message', 'send_survey'].includes(step.step_type)) {
                type = 'communication';
                // Infer channel from existing data or default
                const config = step.action_config || {};
                data.channel = config.channel === 'sms' ? 'sms' : 'email';
                // For now, map 'send_message' to email by default or check config
                if (step.step_type === 'send_survey') data.channel = 'email';
            } else if (step.step_type === 'delay') {
                type = 'delay';
            } else if (step.step_type === 'condition') {
                type = 'logic';
            }

            loadedNodes.push({
                id: nodeId,
                type,
                data,
                position: { x: 250, y: (index + 1) * 150 }
            });

            loadedEdges.push({
                id: `e-${previousNodeId}-${nodeId}`,
                source: previousNodeId,
                target: nodeId,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                animated: true,
                style: { stroke: '#64748b', strokeWidth: 2 }
            });

            previousNodeId = nodeId;
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(loadedNodes, loadedEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        lastExportedSteps.current = currentStepsJson;

    }, [initialSteps, setNodes, setEdges]);


    // Handle Connection
    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 }
        }, eds));
    }, [setEdges]);


    // Handle Logic Export (Map Graph -> Steps)
    const exportLinearSteps = useCallback(() => {
        const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);

        const linearSteps = sortedNodes
            .filter(n => n.type !== 'start') // Don't save start node as a step
            .map((node, index) => {
                const meta = (node.data.metadata as object) || {};
                // Recover step_type from node type if needed
                let stepType = node.data.step_type;
                if (node.type === 'communication') stepType = 'send_message'; // Generic fallback for now
                if (node.type === 'delay') stepType = 'delay';
                if (node.type === 'logic') stepType = 'condition';

                const stepData = {
                    ...node.data,
                    id: node.id.startsWith('temp-') ? undefined : node.id,
                    step_order: index + 1,
                    step_name: node.data.label || node.data.step_name || 'New Step',
                    step_type: stepType || 'action', // Ensure step_type is set
                    metadata: {
                        ...meta,
                        position: node.position
                    }
                };
                return stepData;
            });

        const newStepsJson = JSON.stringify(linearSteps);
        lastExportedSteps.current = newStepsJson;
        onStepsChange(linearSteps);
    }, [nodes, edges, onStepsChange]);


    // Add New Node
    const addNode = (category: string, subType?: string) => {
        const id = uuidv4();

        // Naive placement logic
        const existingY = nodes.map(n => n.position.y);
        const maxY = existingY.length > 0 ? Math.max(...existingY) : 0;
        const newY = maxY > 0 ? maxY + 150 : 150;

        let type = 'action';
        let data: any = { label: 'New Step' };

        if (category === 'communication') {
            type = 'communication';
            data.channel = subType || 'email';
            data.label = `Send ${subType === 'sms' ? 'SMS' : subType === 'whatsapp' ? 'WhatsApp' : 'Email'}`;
            data.step_type = 'send_message';
        } else if (category === 'delay') {
            type = 'delay';
            data.label = 'Wait';
            data.step_type = 'delay';
            data.delay_days = 1;
        } else if (category === 'logic') {
            type = 'logic';
            data.label = 'Condition';
            data.step_type = 'condition';
        }

        const newNode: Node = {
            id,
            type,
            position: { x: 250, y: newY },
            data
        };

        setNodes((nds) => {
            const sortedNodes = [...nds].sort((a, b) => a.position.y - b.position.y);
            const lastNode = sortedNodes[sortedNodes.length - 1];

            if (lastNode) {
                const newEdge = {
                    id: `e-${lastNode.id}-${id}`,
                    source: lastNode.id,
                    target: id,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                    animated: true,
                    style: { stroke: '#64748b', strokeWidth: 2 }
                };
                setEdges((eds) => addEdge(newEdge, eds));
            }
            return [...nds, newNode];
        });

        setTimeout(() => setSelectedNode(newNode), 100);
        setTimeout(exportLinearSteps, 200);
    };

    const handleNodeClick = (_: any, node: Node) => {
        if (node.type !== 'start') {
            setSelectedNode(node);
        } else {
            setSelectedNode(null);
        }
    };

    const handleConfigSave = (id: string, newData: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
        setSelectedNode(null); // Close panel
        setTimeout(exportLinearSteps, 100);
    };

    const handleNodeDelete = (id: string) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        setSelectedNode(null);
        setTimeout(exportLinearSteps, 100);
    };

    return (
        <div className="h-[600px] w-full bg-slate-50 relative flex overflow-hidden rounded-xl border border-gray-200 shadow-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onNodeDragStop={exportLinearSteps}
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-50"
            >
                <Background color="#cbd5e1" gap={16} size={1} />
                <Controls />

                {/* Expanded Toolbar Panel */}
                <Panel position="top-center" className="bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg border border-gray-200 flex gap-2 overflow-x-auto max-w-[90vw]">
                    <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
                        <button onClick={() => addNode('communication', 'email')} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg flex flex-col items-center gap-1 transition-colors min-w-[60px]">
                            <Mail size={18} />
                            <span className="text-[10px] font-medium">Email</span>
                        </button>
                        <button onClick={() => addNode('communication', 'sms')} className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg flex flex-col items-center gap-1 transition-colors min-w-[60px]">
                            <Smartphone size={18} />
                            <span className="text-[10px] font-medium">SMS</span>
                        </button>
                        <button onClick={() => addNode('communication', 'whatsapp')} className="p-2 hover:bg-green-50 text-green-600 rounded-lg flex flex-col items-center gap-1 transition-colors min-w-[60px]">
                            <MessageCircle size={18} />
                            <span className="text-[10px] font-medium">WhatsApp</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-1 pl-2">
                        <button onClick={() => addNode('delay')} className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg flex flex-col items-center gap-1 transition-colors min-w-[60px]">
                            <Clock size={18} />
                            <span className="text-[10px] font-medium">Delay</span>
                        </button>
                        <button onClick={() => addNode('logic')} className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg flex flex-col items-center gap-1 transition-colors min-w-[60px]">
                            <GitBranch size={18} />
                            <span className="text-[10px] font-medium">Condition</span>
                        </button>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Right Config Panel (Slide Over) */}
            {selectedNode && (
                <div className="absolute top-0 right-0 h-full z-20 w-[400px]">
                    <ConfigPanel
                        nodeId={selectedNode.id}
                        data={selectedNode.data}
                        onClose={() => setSelectedNode(null)}
                        onSave={handleConfigSave}
                        onDelete={handleNodeDelete}
                        nodeType={selectedNode.type}
                    />
                </div>
            )}
        </div>
    );
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
    return (
        <ReactFlowProvider>
            <Canvas {...props} />
        </ReactFlowProvider>
    );
}
