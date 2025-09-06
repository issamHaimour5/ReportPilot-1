import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Report } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const generateReportMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/reports/generate"),
    onSuccess: () => {
      toast({ title: "Report generation started", description: "Your weekly report is being generated." });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate report. Please try again.", variant: "destructive" });
    },
  });

  const handleDownloadReport = (reportId: string, format: string) => {
    // Track behavior and simulate download
    apiRequest("POST", "/api/track", { 
      action: "download_report", 
      context: { reportId, format } 
    });
    toast({ title: "Download started", description: "Your report download has begun." });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'fas fa-calendar-week';
      case 'sprint':
        return 'fas fa-running';
      case 'monthly':
        return 'fas fa-calendar-alt';
      default:
        return 'fas fa-file-alt';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">All Reports</h2>
          <p className="text-muted-foreground">View, download, and manage your generated reports</p>
        </div>
        <Button 
          onClick={() => generateReportMutation.mutate()}
          disabled={generateReportMutation.isPending}
          data-testid="button-generate-report"
        >
          {generateReportMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin w-4 h-4 mr-2"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="fas fa-plus w-4 h-4 mr-2"></i>
              Generate New Report
            </>
          )}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-alt text-2xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by generating your first automated report.
            </p>
            <Button 
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending}
              data-testid="button-generate-first-report"
            >
              Generate Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report: Report, index: number) => (
            <Card key={report.id} data-testid={`report-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <i className={`${getTypeIcon(report.type)} text-primary`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold" data-testid={`text-report-title-${index}`}>
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span data-testid={`text-report-type-${index}`}>
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                        </span>
                        <span data-testid={`text-report-format-${index}`}>
                          {report.format.toUpperCase()}
                        </span>
                        {report.generatedAt && (
                          <span data-testid={`text-report-date-${index}`}>
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={getStatusColor(report.status)}
                      data-testid={`badge-report-status-${index}`}
                    >
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                    
                    {report.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id, report.format)}
                        data-testid={`button-download-${index}`}
                      >
                        <i className="fas fa-download w-4 h-4 mr-2"></i>
                        Download
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-view-${index}`}
                    >
                      <i className="fas fa-eye w-4 h-4"></i>
                    </Button>
                  </div>
                </div>
                
                {report.metrics && typeof report.metrics === 'object' && Object.keys(report.metrics).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Projects:</span>
                        <span className="ml-1 font-medium" data-testid={`metric-projects-${index}`}>
                          {(report.metrics as any)?.totalProjects || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="ml-1 font-medium" data-testid={`metric-completed-${index}`}>
                          {(report.metrics as any)?.completedProjects || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completion Rate:</span>
                        <span className="ml-1 font-medium" data-testid={`metric-rate-${index}`}>
                          {Math.round((report.metrics as any)?.completionRate || 0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Team Members:</span>
                        <span className="ml-1 font-medium" data-testid={`metric-members-${index}`}>
                          {(report.metrics as any)?.teamMembers || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
