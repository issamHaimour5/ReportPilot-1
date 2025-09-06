interface ProgressChartProps {
  data: Array<{
    label: string;
    value: number;
    height: number;
  }>;
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="lg:col-span-2 bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Weekly Progress Trends</h3>
        <p className="text-sm text-muted-foreground">Task completion rates over the last 8 weeks</p>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-end justify-between gap-2" data-testid="chart-progress-bars">
          {data.map((week, index) => (
            <div key={week.label} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-b from-primary to-primary/80 rounded-t" 
                style={{ height: `${week.height}px` }}
                data-testid={`bar-week-${index + 1}`}
              />
              <span className="text-xs text-muted-foreground">{week.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
