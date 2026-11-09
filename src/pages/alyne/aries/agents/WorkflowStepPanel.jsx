import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronRight, Lock, Plus, X } from 'lucide-react';
import { selectChevronClass } from '../../../../components/ui/selectField';
import { ariesField, ariesFocus } from '../ariesUi';
import { cn } from '../../../../utils/cn';
import {
  CAPABILITY_AGENTS,
  OPERATORS,
  conditionSummary,
  incomingPathEdge,
  inputChoices,
  pathEdges,
  questionUsages,
  STEP_TYPE,
} from './workflowGraph';

const fieldLabel = 'text-xs font-medium text-[#64748b]';

function Tip({ label, className, children }) {
  const anchor = useRef(null);
  const [place, setPlace] = useState(null);
  const hide = () => setPlace(null);
  const show = () => {
    const rect = anchor.current?.getBoundingClientRect();
    if (!label || !rect) return;
    const leftSide = rect.left > 248;
    setPlace(
      leftSide
        ? { top: rect.top + rect.height / 2, left: rect.left - 8, transform: 'translate(-100%, -50%)' }
        : { top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left, window.innerWidth - 228)), transform: 'none' }
    );
  };
  useEffect(() => {
    if (!place) return undefined;
    const onScroll = () => setPlace(null);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [place]);
  if (!label) return <span className={className}>{children}</span>;
  return (
    <span ref={anchor} className={className} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {place
        ? createPortal(
            <span
              role="tooltip"
              style={place}
              className="pointer-events-none fixed z-50 w-max max-w-[220px] whitespace-normal rounded-md bg-[#0f172a] px-2 py-1 text-left text-[12px] font-medium leading-4 text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
            >
              {label}
            </span>,
            document.body
          )
        : null}
    </span>
  );
}

export function WorkflowStepPanel({ graph, nodeId, onChange, onDelete, onSelect, onClose, floating }) {
  const [section, setSection] = useState(null);
  const node = graph.nodes[nodeId];
  useEffect(() => setSection(null), [nodeId]);
  if (!node) return null;
  const path = incomingPathEdge(graph, nodeId);
  const toggle = (id) => setSection((current) => (current === id ? null : id));
  const inputNames = (node.inputs || []).map((id) => graph.nodes[id]?.title).filter(Boolean);
  const questions = node.questions || [];
  const endRuns = node.endRuns || [];
  const paths = node.type === 'decision' ? pathEdges(graph, nodeId) : [];
  const endSummary = endRuns.length
    ? conditionSummary(node, endRuns[0].match, endRuns[0].comparisons) || `${endRuns.length}`
    : 'None';
  const pathValue = path
    ? path.kind === 'default'
      ? 'Default'
      : conditionSummary(graph.nodes[path.from], path.match, path.comparisons) || 'Conditional'
    : '';

  return (
    <aside
      className={cn(
        'aries-side-panel flex flex-col overflow-hidden bg-white',
        floating ? 'h-full w-full' : 'w-[360px] shrink-0 rounded-2xl border border-[#e2e8f0]'
      )}
      aria-label={node.title}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className={cn('text-[11px] font-semibold uppercase tracking-wide', STEP_TYPE[node.type].kicker)}>
              {STEP_TYPE[node.type].label}
            </p>
            <input
              aria-label="Step name"
              value={node.title}
              onChange={(event) => onChange(patchNode(graph, nodeId, { title: event.target.value }))}
              className={cn('mt-1 w-full bg-transparent text-lg font-semibold leading-6 text-[#0f172a]', ariesFocus)}
            />
            {node.sample ? (
              <Tip label="Answer and confidence from the last run" className="mt-1 block">
                <p className="text-xs text-[#64748b]">
                  Last decision · {node.sample.selected} · {node.sample.confidence}
                </p>
              </Tip>
            ) : null}
          </div>
          <Tip label="Close" align="end">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className={cn('flex size-7 shrink-0 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9]', ariesFocus)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </Tip>
        </div>

        <div className="mt-5 border-t border-[#f1f5f9]">
          {path ? (
            <Disclosure id="path" open={section === 'path'} onToggle={toggle} label="Path" hint="When this step runs after the decision" value={pathValue}>
              <PathSection graph={graph} edge={path} onChange={onChange} embedded />
            </Disclosure>
          ) : null}
          {node.type === 'trigger' ? (
            <Disclosure
              id="when"
              open={section === 'when'}
              onToggle={toggle}
              label="When it runs"
              hint="Start it by hand, or on a schedule"
              value={node.schedule === 'scheduled' ? 'Scheduled' : 'Manual'}
            >
              <ScheduleValue
                value={node.schedule}
                onChange={(schedule) => onChange(patchNode(graph, nodeId, { schedule }))}
                embedded
              />
            </Disclosure>
          ) : null}
          {node.type !== 'trigger' ? (
            <Disclosure
              id="instruction"
              open={section === 'instruction'}
              onToggle={toggle}
              label="Instruction"
              hint="What this step should do"
              value={(node.instruction || '').trim() || 'None'}
            >
              <textarea
                aria-label="Instruction"
                placeholder="Tell this step what to do"
                value={node.instruction || ''}
                rows={3}
                onChange={(event) => onChange(patchNode(graph, nodeId, { instruction: event.target.value }))}
                className={cn(ariesField, 'resize-none')}
              />
            </Disclosure>
          ) : null}
          {node.type === 'agent' ? (
            <Disclosure id="capability" open={section === 'capability'} onToggle={toggle} label="Capability" hint="The agent that performs this step" value={node.agent}>
              <select
                aria-label="Capability"
                value={node.agent}
                onChange={(event) => onChange(patchNode(graph, nodeId, { agent: event.target.value }))}
                className={cn(ariesField, selectChevronClass)}
              >
                {CAPABILITY_AGENTS.map((agent) => (
                  <option key={agent}>{agent}</option>
                ))}
              </select>
            </Disclosure>
          ) : null}
          {node.type !== 'trigger' ? (
            <Disclosure id="input" open={section === 'input'} onToggle={toggle} label="Input" hint="Earlier steps this step can read" value={inputNames.join(', ') || 'None'}>
              <InputPicker
                graph={graph}
                nodeId={nodeId}
                inputs={node.inputs || []}
                onChange={(inputs) => onChange(patchNode(graph, nodeId, { inputs }))}
                embedded
              />
            </Disclosure>
          ) : null}
          {node.type !== 'trigger' ? (
            <div className="flex h-12 items-center gap-3 border-b border-[#f1f5f9]">
              <Tip label="A person approves before this step runs">
                <span className="text-sm text-[#0f172a]">Human approval</span>
              </Tip>
              <Tip label={node.gate ? 'On. Click to let this step run on its own.' : 'Off. Click to require approval.'} align="end" className="ml-auto">
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(node.gate)}
                  aria-label="Require human approval before this step runs"
                  onClick={() => onChange(patchNode(graph, nodeId, { gate: !node.gate }))}
                  className={cn(
                    'flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors',
                    ariesFocus,
                    node.gate ? 'bg-[#0067D2]' : 'bg-[#e2e8f0]'
                  )}
                >
                  <span className={cn('size-4 rounded-full bg-white shadow-sm transition-transform', node.gate && 'translate-x-4')} />
                </button>
              </Tip>
            </div>
          ) : null}
          {node.type === 'decision' ? (
            <>
              <Disclosure
                id="questions"
                open={section === 'questions'}
                onToggle={toggle}
                label="Questions"
                hint="What this decision asks"
                value={questions.length === 1 ? questions[0].name : String(questions.length)}
              >
                <DecisionFields part="questions" graph={graph} nodeId={nodeId} node={node} onChange={onChange} onSelect={onSelect} />
              </Disclosure>
              <Disclosure
                id="end"
                open={section === 'end'}
                onToggle={toggle}
                label="End run"
                hint="Stop the run when this is true"
                value={endRuns.length > 1 ? String(endRuns.length) : endSummary}
              >
                <DecisionFields part="end" graph={graph} nodeId={nodeId} node={node} onChange={onChange} onSelect={onSelect} />
              </Disclosure>
              <Disclosure
                id="paths"
                open={section === 'paths'}
                onToggle={toggle}
                label="Paths"
                hint="Steps that follow this decision"
                value={paths.length ? String(paths.length) : 'None'}
              >
                <DecisionFields part="paths" graph={graph} nodeId={nodeId} node={node} onChange={onChange} onSelect={onSelect} />
              </Disclosure>
            </>
          ) : null}
        </div>
        {node.type !== 'trigger' ? (
          <Tip label="Remove this step and reconnect the ones around it" side="top" className="mt-5 inline-flex">
            <button
              type="button"
              onClick={onDelete}
              className={cn('text-sm font-medium text-[#b42318] hover:underline', ariesFocus)}
            >
              Delete step
            </button>
          </Tip>
        ) : null}
      </div>
    </aside>
  );
}

function Disclosure({ id, open, onToggle, label, hint, value, children }) {
  return (
    <section className="border-b border-[#f1f5f9]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(id)}
        className={cn('flex h-12 w-full items-center gap-3 text-left', ariesFocus)}
      >
        <Tip label={hint}>
          <span className="shrink-0 text-sm text-[#0f172a]">{label}</span>
        </Tip>
        <Tip label={value && value.length > 28 ? value : ''} align="end" className="ml-auto min-w-0 max-w-[52%]">
          <span className="block truncate text-right text-sm text-[#64748b]">{value}</span>
        </Tip>
        <ChevronDown
          className={cn('size-4 shrink-0 text-[#94a3b8] transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open ? <div className="pb-4">{children}</div> : null}
    </section>
  );
}

function patchNode(graph, id, patch) {
  return { ...graph, nodes: { ...graph.nodes, [id]: { ...graph.nodes[id], ...patch } } };
}

function ScheduleValue({ value, onChange, embedded }) {
  return (
    <div className={embedded ? '' : 'mt-4'}>
      {embedded ? null : <p className={fieldLabel}>When it runs</p>}
      <div className={cn('flex rounded-full border border-[#e2e8f0] bg-white p-0.5', !embedded && 'mt-1')} role="group" aria-label="When it runs">
        {[
          ['manual', 'Manual', 'Someone starts the run'],
          ['scheduled', 'Scheduled', 'The run starts on a schedule'],
        ].map(([id, label, tip]) => (
          <Tip key={id} label={tip} className="flex-1">
            <button
              type="button"
              aria-pressed={value === id}
              onClick={() => onChange(id)}
              className={cn(
                'h-8 w-full rounded-full text-sm font-medium',
                ariesFocus,
                value === id ? 'bg-[#f1f5f9] text-[#0f172a]' : 'text-[#64748b]'
              )}
            >
              {label}
            </button>
          </Tip>
        ))}
      </div>
    </div>
  );
}

function InputPicker({ graph, nodeId, inputs, onChange, embedded }) {
  const { available, locked } = inputChoices(graph, nodeId);
  const risky = locked.filter((id) => inputs.includes(id));
  const unavailable = locked.filter((id) => !inputs.includes(id));
  const toggle = (id) => {
    onChange(inputs.includes(id) ? inputs.filter((item) => item !== id) : [...inputs, id]);
  };
  const rows = [...available, ...risky];
  return (
    <div className={embedded ? '' : 'mt-4'}>
      {embedded ? null : <p className={fieldLabel}>Input</p>}
      <p className={cn('text-xs leading-4 text-[#64748b]', !embedded && 'mt-2')}>
        Check the earlier steps this step should read.
      </p>
      {rows.length === 0 && unavailable.length === 0 ? (
        <p className="mt-2 text-sm text-[#64748b]">No earlier steps yet.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {rows.map((id) => (
            <li key={id}>
              <InputChoice
                node={graph.nodes[id]}
                checked={inputs.includes(id)}
                risky={risky.includes(id)}
                onToggle={() => toggle(id)}
              />
            </li>
          ))}
        </ul>
      )}
      {unavailable.length ? (
        <div className="mt-3">
          <p className="text-xs font-medium text-[#94a3b8]">Unavailable</p>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {unavailable.map((id) => (
              <li key={id}>
                <InputChoice node={graph.nodes[id]} locked />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function InputChoice({ node, checked, risky, locked, onToggle }) {
  const detail = locked || risky ? 'Not on every path' : STEP_TYPE[node.type]?.label;
  const tip = locked
    ? 'Not on every path to this step, so it cannot be used.'
    : risky
      ? 'Not on every path. Click to stop using it.'
      : checked
        ? 'Included. Click to stop using it.'
        : 'Click to include this step’s output.';
  const box = (
    <span
      className={cn(
        'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border',
        checked ? 'border-[#0067D2] bg-[#0067D2] text-white' : 'border-[#cbd5e1] bg-white',
        locked && 'border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8]'
      )}
    >
      {locked ? <Lock className="size-2.5" aria-hidden="true" /> : checked ? <Check className="size-3" aria-hidden="true" /> : null}
    </span>
  );
  const copy = (
    <span className="min-w-0">
      <span className={cn('block truncate text-sm', locked ? 'text-[#94a3b8]' : 'text-[#0f172a]')}>{node.title}</span>
      <span className="block text-xs text-[#94a3b8]">{detail}</span>
    </span>
  );
  if (locked) {
    return (
      <Tip label={tip} className="block">
        <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-[#e2e8f0] px-2.5 py-2" aria-disabled="true">
          {box}
          {copy}
        </div>
      </Tip>
    );
  }
  return (
    <Tip label={tip} className="block">
      <button
        type="button"
        aria-pressed={checked}
        onClick={onToggle}
        className={cn(
          'flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left',
          ariesFocus,
          checked ? 'border-[#93c5fd] bg-[rgba(0,103,210,0.06)]' : 'border-[#e2e8f0] hover:bg-[#f8fafc]',
          risky && 'border-dashed'
        )}
      >
        {box}
        {copy}
      </button>
    </Tip>
  );
}

function PathSection({ graph, edge, onChange, embedded }) {
  const decision = graph.nodes[edge.from];
  const ownerEdge = graph.edges.find((item) => item.from === edge.from && item.kind === 'default');
  const isDefault = edge.kind === 'default';
  const defaultTaken = Boolean(ownerEdge && ownerEdge.to !== edge.to);
  const owner = ownerEdge ? graph.nodes[ownerEdge.to]?.title : '';
  return (
    <section className={embedded ? '' : 'mt-4 rounded-xl border border-[#e2e8f0] p-3'}>
      {embedded ? null : <p className={fieldLabel}>Path</p>}
      <div className={cn('flex rounded-full border border-[#e2e8f0] bg-white p-0.5', !embedded && 'mt-2')} role="group" aria-label="Path">
        <Tip label={defaultTaken ? `${owner} is already the default` : 'Runs when no conditional path matches'} className="flex-1">
          <button
            type="button"
            aria-pressed={isDefault}
            disabled={defaultTaken}
            onClick={() => onChange(setKind(graph, edge, 'default'))}
            className={cn(
              'h-8 w-full rounded-full text-sm font-medium disabled:pointer-events-none disabled:text-[#94a3b8]',
              ariesFocus,
              isDefault ? 'bg-[#f1f5f9] text-[#0f172a]' : 'text-[#64748b]'
            )}
          >
            Default
          </button>
        </Tip>
        <Tip label="Runs only when the comparisons match" className="flex-1">
          <button
            type="button"
            aria-pressed={!isDefault}
            onClick={() => onChange(setKind(graph, edge, 'conditional'))}
            className={cn(
              'h-8 w-full rounded-full text-sm font-medium',
              ariesFocus,
              !isDefault ? 'bg-[#f1f5f9] text-[#0f172a]' : 'text-[#64748b]'
            )}
          >
            Conditional
          </button>
        </Tip>
      </div>
      {!isDefault ? (
        <Comparisons
          questions={decision.questions || []}
          match={edge.match || 'all'}
          comparisons={edge.comparisons || []}
          onChange={(patch) => onChange(patchEdge(graph, edge, patch))}
          label="Run when"
        />
      ) : null}
    </section>
  );
}

function setKind(graph, edge, kind) {
  const taken = graph.edges.some((item) => item.from === edge.from && item.to !== edge.to && item.kind === 'default');
  if (kind === 'default' && taken) return graph;
  return {
    ...graph,
    edges: graph.edges.map((item) =>
      item.from === edge.from && item.to === edge.to
        ? { ...item, kind, match: item.match || 'all', comparisons: kind === 'default' ? [] : item.comparisons || [] }
        : item
    ),
  };
}

function patchEdge(graph, edge, patch) {
  return {
    ...graph,
    edges: graph.edges.map((item) => (item.from === edge.from && item.to === edge.to ? { ...item, ...patch } : item)),
  };
}

function Comparisons({ questions, match, comparisons, onChange, label }) {
  const update = (index, patch) => {
    onChange({
      comparisons: comparisons.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  };
  const joiner = match === 'any' ? 'or' : 'and';
  return (
    <div className={label ? 'mt-4' : ''}>
      {label ? <p className={fieldLabel}>{label}</p> : null}
      {comparisons.length === 0 ? (
        <p className="mt-1.5 text-sm text-[#94a3b8]">No comparison yet.</p>
      ) : null}
      <ul className={cn('flex flex-col', label && 'mt-1.5')}>
        {comparisons.map((comparison, index) => {
          const question = questions.find((item) => item.id === comparison.questionId);
          return (
            <li key={index}>
              {index > 0 ? (
                <div className="flex items-center gap-2 py-1.5 pr-9">
                  <span className="h-px flex-1 bg-[#f1f5f9]" />
                  <Tip label={match === 'any' ? 'Any comparison can match. Click for all.' : 'Every comparison must match. Click for any.'}>
                    <button
                      type="button"
                      aria-label={`Combine with ${joiner}`}
                      onClick={() => onChange({ match: match === 'any' ? 'all' : 'any' })}
                      className={cn(
                        'rounded-full border border-[#e2e8f0] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#475569] hover:border-[#93c5fd] hover:text-[#0067D2]',
                        ariesFocus
                      )}
                    >
                      {joiner}
                    </button>
                  </Tip>
                  <span className="h-px flex-1 bg-[#f1f5f9]" />
                </div>
              ) : null}
              <div className="flex items-center gap-1">
                <select
                  aria-label="Question"
                  value={comparison.questionId || ''}
                  onChange={(event) => update(index, { questionId: event.target.value, values: [] })}
                  className={cn(ariesField, selectChevronClass, 'min-w-0 flex-1 py-2')}
                >
                  <option value="">Question</option>
                  {questions.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <Tip label="Remove comparison">
                  <button
                    type="button"
                    aria-label="Remove comparison"
                    onClick={() => onChange({ comparisons: comparisons.filter((_, itemIndex) => itemIndex !== index) })}
                    className={cn('flex size-8 shrink-0 items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a]', ariesFocus)}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </Tip>
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 pr-9">
              <select
                aria-label="Operator"
                value={comparison.operator || 'equals'}
                onChange={(event) => {
                  const operator = event.target.value;
                  const values = operator === 'one-of' ? comparison.values || [] : (comparison.values || []).slice(0, 1);
                  update(index, { operator, values });
                }}
                className={cn(ariesField, selectChevronClass, 'py-2')}
              >
                {OPERATORS.map((operator) => (
                  <option key={operator.id} value={operator.id}>{operator.label}</option>
                ))}
              </select>
              {question && comparison.operator === 'one-of' ? (
                <div className="col-span-2 flex flex-wrap gap-1">
                  {question.options.map((option) => {
                    const selected = comparison.values?.includes(option);
                    return (
                      <Tip key={option} label={selected ? 'Included. Click to remove it.' : 'Click to include this option.'} className="inline-flex">
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          const values = selected
                            ? comparison.values.filter((value) => value !== option)
                            : [...(comparison.values || []), option];
                          update(index, { values });
                        }}
                        className={cn(
                          'rounded-md border px-2 py-1 text-xs',
                          ariesFocus,
                          selected ? 'border-transparent bg-[rgba(0,103,210,0.10)] text-[#001a35]' : 'border-[#e2e8f0] bg-white'
                        )}
                      >
                        {option}
                      </button>
                      </Tip>
                    );
                  })}
                </div>
              ) : (
                <select
                  aria-label="Option"
                  value={comparison.values?.[0] || ''}
                  onChange={(event) => update(index, { values: event.target.value ? [event.target.value] : [] })}
                  className={cn(ariesField, selectChevronClass, 'py-2')}
                >
                  <option value="">Option</option>
                  {(question?.options || []).map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              )}
              </div>
            </li>
          );
        })}
      </ul>
      <Tip label="Add another comparison to this condition" className="mt-2.5 inline-flex">
        <button
          type="button"
          onClick={() =>
            onChange({
              comparisons: [
                ...comparisons,
                { questionId: questions[0]?.id || '', operator: 'equals', values: [] },
              ],
            })
          }
          className={cn('text-xs font-medium text-[#0067D2] hover:underline', ariesFocus)}
        >
          Add comparison
        </button>
      </Tip>
    </div>
  );
}

function DecisionFields({ part, graph, nodeId, node, onChange, onSelect }) {
  const [openId, setOpenId] = useState(null);
  const questions = node.questions || [];
  const paths = pathEdges(graph, nodeId);
  const replace = (next) => onChange(patchNode(graph, nodeId, next));
  if (part === 'questions') {
    return (
      <section>
        <div className="flex justify-end">
          {questions.length < 5 ? (
            <Tip label="Ask something this decision can branch on" align="end" className="inline-flex">
            <button
              type="button"
              onClick={() => {
                const id = `question-${Date.now()}`;
                const created = {
                  id,
                  name: `Question ${questions.length + 1}`,
                  type: 'yes-no',
                  options: ['Yes', 'No'],
                };
                replace({ questions: [...questions, created] });
                setOpenId(id);
              }}
              className={cn('text-xs font-medium text-[#0067D2] hover:underline', ariesFocus)}
            >
              Add question
            </button>
            </Tip>
          ) : null}
        </div>
        <ul className="mt-2 flex flex-col gap-2">
          {questions.map((question) => {
            const used = questionUsages(graph, nodeId, question.id);
            const open = openId === question.id;
            const duplicate = questions.some((item) => item.id !== question.id && item.name.trim() === question.name.trim());
            return (
              <li key={question.id} className="rounded-xl border border-[#e2e8f0]">
                <Tip label={open ? 'Hide this question' : 'Edit this question'} className="block">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : question.id)}
                  className={cn('flex w-full items-center justify-between gap-2 px-3 py-2 text-left', ariesFocus)}
                >
                  <span className="min-w-0 truncate text-sm font-medium text-[#0f172a]">{question.name}</span>
                  <span className="shrink-0 text-xs text-[#64748b]">
                    {question.type === 'yes-no' ? 'Yes / no' : question.options.join(', ')}
                  </span>
                </button>
                </Tip>
                {open ? (
                  <div className="border-t border-[#e2e8f0] px-3 py-3">
                    <label className="block">
                      <span className={fieldLabel}>Name</span>
                      <input
                        aria-label="Question name"
                        value={question.name}
                        onChange={(event) =>
                          replace({
                            questions: questions.map((item) =>
                              item.id === question.id ? { ...item, name: event.target.value } : item
                            ),
                          })
                        }
                        className={cn(ariesField, 'mt-1')}
                      />
                    </label>
                    {duplicate ? <p className="mt-1 text-xs text-[#b42318]">Already used on this step</p> : null}
                    <label className="mt-3 block">
                      <span className={fieldLabel}>Type</span>
                      <Tip label={used.length ? `Used by ${used.join(', ')}` : 'Choice, or a yes / no question'} className="mt-1 block">
                      <select
                        aria-label="Question type"
                        value={question.type}
                        disabled={used.length > 0}
                        onChange={(event) => {
                          const type = event.target.value;
                          replace({
                            questions: questions.map((item) =>
                              item.id === question.id
                                ? {
                                    ...item,
                                    type,
                                    options: type === 'yes-no' ? ['Yes', 'No'] : ['Option 1', 'Option 2'],
                                  }
                                : item
                            ),
                          });
                        }}
                        className={cn(ariesField, selectChevronClass, 'disabled:pointer-events-none disabled:text-[#94a3b8]')}
                      >
                        <option value="choice">Choice</option>
                        <option value="yes-no">Yes / no</option>
                      </select>
                      </Tip>
                    </label>
                    {used.length ? <p className="mt-1 text-xs text-[#64748b]">Used by {used.join(', ')}</p> : null}
                    {question.type === 'choice' ? (
                      <OptionList
                        question={question}
                        graph={graph}
                        nodeId={nodeId}
                        onChange={(options) =>
                          replace({
                            questions: questions.map((item) => (item.id === question.id ? { ...item, options } : item)),
                          })
                        }
                      />
                    ) : null}
                    <Tip
                      label={
                        used.length
                          ? `Used by ${used.join(', ')}`
                          : questions.length <= 1
                            ? 'A decision needs at least one question'
                            : 'Remove this question'
                      }
                      side="top"
                      className="mt-3 inline-flex"
                    >
                      <button
                        type="button"
                        disabled={questions.length <= 1 || used.length > 0}
                        onClick={() => {
                          replace({ questions: questions.filter((item) => item.id !== question.id) });
                          setOpenId(null);
                        }}
                        className={cn('text-xs font-medium text-[#b42318] hover:underline disabled:pointer-events-none disabled:text-[#94a3b8] disabled:no-underline', ariesFocus)}
                      >
                        Remove question
                      </button>
                    </Tip>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
  if (part === 'end') {
    const endRunList = node.endRuns || [];
    return (
      <section>
        {endRunList.length === 0 ? (
          <p className="text-sm text-[#64748b]">The run always continues past this decision.</p>
        ) : null}
        <ul className="flex flex-col">
          {endRunList.map((endRun, index) => (
            <li key={endRun.id} className={cn(index > 0 && 'mt-4 border-t border-[#f1f5f9] pt-4')}>
              <div className="flex h-8 items-center justify-between">
                <p className={fieldLabel}>
                  {endRunList.length > 1 ? `End run ${index + 1} · stop when` : 'Stop when'}
                </p>
                <Tip label="Remove this end run">
                  <button
                    type="button"
                    onClick={() => replace({ endRuns: endRunList.filter((item) => item.id !== endRun.id) })}
                    className={cn('text-xs font-medium text-[#64748b] hover:text-[#b42318]', ariesFocus)}
                  >
                    Remove
                  </button>
                </Tip>
              </div>
              <Comparisons
                questions={questions}
                match={endRun.match || 'all'}
                comparisons={endRun.comparisons || []}
                onChange={(patch) =>
                  replace({
                    endRuns: endRunList.map((item) => (item.id === endRun.id ? { ...item, ...patch } : item)),
                  })
                }
              />
              <label className="mt-4 block">
                <span className={fieldLabel}>Stop reason</span>
                <textarea
                  aria-label="Stop reason"
                  placeholder="Shown on the run when it ends here"
                  value={endRun.reason}
                  rows={2}
                  onChange={(event) =>
                    replace({
                      endRuns: endRunList.map((item) =>
                        item.id === endRun.id ? { ...item, reason: event.target.value } : item
                      ),
                    })
                  }
                  className={cn(ariesField, 'mt-1.5 resize-none')}
                />
              </label>
            </li>
          ))}
        </ul>
        <Tip label="Stop the run when another condition is met" className="mt-4 inline-flex">
          <button
            type="button"
            onClick={() =>
              replace({
                endRuns: [...endRunList, { id: `end-${Date.now()}`, match: 'all', comparisons: [], reason: '' }],
              })
            }
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-[#cbd5e1] px-3 text-xs font-medium text-[#475569] hover:border-[#93c5fd] hover:text-[#0067D2]',
              ariesFocus
            )}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add end run
          </button>
        </Tip>
      </section>
    );
  }
  return (
      <section>
        {paths.length === 0 ? <p className="text-sm text-[#64748b]">No paths yet.</p> : null}
        <ul className="flex flex-col gap-2">
          {paths.map((edge) => {
            const target = graph.nodes[edge.to];
            const condition = edge.kind === 'default'
              ? 'When no other path matches'
              : conditionSummary(node, edge.match, edge.comparisons) || 'No condition yet';
            return (
              <li key={edge.to}>
                <Tip label={`Open ${target?.title}`} className="block">
                  <button
                    type="button"
                    onClick={() => onSelect(edge.to)}
                    className={cn(
                      'flex w-full flex-col rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[#93c5fd]',
                      ariesFocus
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn('text-[11px] font-semibold uppercase tracking-wide', STEP_TYPE[target?.type]?.kicker)}>
                        {STEP_TYPE[target?.type]?.label}
                      </span>
                      <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
                        {edge.kind === 'default' ? 'Default' : 'Conditional'}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-1">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0f172a]">{target?.title}</span>
                      <ChevronRight className="size-3.5 shrink-0 text-[#94a3b8]" aria-hidden="true" />
                    </span>
                    <span className="mt-0.5 truncate text-xs text-[#64748b]">{condition}</span>
                  </button>
                </Tip>
              </li>
            );
          })}
        </ul>
      </section>
  );
}

function OptionList({ question, graph, nodeId, onChange }) {
  const options = question.options || [];
  return (
    <div className="mt-3">
      <p className={fieldLabel}>Options</p>
      <ul className="mt-1 flex flex-col gap-1.5">
        {options.map((option, index) => {
          const used = questionUsages(graph, nodeId, question.id, option);
          const duplicate = options.filter((item) => item === option).length > 1;
          return (
            <li key={index}>
              <div className="flex items-center gap-1">
                <input
                  aria-label="Option"
                  value={option}
                  onChange={(event) => {
                    const next = options.slice();
                    next[index] = event.target.value;
                    onChange(next);
                  }}
                  className={cn(ariesField, 'py-2')}
                />
                <Tip
                  label={
                    used.length
                      ? `Used by ${used.join(', ')}`
                      : options.length <= 2
                        ? 'A choice needs at least two options'
                        : `Remove ${option}`
                  }
                  align="end"
                >
                  <button
                    type="button"
                    aria-label={`Remove ${option}`}
                    disabled={options.length <= 2 || used.length > 0}
                    onClick={() => onChange(options.filter((_, itemIndex) => itemIndex !== index))}
                    className={cn('flex size-8 shrink-0 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:pointer-events-none disabled:text-[#cbd5e1]', ariesFocus)}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </Tip>
              </div>
              {duplicate ? <p className="mt-1 text-xs text-[#b42318]">Already used</p> : null}
              {used.length ? <p className="mt-1 text-xs text-[#64748b]">Used by {used.join(', ')}</p> : null}
            </li>
          );
        })}
      </ul>
      <Tip label="Add an answer this question can return" side="top" className="mt-2 inline-flex">
        <button
          type="button"
          onClick={() => onChange([...options, `Option ${options.length + 1}`])}
          className={cn('text-xs font-medium text-[#0067D2] hover:underline', ariesFocus)}
        >
          Add option
        </button>
      </Tip>
    </div>
  );
}
