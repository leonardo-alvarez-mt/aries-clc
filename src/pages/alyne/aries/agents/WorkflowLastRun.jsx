import { ariesFocus } from '../ariesUi';
import { cn } from '../../../../utils/cn';
import { conditionSummary } from './workflowGraph';

const STATUS = {
  completed: { label: 'Completed', className: 'bg-[#ecfdf3] text-[#067647]' },
  'ended-early': { label: 'Ended early', className: 'bg-[#fff7ed] text-[#b45309]' },
  failed: { label: 'Failed', className: 'bg-[#fef3f2] text-[#b42318]' },
};

const sectionLabel = 'text-[11px] font-semibold uppercase tracking-wide text-[#64748b]';

export function WorkflowLastRun({ graph, runId, onSelectRun, floating }) {
  const run = graph.runs.find((item) => item.id === runId) || graph.runs[0];
  const decisionId = Object.keys(graph.nodes).find((id) => graph.nodes[id].type === 'decision');
  const decision = decisionId ? graph.nodes[decisionId] : null;
  const decisionStep = decisionId ? run.steps[decisionId] : null;
  const failed = decisionStep?.state === 'failed';
  const answers = decisionStep?.answers || [];
  const endResults = decision && decisionStep?.endRuns
    ? decision.endRuns.map((endRun) => ({
        endRun,
        met: Boolean(decisionStep.endRuns.find((item) => item.id === endRun.id)?.met),
        summary: conditionSummary(decision, endRun.match, endRun.comparisons),
      }))
    : [];
  return (
    <aside
      className={cn(
        'aries-side-panel flex flex-col overflow-hidden bg-white',
        floating ? 'h-full w-full' : 'w-[360px] shrink-0 rounded-2xl border border-[#e2e8f0]'
      )}
      aria-label="Last run"
    >
      <div className="border-b border-[#e2e8f0] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Runs</p>
        <ul className="mt-2 flex flex-col gap-1">
          {graph.runs.map((item) => {
            const status = STATUS[item.status];
            const selected = item.id === run.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectRun(item.id)}
                  className={cn(
                    'w-full rounded-lg px-2 py-2 text-left',
                    ariesFocus,
                    selected ? 'bg-[#f8fafc]' : 'hover:bg-[#f8fafc]'
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#0f172a]">{item.time}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', status.className)}>
                      {status.label}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-[#475569]">{item.summary}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <section>
          <p className={sectionLabel}>Outcome</p>
          <p className={cn('mt-1.5 text-sm font-medium', failed ? 'text-[#b42318]' : 'text-[#0f172a]')}>
            {failed ? `Failed at ${decision?.title || 'this step'}` : run.pathTaken}
          </p>
          {run.reason ? (
            <p className={cn('mt-1 text-sm leading-5', failed ? 'text-[#b42318]' : 'text-[#475569]')}>{run.reason}</p>
          ) : null}
        </section>
        {answers.length ? (
          <section className="mt-5 border-t border-[#f1f5f9] pt-4">
            <p className={sectionLabel}>Decision · {decision.title}</p>
            <ul className="mt-1">
              {answers.map((answer) => (
                <li key={answer.questionId} className="border-b border-[#f1f5f9] py-3 last:border-b-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-[#64748b]">{answer.name}</span>
                    <span className="text-sm font-medium text-[#0f172a]">{answer.selected}</span>
                  </div>
                  <p className="mt-1 text-xs leading-4 text-[#94a3b8]">
                    {[
                      answer.options?.join(', '),
                      answer.confidence ? `Confidence ${answer.confidence}` : null,
                      answer.decidedBy,
                    ].filter(Boolean).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {endResults.length ? (
          <section className="mt-5 border-t border-[#f1f5f9] pt-4">
            <p className={sectionLabel}>End run</p>
            <ul className="mt-1">
              {endResults.map(({ endRun, met, summary }) => (
                <li key={endRun.id} className="flex items-baseline justify-between gap-3 border-b border-[#f1f5f9] py-3 last:border-b-0 last:pb-0">
                  <span className="min-w-0 text-sm text-[#0f172a]">{summary || 'End run'}</span>
                  <span className={cn('shrink-0 text-xs font-medium', met ? 'text-[#b45309]' : 'text-[#64748b]')}>
                    {met ? 'Met' : 'Not met'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
