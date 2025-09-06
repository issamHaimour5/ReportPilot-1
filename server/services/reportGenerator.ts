import { type Report, type Project } from "@shared/schema";
import { storage } from "../storage";

export class ReportGenerator {
  async generateReport(reportId: string): Promise<void> {
    const report = await storage.getReport(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    try {
      // Update status to generating
      await storage.updateReport(reportId, { status: "generating" });

      // Simulate report generation process
      await this.processReportData(report);

      // Update status to completed
      await storage.updateReport(reportId, { 
        status: "completed",
        filePath: `/reports/${reportId}.${report.format}`,
        generatedAt: new Date()
      });

    } catch (error) {
      await storage.updateReport(reportId, { status: "failed" });
      throw error;
    }
  }

  private async processReportData(report: Report): Promise<void> {
    // Simulate data processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get project data
    const projects = await storage.getProjects();
    const reportProjects = (report.projectIds && report.projectIds.length > 0) 
      ? projects.filter(p => report.projectIds?.includes(p.id))
      : projects;

    // Generate metrics
    const metrics = this.calculateMetrics(reportProjects);
    
    // Store metrics in report
    await storage.updateReport(report.id, { metrics });
  }

  private calculateMetrics(projects: Project[]): Record<string, any> {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    
    return {
      totalProjects,
      completedProjects,
      activeProjects,
      completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      teamMembers: projects.reduce((acc, p) => acc + (p.teamMembers?.length || 0), 0)
    };
  }

  async generateWeeklyReport(): Promise<Report> {
    const report = await storage.createReport({
      title: `Weekly Sprint Report - ${new Date().toLocaleDateString()}`,
      type: "weekly",
      status: "pending",
      format: "pdf",
      projectIds: [],
      metrics: {}
    });

    // Async generation
    setTimeout(() => this.generateReport(report.id), 1000);

    return report;
  }
}

export const reportGenerator = new ReportGenerator();
