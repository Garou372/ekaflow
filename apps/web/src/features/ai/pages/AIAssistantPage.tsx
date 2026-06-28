import PageHeader from "../../../components/common/PageHeader";
import AIAssistantPanel from "../components/AIAssistantPanel";

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Your intelligent partner for drafting, improving, and analyzing business content."
      />

      <div className="max-w-2xl">
        <AIAssistantPanel />
      </div>
    </div>
  );
}
