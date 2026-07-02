// client/src/components/StatsCards.js
import { useEffect, useState } from "react";
import { getStats } from "../services/api";

export default function StatsCards({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((data) => !cancelled && setStats(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (error)
    return <div className="text-red-600 text-sm">Stats error: {error}</div>;
  if (!stats)
    return <div className="text-gray-500 text-sm">Loading stats...</div>;

  const byStatus = {};
  for (const row of stats.byStatus) {
    byStatus[row.status] = row.total;
  }

  const cards = [
    { label: "Total leads", value: stats.total },
    { label: "New", value: byStatus.new || 0 },
    { label: "Qualified", value: byStatus.qualified || 0 },
    { label: "Converted", value: byStatus.converted || 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-lg shadow p-4 border border-gray-100"
        >
          <div className="text-sm text-gray-500">{c.label}</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
