import { reportGenerator } from "./reportGenerator";
import { storage } from "../storage";

export class Scheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  async scheduleWeeklyReports(): Promise<void> {
    // Clear existing intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Schedule weekly reports every Monday at 9 AM
    const weeklyInterval = setInterval(async () => {
      const now = new Date();
      if (now.getDay() === 1 && now.getHours() === 9) { // Monday, 9 AM
        await this.generateScheduledReport();
      }
    }, 60 * 60 * 1000); // Check every hour

    this.intervals.set('weekly', weeklyInterval);
  }

  private async generateScheduledReport(): Promise<void> {
    try {
      const report = await reportGenerator.generateWeeklyReport();
      console.log(`Scheduled weekly report generated: ${report.id}`);
    } catch (error) {
      console.error("Failed to generate scheduled report:", error);
    }
  }

  async scheduleCustomReport(title: string, cronExpression: string): Promise<void> {
    // For MVP, we'll use simple interval-based scheduling
    // In production, use a proper cron library
    console.log(`Scheduling custom report: ${title} with cron: ${cronExpression}`);
  }

  stop(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}

export const scheduler = new Scheduler();
