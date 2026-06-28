import { X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SubscriptionPlan } from "../../services/subscription.service";
import { PLAN_LIMITS } from "../../services/subscription.service";

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  upgradeRequired?: SubscriptionPlan;
}

/**
 * A modal dialog shown when a user tries to perform an action
 * that exceeds their current plan limits.
 */
export default function UpgradeDialog({
  isOpen,
  onClose,
  reason,
  upgradeRequired = "professional",
}: UpgradeDialogProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const targetPlan = PLAN_LIMITS[upgradeRequired];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap size={20} />
            </div>
            <h2 className="text-lg font-bold">Upgrade Required</h2>
          </div>
          <p className="text-white/80 text-sm">
            {reason ??
              "You've reached the limit on your current plan. Upgrade to continue."}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50 p-4 mb-5">
            <p className="font-semibold text-gray-900 mb-1">
              {targetPlan.name} Plan — ₹{targetPlan.price_monthly}/month
            </p>
            <p className="text-sm text-gray-600">{targetPlan.description}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                navigate("/billing");
              }}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              View Plans & Upgrade
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
