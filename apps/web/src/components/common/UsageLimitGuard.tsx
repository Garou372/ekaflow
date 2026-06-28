import { useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import UpgradeDialog from "./UpgradeDialog";
import type { SubscriptionPlan } from "../../services/subscription.service";

interface UsageLimitGuardProps {
  action: 'create_client' | 'create_project' | 'create_invoice' | 'create_proposal' | 'use_ai';
  children: (props: {
    onClick: (e?: any) => void;
  }) => React.ReactNode;
  onProceed: () => void;
}

export default function UsageLimitGuard({ action, children, onProceed }: UsageLimitGuardProps) {
  const { canPerform, isLoading } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState<SubscriptionPlan>("professional");

  const handleClick = (e?: any) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    
    if (isLoading) return;

    const limitCheck = canPerform(action);
    if (!limitCheck.allowed) {
      setUpgradeRequired(limitCheck.upgradeRequired ?? "professional");
      setShowUpgradeDialog(true);
    } else {
      onProceed();
    }
  };

  return (
    <>
      {children({ onClick: handleClick })}
      
      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        upgradeRequired={upgradeRequired}
      />
    </>
  );
}
