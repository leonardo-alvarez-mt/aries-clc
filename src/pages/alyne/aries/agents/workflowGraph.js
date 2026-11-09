export const CAPABILITY_AGENTS = ['Vendor Survey Agent', 'Risk Mitigation Agent'];

export const STEP_TYPE = {
  trigger: { label: 'Trigger', kicker: 'text-[#64748b]' },
  agent: { label: 'Agent', kicker: 'text-[#0067D2]' },
  decision: { label: 'Decision', kicker: 'text-[#b45309]' },
};

export const OPERATORS = [
  { id: 'equals', label: 'equals' },
  { id: 'not-equals', label: 'does not equal' },
  { id: 'one-of', label: 'is one of' },
];

export const CARD_W = 240;
export const CARD_H = 116;
const GAP_X = 88;
const GAP_Y = 48;
const PAD_X = 80;
const PAD_Y = 80;

export function cloneGraph(graph) {
  return structuredClone(graph);
}

export function rootId(graph) {
  const trigger = Object.entries(graph.nodes).find(([, node]) => node.type === 'trigger');
  if (trigger) return trigger[0];
  return Object.keys(graph.nodes).find((id) => !graph.edges.some((edge) => edge.to === id));
}

export function outgoing(graph, id) {
  return graph.edges.filter((edge) => edge.from === id);
}

export function incoming(graph, id) {
  return graph.edges.filter((edge) => edge.to === id);
}

export function parentsOf(graph, id) {
  return incoming(graph, id).map((edge) => edge.from);
}

function edgeRank(edge) {
  if (edge.kind === 'conditional') return 0;
  if (edge.kind === 'next') return 1;
  return 2;
}

export function depthOf(graph) {
  const memo = new Map();
  const depth = (id, stack) => {
    if (memo.has(id)) return memo.get(id);
    if (stack.has(id)) return 0;
    const parents = parentsOf(graph, id);
    const next = new Set(stack);
    next.add(id);
    const value = parents.length ? 1 + Math.max(...parents.map((parent) => depth(parent, next))) : 0;
    memo.set(id, value);
    return value;
  };
  for (const id of Object.keys(graph.nodes)) depth(id, new Set());
  return memo;
}

function laneOf(graph, depth) {
  const root = rootId(graph);
  const primary = new Map();
  for (const id of Object.keys(graph.nodes)) {
    const parents = parentsOf(graph, id);
    if (!parents.length) continue;
    const [chosen] = parents
      .map((parent) => ({ parent, edge: graph.edges.find((edge) => edge.from === parent && edge.to === id) }))
      .sort((a, b) => depth.get(a.parent) - depth.get(b.parent) || edgeRank(a.edge) - edgeRank(b.edge));
    primary.set(id, chosen.parent);
  }
  const children = new Map();
  for (const [id, parent] of primary) {
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(id);
  }
  for (const kids of children.values()) {
    kids.sort((a, b) => {
      const edgeA = graph.edges.find((edge) => edge.from === primary.get(a) && edge.to === a);
      const edgeB = graph.edges.find((edge) => edge.from === primary.get(b) && edge.to === b);
      return edgeRank(edgeA) - edgeRank(edgeB) || graph.edges.indexOf(edgeA) - graph.edges.indexOf(edgeB);
    });
  }

  const lane = {};
  let cursor = 0;
  const walk = (id) => {
    const kids = children.get(id) || [];
    if (!kids.length) {
      lane[id] = cursor;
      cursor += 1;
      return;
    }
    kids.forEach(walk);
    const lanes = kids.map((kid) => lane[kid]);
    lane[id] = (Math.min(...lanes) + Math.max(...lanes)) / 2;
  };
  if (root) walk(root);
  for (const id of Object.keys(graph.nodes)) {
    if (lane[id] == null) {
      lane[id] = cursor;
      cursor += 1;
    }
  }
  return centerJoins(graph, lane, depth);
}

function centerJoins(graph, lane, depth) {
  const next = { ...lane };
  const ordered = Object.keys(graph.nodes).sort((a, b) => depth.get(a) - depth.get(b));
  for (const id of ordered) {
    const parents = parentsOf(graph, id);
    if (parents.length < 2) continue;
    next[id] = parents.reduce((sum, parent) => sum + next[parent], 0) / parents.length;
  }
  const ranks = new Map();
  for (const id of ordered) {
    const rank = depth.get(id);
    if (!ranks.has(rank)) ranks.set(rank, []);
    ranks.get(rank).push(id);
  }
  for (const ids of ranks.values()) {
    ids.sort((a, b) => next[a] - next[b]);
    for (let index = 1; index < ids.length; index += 1) {
      if (next[ids[index]] < next[ids[index - 1]] + 1) next[ids[index]] = next[ids[index - 1]] + 1;
    }
  }
  return next;
}

export function comparisonText(question, comparison) {
  if (!question || !comparison?.operator || !comparison.values?.length) return '';
  const known = comparison.values.filter((value) => question.options.includes(value));
  if (!known.length) return '';
  const list = known.join(', ');
  if (comparison.operator === 'not-equals') return `${question.name} is not ${list}`;
  if (comparison.operator === 'one-of') return `${question.name} is one of ${list}`;
  return `${question.name} is ${list}`;
}

export function conditionSummary(decision, match, comparisons) {
  const parts = (comparisons || [])
    .map((comparison) => comparisonText(decision?.questions?.find((question) => question.id === comparison.questionId), comparison))
    .filter(Boolean);
  if (!parts.length) return '';
  return parts.join(match === 'any' ? ' or ' : ' and ');
}

export function edgeLabel(graph, edge) {
  if (edge.kind === 'default') return 'Default';
  if (edge.kind !== 'conditional') return '';
  const index = graph.edges.filter((item) => item.from === edge.from && item.kind === 'conditional').indexOf(edge) + 1;
  const summary = conditionSummary(graph.nodes[edge.from], edge.match, edge.comparisons);
  return summary ? `Conditional ${index} · ${summary}` : `Conditional ${index}`;
}

/** Left-to-right layout. Writes position onto each node and returns a new graph. */
export function autoLayout(graph) {
  const depth = depthOf(graph);
  const lane = laneOf(graph, depth);
  const minLane = Math.min(...Object.values(lane), 0);
  const nodes = {};
  for (const [id, node] of Object.entries(graph.nodes)) {
    nodes[id] = {
      ...node,
      position: {
        x: PAD_X + (depth.get(id) || 0) * (CARD_W + GAP_X),
        y: PAD_Y + (lane[id] - minLane) * (CARD_H + GAP_Y),
      },
    };
  }
  return { ...graph, nodes };
}

export function ensurePositions(graph) {
  const missing = Object.values(graph.nodes).some((node) => !node.position);
  return missing ? autoLayout(graph) : graph;
}

export function placeChild(graph, parentId) {
  const parent = graph.nodes[parentId];
  if (!parent?.position) {
    const laid = autoLayout(graph);
    return placeChild(laid, parentId);
  }
  const siblings = outgoing(graph, parentId)
    .map((edge) => graph.nodes[edge.to])
    .filter((node) => node?.position);
  const x = parent.position.x + CARD_W + GAP_X;
  if (!siblings.length) {
    return { x, y: parent.position.y };
  }
  const bottom = Math.max(...siblings.map((node) => node.position.y));
  return { x, y: bottom + CARD_H + GAP_Y };
}

function walkPaths(graph, targetId) {
  const root = rootId(graph);
  const paths = [];
  const visit = (id, trail) => {
    if (trail.includes(id)) return;
    const next = [...trail, id];
    if (id === targetId) {
      paths.push(next);
      return;
    }
    outgoing(graph, id).forEach((edge) => visit(edge.to, next));
  };
  visit(root, []);
  return paths;
}

export function inputChoices(graph, nodeId) {
  const paths = walkPaths(graph, nodeId);
  const earlier = [];
  const seen = new Set();
  for (const path of paths) {
    for (const id of path) {
      if (id === nodeId || seen.has(id)) continue;
      seen.add(id);
      earlier.push(id);
    }
  }
  const available = [];
  const locked = [];
  for (const id of earlier) {
    (paths.every((path) => path.includes(id)) ? available : locked).push(id);
  }
  return { available, locked };
}

export function pathEdges(graph, decisionId) {
  return outgoing(graph, decisionId)
    .filter((edge) => edge.kind === 'conditional' || edge.kind === 'default')
    .slice()
    .sort((a, b) => edgeRank(a) - edgeRank(b) || graph.edges.indexOf(a) - graph.edges.indexOf(b));
}

export function incomingPathEdge(graph, nodeId) {
  return (
    incoming(graph, nodeId).find(
      (edge) => (edge.kind === 'default' || edge.kind === 'conditional') && graph.nodes[edge.from]?.type === 'decision'
    ) || null
  );
}

export function questionUsages(graph, decisionId, questionId, value) {
  const names = [];
  for (const edge of outgoing(graph, decisionId)) {
    const used = (edge.comparisons || []).some(
      (comparison) => comparison.questionId === questionId && (value == null || comparison.values?.includes(value))
    );
    if (used && graph.nodes[edge.to]) names.push(graph.nodes[edge.to].title);
  }
  for (const endRun of graph.nodes[decisionId]?.endRuns || []) {
    const used = (endRun.comparisons || []).some(
      (comparison) => comparison.questionId === questionId && (value == null || comparison.values?.includes(value))
    );
    if (used) names.push('an end run');
  }
  return [...new Set(names)];
}

function uniqueTitle(graph, base) {
  const titles = new Set(Object.values(graph.nodes).map((node) => node.title));
  if (!titles.has(base)) return base;
  let count = 2;
  while (titles.has(`${base} ${count}`)) count += 1;
  return `${base} ${count}`;
}

function nextId(graph, prefix) {
  let count = 1;
  while (graph.nodes[`${prefix}-${count}`]) count += 1;
  return `${prefix}-${count}`;
}

function blankAgent(graph) {
  return {
    type: 'agent',
    title: uniqueTitle(graph, 'New step'),
    agent: CAPABILITY_AGENTS[0],
    instruction: '',
    inputs: [],
    gate: false,
  };
}

function blankDecision(graph) {
  return {
    type: 'decision',
    title: uniqueTitle(graph, 'New decision'),
    instruction: '',
    inputs: [],
    gate: false,
    questions: [{ id: 'question-1', name: 'Question 1', type: 'yes-no', options: ['Yes', 'No'] }],
    endRuns: [],
  };
}

function edgeKindFor(graph, fromId) {
  const source = graph.nodes[fromId];
  if (source?.type === 'decision') {
    return outgoing(graph, fromId).some((edge) => edge.kind === 'default') ? 'conditional' : 'default';
  }
  return 'next';
}

function reaches(graph, fromId, toId) {
  const seen = new Set();
  const stack = [fromId];
  while (stack.length) {
    const id = stack.pop();
    if (id === toId) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    outgoing(graph, id).forEach((edge) => stack.push(edge.to));
  }
  return false;
}

export function canConnect(graph, fromId, toId) {
  if (!fromId || !toId || fromId === toId) return false;
  if (!graph.nodes[fromId] || !graph.nodes[toId]) return false;
  if (graph.nodes[toId].type === 'trigger') return false;
  if (graph.edges.some((edge) => edge.from === fromId && edge.to === toId)) return false;
  if (reaches(graph, toId, fromId)) return false;
  return true;
}

export function connect(graph, fromId, toId) {
  if (!canConnect(graph, fromId, toId)) return graph;
  const target = graph.nodes[toId];
  const inputs = target.inputs?.includes(fromId) ? target.inputs : [...(target.inputs || []), fromId];
  return {
    ...graph,
    nodes: { ...graph.nodes, [toId]: { ...target, inputs } },
    edges: [
      ...graph.edges,
      { from: fromId, to: toId, kind: edgeKindFor(graph, fromId), match: 'all', comparisons: [] },
    ],
  };
}

export function disconnect(graph, fromId, toId) {
  const target = graph.nodes[toId];
  return {
    ...graph,
    edges: graph.edges.filter((edge) => !(edge.from === fromId && edge.to === toId)),
    nodes: target
      ? {
          ...graph.nodes,
          [toId]: {
            ...target,
            inputs: (target.inputs || []).filter((id) => id !== fromId),
          },
        }
      : graph.nodes,
  };
}

/** Always append a sibling child. Never insert into an existing edge. */
export function addChild(graph, parentId, type, position) {
  const source = graph.nodes[parentId];
  if (!source) return { graph, id: null };
  const id = nextId(graph, type === 'decision' ? 'decision' : 'step');
  const node = type === 'decision' ? blankDecision(graph) : blankAgent(graph);
  node.inputs = [parentId];
  node.position = position || placeChild(graph, parentId);
  const edge = { from: parentId, to: id, kind: edgeKindFor(graph, parentId), match: 'all', comparisons: [] };
  return {
    id,
    graph: {
      ...graph,
      nodes: { ...graph.nodes, [id]: node },
      edges: [...graph.edges, edge],
    },
  };
}

/** Insert a step on an existing edge (the only place insertion happens). */
export function insertOnEdge(graph, fromId, toId, type) {
  const edge = graph.edges.find((item) => item.from === fromId && item.to === toId);
  if (!edge) return { graph, id: null };
  const from = graph.nodes[fromId];
  const to = graph.nodes[toId];
  const id = nextId(graph, type === 'decision' ? 'decision' : 'step');
  const node = type === 'decision' ? blankDecision(graph) : blankAgent(graph);
  node.inputs = [fromId];
  node.position = {
    x: ((from?.position?.x || 0) + (to?.position?.x || 0)) / 2,
    y: ((from?.position?.y || 0) + (to?.position?.y || 0)) / 2,
  };
  const mid = {
    from: fromId,
    to: id,
    kind: edge.kind,
    match: edge.match || 'all',
    comparisons: edge.comparisons || [],
  };
  const leave = { from: id, to: toId, kind: 'next', match: 'all', comparisons: [] };
  const target = graph.nodes[toId];
  const inputs = (target.inputs || []).filter((item) => item !== fromId);
  if (!inputs.includes(id)) inputs.push(id);
  return {
    id,
    graph: {
      ...graph,
      nodes: {
        ...graph.nodes,
        [id]: node,
        [toId]: { ...target, inputs },
      },
      edges: [...graph.edges.filter((item) => !(item.from === fromId && item.to === toId)), mid, leave],
    },
  };
}

export function deleteStep(graph, nodeId) {
  const node = graph.nodes[nodeId];
  if (!node || node.type === 'trigger') return graph;
  const ins = incoming(graph, nodeId);
  const outs = outgoing(graph, nodeId);
  let edges = graph.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId);
  if (ins.length === 1 && outs.length === 1) {
    const [enter] = ins;
    const [leave] = outs;
    const fromDecision = graph.nodes[enter.from]?.type === 'decision';
    edges = [
      ...edges,
      {
        from: enter.from,
        to: leave.to,
        kind: fromDecision ? enter.kind : 'next',
        match: fromDecision ? enter.match || 'all' : 'all',
        comparisons: fromDecision ? enter.comparisons || [] : [],
      },
    ];
  }
  const nodes = {};
  for (const [id, item] of Object.entries(graph.nodes)) {
    if (id === nodeId) continue;
    nodes[id] = item.inputs ? { ...item, inputs: item.inputs.filter((input) => input !== nodeId) } : item;
  }
  return { ...graph, nodes, edges };
}

export function withNode(graph, id, patch) {
  return { ...graph, nodes: { ...graph.nodes, [id]: { ...graph.nodes[id], ...patch } } };
}

export function setNodePosition(graph, id, position) {
  const node = graph.nodes[id];
  if (!node) return graph;
  return withNode(graph, id, { position });
}

export function setConnection(graph, fromId, toId, kind) {
  const taken = graph.edges.some((edge) => edge.from === fromId && edge.to !== toId && edge.kind === 'default');
  if (kind === 'default' && taken) return graph;
  return {
    ...graph,
    edges: graph.edges.map((edge) => {
      if (edge.from !== fromId || edge.to !== toId) return edge;
      return {
        ...edge,
        kind,
        match: edge.match || 'all',
        comparisons: kind === 'default' ? [] : edge.comparisons || [],
      };
    }),
  };
}

export function patchEdge(graph, fromId, toId, patch) {
  return {
    ...graph,
    edges: graph.edges.map((edge) => (edge.from === fromId && edge.to === toId ? { ...edge, ...patch } : edge)),
  };
}

export function addEndRun(graph, decisionId) {
  const node = graph.nodes[decisionId];
  const endRun = {
    id: `end-${(node.endRuns?.length || 0) + 1}`,
    match: 'all',
    comparisons: [],
    reason: '',
  };
  return withNode(graph, decisionId, { endRuns: [...(node.endRuns || []), endRun] });
}
