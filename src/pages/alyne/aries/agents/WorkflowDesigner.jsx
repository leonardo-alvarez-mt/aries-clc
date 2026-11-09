import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, LayoutTemplate, Plus, Scan } from 'lucide-react';
import { ariesFocus } from '../ariesUi';
import { cn } from '../../../../utils/cn';
import {
  addChild,
  autoLayout,
  cloneGraph,
  connect,
  deleteStep,
  disconnect,
  ensurePositions,
  insertOnEdge,
  setNodePosition,
} from './workflowGraph';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowLastRun } from './WorkflowLastRun';
import { WorkflowStepPanel } from './WorkflowStepPanel';

export default function WorkflowDesigner({ agent, onBack }) {
  const original = agent.graph;
  const [saved, setSaved] = useState(() => ({
    name: agent.name,
    graph: ensurePositions(cloneGraph(original)),
  }));
  const [name, setName] = useState(agent.name);
  const [draft, setDraft] = useState(() => ensurePositions(cloneGraph(original)));
  const [mode, setMode] = useState('flow');
  const [selectedId, setSelectedId] = useState('decision');
  const [runId, setRunId] = useState('run-high');
  const [fitToken, setFitToken] = useState(0);
  const [focusId, setFocusId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef(null);

  useEffect(() => {
    if (!addOpen) return undefined;
    const close = (event) => {
      if (!addRef.current?.contains(event.target)) setAddOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [addOpen]);

  const dirty = name !== saved.name || JSON.stringify(draft) !== JSON.stringify(saved.graph);
  const shown = mode === 'run' ? ensurePositions(cloneGraph(original)) : draft;
  const run = original.runs.find((item) => item.id === runId) || original.runs[0];

  const selectNode = useCallback((id) => {
    setSelectedId((current) => (id == null ? null : current === id ? null : id));
  }, []);

  const save = () => setSaved({ name, graph: cloneGraph(draft) });

  const cancel = () => {
    setName(saved.name);
    setDraft(cloneGraph(saved.graph));
    setSelectedId((current) => (saved.graph.nodes[current] ? current : null));
  };

  const add = useCallback(
    (type, parentId = selectedId) => {
      if (!parentId || !draft.nodes[parentId]) return;
      const result = addChild(draft, parentId, type);
      setDraft(result.graph);
      if (result.id) setSelectedId(result.id);
      setAddOpen(false);
    },
    [draft, selectedId]
  );

  const onConnectNodes = useCallback((fromId, toId) => {
    setDraft((current) => connect(current, fromId, toId));
  }, []);

  const onDisconnect = useCallback((fromId, toId) => {
    setDraft((current) => disconnect(current, fromId, toId));
  }, []);

  const onInsert = useCallback((fromId, toId) => {
    setDraft((current) => {
      const result = insertOnEdge(current, fromId, toId, 'agent');
      if (result.id) setSelectedId(result.id);
      return result.graph;
    });
  }, []);

  const onAddChild = useCallback((parentId) => {
    setDraft((current) => {
      const result = addChild(current, parentId, 'agent');
      if (result.id) setSelectedId(result.id);
      return result.graph;
    });
  }, []);

  const onDropCreate = useCallback((fromId, type, position) => {
    setDraft((current) => {
      const result = addChild(current, fromId, type, {
        x: position.x - 120,
        y: position.y - 58,
      });
      if (result.id) setSelectedId(result.id);
      return result.graph;
    });
  }, []);

  const onNodePosition = useCallback((id, position) => {
    setDraft((current) => setNodePosition(current, id, position));
  }, []);

  const tidy = () => {
    setDraft((current) => autoLayout(current));
    setFitToken((value) => value + 1);
  };

  const focusNode = (id) => {
    setSelectedId(id);
    setFocusId(id);
    setTimeout(() => setFocusId(null), 400);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <WorkflowCanvas
        graph={shown}
        selectedId={mode === 'flow' ? selectedId : null}
        runSteps={mode === 'run' ? run.steps : null}
        editable={mode === 'flow'}
        onSelect={mode === 'flow' ? selectNode : undefined}
        onConnectNodes={onConnectNodes}
        onDisconnect={onDisconnect}
        onAddChild={onAddChild}
        onInsert={onInsert}
        onNodePosition={onNodePosition}
        onDropCreate={onDropCreate}
        fitToken={fitToken}
        focusId={focusId}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 px-5 pt-4">
        <div className="pointer-events-auto flex min-w-0 max-w-md flex-col gap-1 rounded-2xl border border-[#e2e8f0] bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'inline-flex items-center gap-1.5 self-start rounded-md text-sm font-medium text-[#475569] hover:text-[#001a35]',
              ariesFocus
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Workflow agents
          </button>
          <div className="flex items-center gap-2">
            <input
              aria-label="Agent name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={cn('min-w-0 flex-1 bg-transparent text-lg font-semibold leading-6 text-[#0f172a]', ariesFocus)}
            />
            {dirty ? (
              <span className="shrink-0 rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#b45309]" data-testid="draft-badge">
                Draft
              </span>
            ) : null}
          </div>
          <p className="text-xs text-[#64748b]">
            {agent.cadence} · {agent.owner}
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-[#e2e8f0] bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex rounded-full border border-[#e2e8f0] bg-white p-0.5" role="tablist" aria-label="Designer view">
            {[
              { id: 'flow', label: 'Flow' },
              { id: 'run', label: 'Last run' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => setMode(tab.id)}
                className={cn(
                  'h-8 rounded-full px-3 text-sm font-medium',
                  ariesFocus,
                  mode === tab.id ? 'bg-[#f1f5f9] text-[#0f172a]' : 'text-[#64748b] hover:text-[#0f172a]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="h-5 w-px bg-[#e2e8f0]" aria-hidden="true" />
          <button
            type="button"
            onClick={cancel}
            disabled={!dirty}
            className={cn(
              'inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] disabled:pointer-events-none disabled:text-[#cbd5e1]',
              ariesFocus
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className={cn(
              'inline-flex h-8 items-center rounded-lg bg-[#0067D2] px-3 text-sm font-medium text-white hover:bg-[#005bb8] disabled:bg-[#e8eef5] disabled:text-[#94a3b8]',
              ariesFocus
            )}
          >
            Save agent
          </button>
        </div>
      </header>

      {mode === 'flow' ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-5 pb-5">
          <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-[#e2e8f0] bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="relative" ref={addRef}>
              <button
                type="button"
                aria-expanded={addOpen}
                aria-disabled={!selectedId}
                onClick={() => {
                  if (!selectedId) return;
                  setAddOpen((value) => !value);
                }}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#0f172a] hover:bg-[#f8fafc]',
                  !selectedId && 'cursor-not-allowed text-[#94a3b8] hover:bg-transparent',
                  ariesFocus
                )}
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add step
              </button>
              {addOpen && selectedId ? (
                <div className="absolute bottom-full left-0 mb-2 w-44 rounded-xl border border-[#e2e8f0] bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                  <button
                    type="button"
                    onClick={() => add('agent')}
                    className={cn('block w-full rounded-lg px-2.5 py-2 text-left text-sm text-[#0f172a] hover:bg-[#f8fafc]', ariesFocus)}
                  >
                    Agent
                  </button>
                  <button
                    type="button"
                    onClick={() => add('decision')}
                    className={cn('block w-full rounded-lg px-2.5 py-2 text-left text-sm text-[#0f172a] hover:bg-[#f8fafc]', ariesFocus)}
                  >
                    Decision
                  </button>
                </div>
              ) : null}
            </div>
            <span className="h-5 w-px bg-[#e2e8f0]" aria-hidden="true" />
            <button
              type="button"
              onClick={tidy}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#475569] hover:bg-[#f8fafc]',
                ariesFocus
              )}
            >
              <LayoutTemplate className="size-3.5" aria-hidden="true" />
              Tidy up
            </button>
            <span className="h-5 w-px bg-[#e2e8f0]" aria-hidden="true" />
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => {
                setFitToken((value) => value + 1);
              }}
              className={cn('flex size-9 items-center justify-center rounded-xl text-[#475569] hover:bg-[#f8fafc]', ariesFocus)}
            >
              <Scan className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'run' ? (
        <div className="absolute bottom-5 right-4 top-20 z-30 w-[360px] max-h-[calc(100%-7rem)] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
          <WorkflowLastRun graph={original} runId={run.id} onSelectRun={setRunId} floating />
        </div>
      ) : selectedId && draft.nodes[selectedId] ? (
        <div className="absolute bottom-5 right-4 top-20 z-30 w-[360px] max-h-[calc(100%-7rem)] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
          <WorkflowStepPanel
            graph={draft}
            nodeId={selectedId}
            onChange={setDraft}
            onDelete={() => {
              setDraft(deleteStep(draft, selectedId));
              setSelectedId(null);
            }}
            onSelect={focusNode}
            onClose={() => setSelectedId(null)}
            floating
          />
        </div>
      ) : null}
    </div>
  );
}
