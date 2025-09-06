import { type TeamMember } from "@shared/schema";

interface TeamPerformanceProps {
  members: Array<{
    name: string;
    initials: string;
    completion: number;
    color: string;
  }>;
}

export function TeamPerformance({ members }: TeamPerformanceProps) {
  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Team Performance</h3>
        <p className="text-sm text-muted-foreground">Individual contributor metrics</p>
      </div>
      <div className="p-6 space-y-4">
        {members.map((member, index) => (
          <div key={member.name} className="flex items-center gap-3" data-testid={`member-${index}`}>
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium" data-testid={`text-member-initials-${index}`}>
                {member.initials}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" data-testid={`text-member-name-${index}`}>
                  {member.name}
                </span>
                <span className="text-xs text-muted-foreground" data-testid={`text-member-completion-${index}`}>
                  {member.completion}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${member.color}`}
                  style={{ width: `${member.completion}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
