import { useAries } from './AriesContext';

export function ContextTab() {
  const { companyProfile, frameworks, glossary } = useAries();
  const inScope = frameworks.filter((f) => f.inScope);

  return (
    <div className="space-y-4">
      <section>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
          Company profile
        </p>
        <ul className="m-0 list-none space-y-1 p-0 text-[12.5px] text-[#475467]">
          <li>
            <span className="font-medium text-[#1A2141]">Industry:</span> {companyProfile.industry}
          </li>
          <li>
            <span className="font-medium text-[#1A2141]">Regions:</span> {companyProfile.regions}
          </li>
          <li>
            <span className="font-medium text-[#1A2141]">Risk appetite:</span>{' '}
            {companyProfile.riskAppetite}
          </li>
        </ul>
      </section>
      <section>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
          Frameworks & policies
        </p>
        <ul className="m-0 list-none space-y-1 p-0 text-[12.5px] text-[#475467]">
          {inScope.map((f) => (
            <li key={f.id}>• {f.name}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3]">
          Glossary used
        </p>
        <ul className="m-0 list-none space-y-1 p-0 text-[12.5px] text-[#475467]">
          {glossary.slice(0, 3).map((g) => (
            <li key={g.id}>
              <span className="font-medium text-[#1A2141]">{g.term}</span> — {g.definition}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
