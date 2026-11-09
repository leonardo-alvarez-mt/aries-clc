import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ChevronRight, Upload, Plus } from 'lucide-react';
import { useAries } from './AriesContext';
import AriesSkills from './AriesSkills';
import { ariesFocus } from './ariesUi';
import {
  PillSelect,
  SettingsCard,
  SettingsPage,
  SettingsRow,
  SettingsSection,
  Switch,
  pillButton,
  primaryPillButton,
  settingsInput,
  settingsTextarea,
} from './settingsUi';
import { cn } from '../../../utils/cn';

const INDUSTRIES = [
  'Financial services',
  'Insurance',
  'Healthcare',
  'Technology',
  'Manufacturing',
  'Public sector',
  'Retail',
  'Energy & utilities',
];

function CompanyProfile() {
  const { companyProfile, setCompanyProfile } = useAries();

  function update(key, value) {
    setCompanyProfile((p) => ({ ...p, [key]: value }));
  }

  const industries = INDUSTRIES.includes(companyProfile.industry)
    ? INDUSTRIES
    : [companyProfile.industry, ...INDUSTRIES].filter(Boolean);

  return (
    <SettingsPage
      title="Company profile"
      description="Facts ARIES uses so wording and survey questions fit your organisation."
    >
      <SettingsSection
        title="Organisation"
        description="Core details ARIES uses to tailor its language and recommendations."
      >
        <SettingsCard>
          <SettingsRow
            label="Organisation name"
            htmlFor="cp-name"
            description="Shown in generated documents and answers"
            control={
              <input
                id="cp-name"
                value={companyProfile.name || ''}
                onChange={(e) => update('name', e.target.value)}
                className={cn(settingsInput, 'w-[260px]')}
              />
            }
          />
          <SettingsRow
            label="Industry"
            htmlFor="cp-industry"
            description="Tunes examples, regulations, and risk language"
            control={
              <PillSelect
                id="cp-industry"
                value={companyProfile.industry || ''}
                onChange={(value) => update('industry', value)}
                options={industries}
              />
            }
          />
          <SettingsRow
            label="Regions"
            htmlFor="cp-regions"
            description="Where you operate, separated by commas"
            control={
              <input
                id="cp-regions"
                value={companyProfile.regions || ''}
                onChange={(e) => update('regions', e.target.value)}
                className={cn(settingsInput, 'w-[260px]')}
              />
            }
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Risk posture"
        description="ARIES keeps recommendations inside this appetite. One or two sentences are enough."
      >
        <textarea
          id="cp-appetite"
          aria-label="Risk appetite"
          rows={3}
          value={companyProfile.riskAppetite || ''}
          onChange={(e) => update('riskAppetite', e.target.value)}
          className={settingsTextarea}
        />
      </SettingsSection>

      <SettingsSection
        title="About"
        description="Background ARIES reads before every answer. What you do and who you serve."
      >
        <textarea
          id="cp-summary"
          aria-label="Summary"
          rows={4}
          value={companyProfile.summary || ''}
          onChange={(e) => update('summary', e.target.value)}
          className={settingsTextarea}
        />
      </SettingsSection>
    </SettingsPage>
  );
}

function Frameworks() {
  const { frameworks, toggleFramework, addPolicyFile } = useAries();
  const [adding, setAdding] = useState(false);
  const [fileName, setFileName] = useState('');
  const list = frameworks.filter((f) => f.type === 'framework');
  const policies = frameworks.filter((f) => f.type === 'policy');

  const addPolicy = (event) => {
    event.preventDefault();
    if (!fileName.trim()) return;
    addPolicyFile(fileName.trim());
    setFileName('');
    setAdding(false);
  };

  return (
    <SettingsPage
      title="Frameworks & policies"
      description="What is in scope for the program, and the policies ARIES can cite."
    >
      <SettingsSection title="Frameworks" description="Turn off a framework to keep it out of answers.">
        <SettingsCard>
          {list.map((f) => (
            <SettingsRow
              key={f.id}
              label={f.name}
              description={f.inScope ? 'In scope' : 'Out of scope'}
              control={<Switch checked={f.inScope} onChange={() => toggleFramework(f.id)} label={`${f.name} in scope`} />}
            />
          ))}
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Policies" description="ARIES quotes these when it explains a recommendation.">
        <SettingsCard>
          {policies.map((f) => (
            <SettingsRow
              key={f.id}
              label={f.name}
              description={f.uploaded ? 'File uploaded' : 'No file yet'}
              control={<Switch checked={f.inScope} onChange={() => toggleFramework(f.id)} label={`${f.name} in scope`} />}
            />
          ))}
          {adding ? (
            <form onSubmit={addPolicy} className="flex items-center gap-2 px-4 py-3">
              <input
                autoFocus
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Acceptable Use Policy.pdf"
                aria-label="Policy file name"
                className={cn(settingsInput, 'flex-1')}
              />
              <button type="button" className={pillButton} onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button type="submit" className={primaryPillButton} disabled={!fileName.trim()}>
                Add
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-[#f8fafc]',
                ariesFocus
              )}
            >
              <span>
                <span className="block text-[14px] font-medium text-[#0f172a]">Upload a policy</span>
                <span className="block text-[12.5px] text-[#64748b]">PDF or Word, up to 20 MB</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[13px] text-[#475569]">
                <Upload size={14} strokeWidth={1.75} aria-hidden />
                Add
                <ChevronRight size={15} strokeWidth={1.75} aria-hidden />
              </span>
            </button>
          )}
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}

function Glossary() {
  const { glossary, addGlossaryTerm } = useAries();
  const [adding, setAdding] = useState(false);
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');

  const add = (event) => {
    event.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    addGlossaryTerm(term.trim(), definition.trim());
    setTerm('');
    setDefinition('');
    setAdding(false);
  };

  return (
    <SettingsPage
      title="Glossary"
      description="Your organisation’s terms, so ARIES uses the same language as your teams."
    >
      <SettingsSection
        title="Terms"
        description={`${glossary.length} terms ARIES will use in answers and documents.`}
        action={
          !adding && (
            <button type="button" className={pillButton} onClick={() => setAdding(true)}>
              <Plus size={14} strokeWidth={2} aria-hidden />
              Add term
            </button>
          )
        }
      >
        <SettingsCard>
          {adding && (
            <form onSubmit={add} className="space-y-2 bg-[#f8fafc] px-4 py-3.5">
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Term"
                aria-label="Term"
                className={settingsInput}
              />
              <textarea
                rows={2}
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Definition"
                aria-label="Definition"
                className={settingsTextarea}
              />
              <div className="flex justify-end gap-2">
                <button type="button" className={pillButton} onClick={() => setAdding(false)}>
                  Cancel
                </button>
                <button type="submit" className={primaryPillButton} disabled={!term.trim() || !definition.trim()}>
                  Save term
                </button>
              </div>
            </form>
          )}
          {glossary.map((g) => (
            <SettingsRow key={g.id} label={g.term} description={g.definition} />
          ))}
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
}

export default function AriesKnowledge() {
  const { section } = useParams();

  if (!section) {
    return <Navigate to="/aries/knowledge/company-profile" replace />;
  }

  switch (section) {
    case 'company-profile':
      return <CompanyProfile />;
    case 'frameworks':
      return <Frameworks />;
    case 'glossary':
      return <Glossary />;
    case 'skills':
      return <AriesSkills />;
    default:
      return <Navigate to="/aries/knowledge/company-profile" replace />;
  }
}
