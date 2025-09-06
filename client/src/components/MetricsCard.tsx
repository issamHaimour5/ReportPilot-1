interface MetricsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: string;
  iconColor: string;
  changeColor: string;
  testId?: string;
}

export function MetricsCard({ 
  title, 
  value, 
  change, 
  icon, 
  iconColor, 
  changeColor,
  testId 
}: MetricsCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold" data-testid={`text-${testId}-value`}>{value}</p>
          <p className={`text-xs flex items-center gap-1 mt-1 ${changeColor}`}>
            <i className="fas fa-arrow-up"></i>
            <span>{change}</span>
          </p>
        </div>
        <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} text-current`}></i>
        </div>
      </div>
    </div>
  );
}
