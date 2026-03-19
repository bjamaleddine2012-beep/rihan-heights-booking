interface StatsCardsProps {
  counts: { all: number; pending: number; approved: number; rejected: number };
}

const cards = [
  { key: "all" as const, label: "Total", bg: "bg-blue-500/10", text: "text-blue-400", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { key: "pending" as const, label: "Pending", bg: "bg-yellow-500/10", text: "text-yellow-400", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "approved" as const, label: "Approved", bg: "bg-green-500/10", text: "text-green-400", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "rejected" as const, label: "Rejected", bg: "bg-red-500/10", text: "text-red-400", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function StatsCards({ counts }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.key} className={`rounded-xl p-4 ${card.bg} border border-white/5 animate-fade-in`}>
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${card.text} opacity-70`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
            </svg>
            <span className={`text-sm font-medium ${card.text}`}>{card.label}</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{counts[card.key]}</p>
        </div>
      ))}
    </div>
  );
}
