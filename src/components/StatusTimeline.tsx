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
  const currentStep =
    status === "pending" ? 1 : 2;

  const finalLabel = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Decision";
  const finalColor = status === "approved" ? "text-green-700" : status === "rejected" ? "text-red-700" : "";

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isFinal = index === 2;

        let dotColor = "bg-gray-300";
        let lineColor = "bg-gray-200";
        let textColor = "text-gray-400";
        let timestamp = "";

        if (isCompleted) {
          dotColor = "bg-blue-600";
          lineColor = "bg-blue-600";
          textColor = "text-gray-900";
        }
        if (isCurrent && status === "pending") {
          dotColor = "bg-yellow-500 animate-pulse";
          textColor = "text-gray-900";
        }
        if (isFinal && status === "approved") {
          dotColor = "bg-green-600";
          textColor = "text-green-700";
        }
        if (isFinal && status === "rejected") {
          dotColor = "bg-red-600";
          textColor = "text-red-700";
        }

        if (index === 0 && createdAt) {
          timestamp = new Date(createdAt).toLocaleString();
        }
        if (isFinal && statusUpdatedAt) {
          timestamp = new Date(statusUpdatedAt).toLocaleString();
        }

        const label = isFinal ? finalLabel : step.label;

        return (
          <div key={step.key} className="flex items-start gap-4">
            {/* Line + Dot */}
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full shrink-0 ${dotColor}`} />
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-10 ${isCompleted ? lineColor : "bg-gray-200"}`} />
              )}
            </div>
            {/* Content */}
            <div className="pb-6 -mt-0.5">
              <p className={`text-sm font-medium ${isFinal ? finalColor : textColor}`}>
                {label}
              </p>
              {timestamp && (
                <p className="text-xs text-gray-400 mt-0.5">{timestamp}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
