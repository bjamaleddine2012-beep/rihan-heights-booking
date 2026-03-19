interface StatsCardsProps {
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

const cards = [
  { key: "all" as const, label: "Total", color: "bg-blue-50 text-blue-700", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { key: "pending" as const, label: "Pending", color: "bg-yellow-50 text-yellow-700", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "approved" as const, label: "Approved", color: "bg-green-50 text-green-700", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "rejected" as const, label: "Rejected", color: "bg-red-50 text-red-700", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function StatsCards({ counts }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`rounded-xl p-4 ${card.color} animate-fade-in`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
            </svg>
            <span className="text-sm font-medium">{card.label}</span>
          </div>
          <p className="text-3xl font-bold mt-2">{counts[card.key]}</p>
        </div>
      ))}
    </div>
  );
}
