import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AriesProvider, useAries } from '../AriesContext';
import WorkflowDesigner from './WorkflowDesigner';

function DesignerBody() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { registryAgents } = useAries();
  const agent = registryAgents.find((item) => item.graph && item.id === agentId);

  if (!agent) return <Navigate to="/aries/agents" replace />;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#f8fafc]">
      <WorkflowDesigner agent={agent} onBack={() => navigate('/aries/agents')} />
    </div>
  );
}

export default function WorkflowDesignerPage() {
  return (
    <AriesProvider>
      <DesignerBody />
    </AriesProvider>
  );
}
