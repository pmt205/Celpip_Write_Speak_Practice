interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  onClick: () => void;
  color: string;
}

function DashboardCard({ title, value, icon, onClick, color }: DashboardCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer ${color} dark:bg-gray-800 dark:text-white`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{title}</div>
    </button>
  );
}

export default DashboardCard;
