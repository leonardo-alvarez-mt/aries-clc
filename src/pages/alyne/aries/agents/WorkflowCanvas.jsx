import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, ShieldCheck, StopCircle, X } from 'lucide-react';
import { ariesFocus } from '../ariesUi';
import { cn } from '../../../../utils/cn';
import { CARD_H, CARD_W, STEP_TYPE, canConnect, edgeLabel } from './workflowGraph';

const STATE_LABEL = {
  completed: 'Completed',
  failed: 'Failed',
  'not-taken': 'Not run · route not taken',
  'ended-earlier': 'Not run · ended earlier',
};

function FlowNode({ id, data, selected }) {
  const { node, graph, state, editable, onAddChild } = data;
  const endRunCount = (node.endRuns || []).filter((item) => item.reason?.trim()).length;
  const input =
    node.type === 'trigger'
      ? node.schedule === 'scheduled'
        ? 'Scheduled'
        : 'Manual'
      : (node.inputs || []).map((inputId) => graph.nodes[inputId]?.title).filter(Boolean).join(', ') || 'No input';
  const stateLabel = state
    ? state.state === 'completed' && state.duration
      ? `${STATE_LABEL[state.state]} · ${state.duration}`
      : STATE_LABEL[state.state]
    : '';

  return (
    <div
      className={cn(
        'group/node relative flex flex-col overflow-visible rounded-xl border bg-white px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        selected
          ? 'border-[#93c5fd] shadow-[0_0_0_3px_rgba(0,103,210,0.12)]'
          : state?.state === 'failed'
            ? 'border-[#fda29b]'
            : state?.state === 'not-taken' || state?.state === 'ended-earlier'
              ? 'border-dashed border-[#cbd5e1]'
              : 'border-[#e2e8f0]'
      )}
      style={{ width: CARD_W, height: CARD_H }}
    >
      {node.type !== 'trigger' ? (
        <Handle
          type="target"
          position={Position.Left}
          className="!size-3 !border-2 !border-white !bg-[#94a3b8] hover:!bg-[#0067D2]"
        />
      ) : null}
      <span className={cn('text-[11px] font-semibold uppercase tracking-wide', STEP_TYPE[node.type]?.kicker)}>
        {STEP_TYPE[node.type]?.label}
      </span>
      <span className="mt-1 truncate text-sm font-medium text-[#0f172a]">{node.title}</span>
      <span className="mt-0.5 truncate text-xs text-[#64748b]">
        {node.type === 'trigger' ? input : `Input: ${input}`}
      </span>
      {node.gate ? (
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#0067D2]">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Approval
        </span>
      ) : null}
      {endRunCount > 0 ? (
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#b45309]">
          <StopCircle className="size-3.5" aria-hidden="true" />
          Can end run · {endRunCount}
        </span>
      ) : null}
      {stateLabel ? (
        <span
          className={cn(
            'mt-auto truncate text-[11px] font-medium',
            state.state === 'failed' ? 'text-[#b42318]' : state.state === 'completed' ? 'text-[#067647]' : 'text-[#64748b]'
          )}
        >
          {stateLabel}
        </span>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="!size-3 !border-2 !border-white !bg-[#94a3b8] hover:!bg-[#0067D2]"
      />
      {editable ? (
        <button
          type="button"
          aria-label={`Add step after ${node.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onAddChild?.(id);
          }}
          className={cn(
            'nodrag nopan absolute top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0067D2] opacity-0 shadow-sm transition-opacity hover:border-[#93c5fd] group-hover/node:opacity-100 hover:opacity-100 focus-visible:opacity-100',
            ariesFocus
          )}
          style={{ right: -28 }}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  selected,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const editable = data?.editable;
  const label = data?.label;
  const stroke = selected ? '#0067D2' : '#cbd5e1';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke, strokeWidth: selected ? 2.5 : 1.5 }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          <div className="flex items-center gap-1">
            {label ? (
              <span
                className={cn(
                  'rounded-full border bg-white px-2 py-0.5 text-[11px] font-medium shadow-sm',
                  selected ? 'border-[#93c5fd] text-[#0067D2]' : 'border-[#e2e8f0] text-[#64748b]'
                )}
              >
                {label}
              </span>
            ) : null}
            {editable ? (
              <div
                className={cn(
                  'flex items-center gap-0.5 transition-opacity',
                  selected ? 'opacity-100' : 'opacity-0 hover:opacity-100 focus-within:opacity-100'
                )}
              >
                <button
                  type="button"
                  aria-label="Insert step on connection"
                  onClick={(event) => {
                    event.stopPropagation();
                    data?.onInsert?.(data.from, data.to);
                  }}
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0067D2] shadow-sm hover:border-[#93c5fd]',
                    ariesFocus
                  )}
                >
                  <Plus className="size-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Remove connection"
                  onClick={(event) => {
                    event.stopPropagation();
                    data?.onDisconnect?.(data.from, data.to);
                  }}
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b] shadow-sm hover:border-[#fda29b] hover:text-[#b42318]',
                    ariesFocus
                  )}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { flow: FlowNode };
const edgeTypes = { flow: FlowEdge };

function DropMenu({ point, onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (!ref.current?.contains(event.target)) onClose();
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="fixed z-50 w-44 rounded-xl border border-[#e2e8f0] bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
      style={{ left: point.x, top: point.y }}
    >
      <p className="px-2.5 py-1.5 text-[11px] font-medium text-[#64748b]">Add step</p>
      <button
        type="button"
        onClick={() => onPick('agent')}
        className={cn('block w-full rounded-lg px-2.5 py-2 text-left text-sm text-[#0f172a] hover:bg-[#f8fafc]', ariesFocus)}
      >
        Agent
      </button>
      <button
        type="button"
        onClick={() => onPick('decision')}
        className={cn('block w-full rounded-lg px-2.5 py-2 text-left text-sm text-[#0f172a] hover:bg-[#f8fafc]', ariesFocus)}
      >
        Decision
      </button>
    </div>
  );
}

function CanvasInner({
  graph,
  selectedId,
  runSteps,
  editable,
  onSelect,
  onConnectNodes,
  onDisconnect,
  onAddChild,
  onInsert,
  onNodePosition,
  onDropCreate,
  fitToken,
  focusId,
}) {
  const { fitView, setCenter, screenToFlowPosition } = useReactFlow();
  const [menu, setMenu] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const connectingFrom = useRef(null);

  useEffect(() => {
    setNodes(
      Object.entries(graph.nodes).map(([id, node]) => ({
        id,
        type: 'flow',
        position: node.position || { x: 0, y: 0 },
        selected: id === selectedId,
        draggable: editable,
        selectable: true,
        deletable: false,
        data: {
          node,
          graph,
          state: runSteps?.[id],
          editable,
          onAddChild,
        },
        style: { width: CARD_W, height: CARD_H },
      }))
    );
  }, [graph, selectedId, runSteps, editable, onAddChild]);

  useEffect(() => {
    setEdges(
      graph.edges.map((edge) => {
        const id = `${edge.from}-${edge.to}`;
        const selected = id === selectedEdgeId;
        return {
          id,
          source: edge.from,
          target: edge.to,
          type: 'flow',
          selected,
          selectable: editable,
          deletable: editable,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: selected ? '#0067D2' : '#94a3b8',
          },
          data: {
            from: edge.from,
            to: edge.to,
            label: edgeLabel(graph, edge),
            editable,
            onInsert,
            onDisconnect,
          },
        };
      })
    );
  }, [graph, editable, onInsert, onDisconnect, selectedEdgeId]);

  const onNodesChange = useCallback((changes) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((current) => applyEdgeChanges(changes, current));
      for (const change of changes) {
        if (change.type === 'select') {
          setSelectedEdgeId((current) => {
            if (change.selected) return change.id;
            return current === change.id ? null : current;
          });
        }
        if (change.type === 'remove' && editable) {
          const match = graph.edges.find((edge) => `${edge.from}-${edge.to}` === change.id);
          if (match) onDisconnect?.(match.from, match.to);
          setSelectedEdgeId((current) => (current === change.id ? null : current));
        }
      }
    },
    [editable, graph.edges, onDisconnect]
  );

  const onEdgesDelete = useCallback(
    (deleted) => {
      if (!editable) return;
      for (const edge of deleted) {
        onDisconnect?.(edge.source, edge.target);
      }
      setSelectedEdgeId(null);
    },
    [editable, onDisconnect]
  );

  useEffect(() => {
    fitView({ padding: 0.18, duration: 200 });
  }, [fitToken, fitView]);

  useEffect(() => {
    if (!focusId || !graph.nodes[focusId]?.position) return;
    const pos = graph.nodes[focusId].position;
    setCenter(pos.x + CARD_W / 2, pos.y + CARD_H / 2, { zoom: 1, duration: 280 });
  }, [focusId, graph.nodes, setCenter]);

  const isValidConnection = useCallback(
    (connection) => canConnect(graph, connection.source, connection.target),
    [graph]
  );

  const onConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) onConnectNodes?.(connection.source, connection.target);
    },
    [onConnectNodes]
  );

  const onConnectStart = useCallback((_event, params) => {
    connectingFrom.current = params?.nodeId || null;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const fromId = connectingFrom.current;
      connectingFrom.current = null;
      if (!editable || !fromId || !onDropCreate) return;
      const target = event.target;
      if (target?.closest?.('.react-flow__node') || target?.closest?.('.react-flow__handle')) return;
      const point = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setMenu({
        fromId,
        flow: point,
        screen: { x: event.clientX, y: event.clientY },
      });
    },
    [editable, onDropCreate, screenToFlowPosition]
  );

  return (
    <div className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={(_event, node) => {
          setSelectedEdgeId(null);
          onSelect?.(node.id);
        }}
        onEdgeClick={(_event, edge) => {
          if (!editable) return;
          setSelectedEdgeId(edge.id);
          onSelect?.(null);
        }}
        onPaneClick={() => {
          setSelectedEdgeId(null);
          onSelect?.(null);
          setMenu(null);
        }}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        onNodeDragStop={(_event, node) => onNodePosition?.(node.id, node.position)}
        nodesDraggable={editable}
        nodesConnectable={editable}
        edgesFocusable={editable}
        elementsSelectable={editable}
        deleteKeyCode={editable ? ['Backspace', 'Delete'] : null}
        panOnScroll
        selectionOnDrag={false}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'flow' }}
        className="bg-transparent"
      >
        <Background color="#d5dee8" gap={18} size={1} />
      </ReactFlow>
      {menu ? (
        <DropMenu
          point={{ x: menu.screen.x - 40, y: menu.screen.y - 20 }}
          onClose={() => setMenu(null)}
          onPick={(type) => {
            onDropCreate?.(menu.fromId, type, menu.flow);
            setMenu(null);
          }}
        />
      ) : null}
    </div>
  );
}

export function WorkflowCanvas(props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
