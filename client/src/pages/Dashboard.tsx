import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { MetricsCard } from "@/components/MetricsCard";
import { ProgressChart } from "@/components/ProgressChart";
import { TeamPerformance } from "@/components/TeamPerformance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Report, Integration, AutomationRule } from "@shared/schema";

type Metrics = {
  reportsGenerated: number;
  activeProjects: number;
  completionRate: number;
  timeSaved: number;
};

export default function Dashboard() {
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  const { data: automationRules = [], isLoading: rulesLoading } = useQuery<AutomationRule[]>({
    queryKey: ["/api/automation-rules"],
  });

  const generateReportMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/reports/generate"),
    onSuccess: () => {
      toast({ title: "Report generation started", description: "Your weekly report is being generated." });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate report. Please try again.", variant: "destructive" });
    },
  });

  const trackBehaviorMutation = useMutation({
    mutationFn: (data: { action: string; context?: any }) => 
      apiRequest("POST", "/api/track", data),
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate();
    trackBehaviorMutation.mutate({ 
      action: "generate_report_manual", 
      context: { source: "dashboard" } 
    });
  };

  const handleDownloadReport = (reportId: string, format: string) => {
    trackBehaviorMutation.mutate({ 
      action: "download_report", 
      context: { reportId, format } 
    });
    // In a real app, this would trigger the actual download
    toast({ title: "Download started", description: "Your report download has begun." });
  };

  if (metricsLoading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  // Mock chart data
  const chartData = [
    { label: "W1", value: 75, height: 180 },
    { label: "W2", value: 60, height: 140 },
    { label: "W3", value: 85, height: 200 },
    { label: "W4", value: 70, height: 160 },
    { label: "W5", value: 80, height: 190 },
    { label: "W6", value: 92, height: 220 },
    { label: "W7", value: 78, height: 175 },
    { label: "W8", value: 88, height: 210 },
  ];

  const teamData = [
    { name: "Sarah Mitchell", initials: "SM", completion: 94, color: "bg-primary" },
    { name: "John Doe", initials: "JD", completion: 87, color: "bg-chart-2" },
    { name: "Anna Lee", initials: "AL", completion: 91, color: "bg-chart-3" },
    { name: "Mike Rodriguez", initials: "MR", completion: 78, color: "bg-chart-4" },
  ];

  const recentReports = reports.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Reports Generated"
          value={metrics?.reportsGenerated || 0}
          change="+12% from last week"
          icon="fas fa-chart-bar"
          iconColor="bg-primary/10 text-primary"
          changeColor="text-chart-2"
          testId="metric-reports"
        />
        <MetricsCard
          title="Active Projects"
          value={metrics?.activeProjects || 0}
          change="+3 new this month"
          icon="fas fa-project-diagram"
          iconColor="bg-chart-2/10 text-chart-2"
          changeColor="text-chart-3"
          testId="metric-projects"
        />
        <MetricsCard
          title="Completion Rate"
          value={`${metrics?.completionRate || 0}%`}
          change="+5% improvement"
          icon="fas fa-check-circle"
          iconColor="bg-chart-3/10 text-chart-3"
          changeColor="text-chart-2"
          testId="metric-completion"
        />
        <MetricsCard
          title="Time Saved"
          value={`${metrics?.timeSaved || 0}h`}
          change="This week"
          icon="fas fa-clock"
          iconColor="bg-chart-4/10 text-chart-4"
          changeColor="text-chart-2"
          testId="metric-time-saved"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProgressChart data={chartData} />
        <TeamPerformance members={teamData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reports</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-reports">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentReports.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No reports generated yet.</p>
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={generateReportMutation.isPending}
                    className="mt-2"
                    data-testid="button-generate-first-report"
                  >
                    {generateReportMutation.isPending ? "Generating..." : "Generate Your First Report"}
                  </Button>
                </div>
              ) : (
                recentReports.map((report: Report, index: number) => (
                  <div key={report.id} className="p-6 hover:bg-muted/50 transition-colors" data-testid={`report-${index}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <i className="fas fa-file-alt text-primary"></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium" data-testid={`text-report-title-${index}`}>
                            {report.title}
                          </h4>
                          <p className="text-xs text-muted-foreground" data-testid={`text-report-date-${index}`}>
                            {report.generatedAt ? 
                              `Generated ${new Date(report.generatedAt).toLocaleDateString()}` : 
                              "Being generated..."
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className={`px-2 py-1 text-xs font-medium rounded-md ${
                            report.status === 'completed' ? 'bg-chart-2/10 text-chart-2' :
                            report.status === 'generating' ? 'bg-chart-3/10 text-chart-3' :
                            'bg-muted text-muted-foreground'
                          }`}
                          data-testid={`status-report-${index}`}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={report.status !== 'completed'}
                          onClick={() => handleDownloadReport(report.id, report.format)}
                          data-testid={`button-download-report-${index}`}
                        >
                          <i className="fas fa-download w-3 h-3"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Integrations */}
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle>Active Integrations</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-manage-integrations">
                Manage
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {integrations.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <p>No integrations configured yet.</p>
                </div>
              ) : (
                integrations.map((integration: Integration, index: number) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg" data-testid={`integration-${index}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${
                        integration.type === 'trello' ? 'bg-primary' :
                        integration.type === 'github' ? 'bg-chart-3' :
                        'bg-chart-4'
                      } rounded-lg flex items-center justify-center`}>
                        <i className={`fab fa-${integration.type} text-white`}></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium" data-testid={`text-integration-name-${index}`}>
                          {integration.name}
                        </h4>
                        <p className="text-xs text-muted-foreground" data-testid={`text-integration-description-${index}`}>
                          {integration.type === 'trello' && `${(integration.config as any)?.boards || 0} boards connected`}
                          {integration.type === 'github' && `${(integration.config as any)?.repositories || 0} repositories tracked`}
                          {integration.type === 'asana' && `${(integration.config as any)?.projects || 0} projects monitored`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        integration.status === 'active' ? 'bg-chart-2' :
                        integration.status === 'syncing' ? 'bg-chart-3' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-xs text-muted-foreground" data-testid={`text-integration-status-${index}`}>
                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              
              <Button 
                variant="outline" 
                className="w-full border-dashed" 
                data-testid="button-add-integration"
              >
                <i className="fas fa-plus w-4 h-4 mr-2"></i>
                Add Integration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Automation Rules */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Smart Automation Rules</CardTitle>
              <p className="text-sm text-muted-foreground">AI-powered rules that adapt to your team's behavior</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-chart-2/10 text-chart-2 text-xs font-medium rounded-md">
                <i className="fas fa-brain mr-1"></i>
                Learning Active
              </span>
              <Button variant="ghost" size="sm" data-testid="button-configure-automation">
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automationRules.length === 0 ? (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                <p>No automation rules configured yet. The system will learn from your behavior and create smart rules automatically.</p>
              </div>
            ) : (
              automationRules.map((rule: AutomationRule, index: number) => (
                <div key={rule.id} className="p-4 bg-muted/30 rounded-lg" data-testid={`automation-rule-${index}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium mb-1" data-testid={`text-rule-title-${index}`}>
                        {rule.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2" data-testid={`text-rule-description-${index}`}>
                        {rule.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-chart-2" data-testid={`text-rule-confidence-${index}`}>
                          Confidence: {rule.confidence}%
                        </span>
                        <span className="text-muted-foreground" data-testid={`text-rule-applications-${index}`}>
                          Applied {rule.applications} times
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid={`button-edit-rule-${index}`}>
                      <i className="fas fa-edit w-3 h-3"></i>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
