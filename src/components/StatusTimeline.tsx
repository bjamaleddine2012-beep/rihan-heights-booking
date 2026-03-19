"use client";

interface StatusTimelineProps {
  status: string;
  createdAt: string;
  statusUpdatedAt?: string | null;
}

const steps = [
  { key: "submitted", label: "Submitted" },
  { key: "review", label: "Under Review" },
  { key: "final", label: "Decision" },
];

export default function StatusTimeline({ status, createdAt, statusUpdatedAt }: StatusTimelineProps) {
  const currentStep = status === "pending" ? 1 : 2;
  const finalLabel = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Decision";

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep && status === "pending";
        const isFinal = index === 2;

        let dotColor = "bg-white/10";
        let lineColor = "bg-white/10";
        let textColor = "text-[var(--text-muted)]";
        let timestamp = "";

        if (isCompleted) {
          dotColor = "bg-gold";
          lineColor = "bg-gold/40";
          textColor = "text-white";
        }
        if (isCurrent) {
          dotColor = "bg-yellow-500 animate-pulse";
          textColor = "text-white";
        }
        if (isFinal && status === "approved") {
          dotColor = "bg-green-500";
          textColor = "text-green-400";
        }
        if (isFinal && status === "rejected") {
          dotColor = "bg-red-500";
          textColor = "text-red-400";
        }

        if (index === 0 && createdAt) timestamp = new Date(createdAt).toLocaleString();
        if (isFinal && statusUpdatedAt) timestamp = new Date(statusUpdatedAt).toLocaleString();

        const label = isFinal ? finalLabel : step.label;

        return (
          <div key={step.key} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full shrink-0 ${dotColor}`} />
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-10 ${isCompleted ? lineColor : "bg-white/5"}`} />
              )}
            </div>
            <div className="pb-6 -mt-0.5">
              <p className={`text-sm font-medium ${textColor}`}>{label}</p>
              {timestamp && <p className="text-xs text-[var(--text-muted)] mt-0.5">{timestamp}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
