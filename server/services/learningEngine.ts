import { type UserBehavior, type AutomationRule } from "@shared/schema";
import { storage } from "../storage";

export class LearningEngine {
  async analyzeUserBehavior(): Promise<void> {
    const behaviors = await storage.getUserBehaviors();
    const rules = await storage.getAutomationRules();

    // Analyze patterns in user behavior
    const patterns = this.detectPatterns(behaviors);
    
    // Update existing rules confidence levels
    for (const rule of rules) {
      const confidence = this.calculateConfidence(rule, patterns);
      if (confidence !== rule.confidence) {
        await storage.updateAutomationRule(rule.id, { confidence });
      }
    }

    // Generate new rules based on patterns
    const newRules = this.generateNewRules(patterns);
    for (const rule of newRules) {
      await storage.createAutomationRule(rule);
    }
  }

  private detectPatterns(behaviors: UserBehavior[]): Map<string, any> {
    const patterns = new Map();

    // Analyze report timing preferences
    const reportActions = behaviors.filter(b => b.action.includes('report'));
    if (reportActions.length > 0) {
      const timingPattern = this.analyzeTimingPattern(reportActions);
      patterns.set('timing', timingPattern);
    }

    // Analyze format preferences
    const formatActions = behaviors.filter(b => 
      b.context && typeof b.context === 'object' && 'format' in b.context
    );
    if (formatActions.length > 0) {
      const formatPattern = this.analyzeFormatPattern(formatActions);
      patterns.set('format', formatPattern);
    }

    return patterns;
  }

  private analyzeTimingPattern(actions: UserBehavior[]): any {
    const hourCounts = new Map<number, number>();
    const dayCounts = new Map<number, number>();

    actions.forEach(action => {
      const hour = action.timestamp.getHours();
      const day = action.timestamp.getDay();
      
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });

    // Find preferred hour and day
    const hourEntries = Array.from(hourCounts.entries());
    const dayEntries = Array.from(dayCounts.entries());
    const preferredHour = hourEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const preferredDay = dayEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return { preferredHour, preferredDay, confidence: actions.length * 10 };
  }

  private analyzeFormatPattern(actions: UserBehavior[]): any {
    const formatCounts = new Map<string, number>();

    actions.forEach(action => {
      if (action.context && typeof action.context === 'object' && 'format' in action.context) {
        const format = (action.context as any).format;
        formatCounts.set(format, (formatCounts.get(format) || 0) + 1);
      }
    });

    const formatEntries = Array.from(formatCounts.entries());
    const preferredFormat = formatEntries.reduce((a, b) => a[1] > b[1] ? a : b)?.[0] || 'pdf';
    return { preferredFormat, confidence: actions.length * 15 };
  }

  private calculateConfidence(rule: AutomationRule, patterns: Map<string, any>): number {
    const pattern = patterns.get(rule.type);
    if (!pattern) return rule.confidence;

    // Update confidence based on recent behavior
    const baseConfidence = rule.confidence;
    const patternConfidence = pattern.confidence || 0;
    
    // Weighted average with recent behavior having more influence
    return Math.min(100, Math.round((baseConfidence * 0.7) + (patternConfidence * 0.3)));
  }

  private generateNewRules(patterns: Map<string, any>): any[] {
    const newRules = [];

    // Generate timing rule if pattern is strong enough
    const timingPattern = patterns.get('timing');
    if (timingPattern && timingPattern.confidence > 50) {
      newRules.push({
        title: "Optimal Report Timing",
        description: `User prefers reports on ${this.getDayName(timingPattern.preferredDay)} at ${timingPattern.preferredHour}:00`,
        type: "timing",
        condition: { day: timingPattern.preferredDay, hour: timingPattern.preferredHour },
        action: { schedule: "auto", notify: true },
        confidence: Math.min(100, timingPattern.confidence),
        applications: 0,
        isActive: true
      });
    }

    // Generate format rule if pattern is strong enough
    const formatPattern = patterns.get('format');
    if (formatPattern && formatPattern.confidence > 50) {
      newRules.push({
        title: "Preferred Report Format",
        description: `User prefers ${formatPattern.preferredFormat.toUpperCase()} format for reports`,
        type: "format",
        condition: { reportType: "all" },
        action: { defaultFormat: formatPattern.preferredFormat },
        confidence: Math.min(100, formatPattern.confidence),
        applications: 0,
        isActive: true
      });
    }

    return newRules;
  }

  private getDayName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'Unknown';
  }

  async trackUserAction(userId: string, action: string, context: any = {}): Promise<void> {
    await storage.createUserBehavior({
      userId,
      action,
      context
    });

    // Trigger analysis periodically
    const behaviors = await storage.getUserBehaviors();
    if (behaviors.length % 10 === 0) { // Analyze every 10 actions
      await this.analyzeUserBehavior();
    }
  }
}

export const learningEngine = new LearningEngine();
