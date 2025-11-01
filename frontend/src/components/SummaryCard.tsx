import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  iconColor?: string;
}

export default function SummaryCard({ title, value, icon: Icon, change, iconColor = 'text-primary-600' }: SummaryCardProps) {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={
              isPositive ? 'text-sm mt-2 text-green-600' : 
              isNegative ? 'text-sm mt-2 text-red-600' : 
              'text-sm mt-2 text-gray-600'
            }>
              {change} vs período anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gray-100 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
