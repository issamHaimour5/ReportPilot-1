import { 
  type Project, 
  type InsertProject,
  type Report,
  type InsertReport,
  type Integration,
  type InsertIntegration,
  type TeamMember,
  type InsertTeamMember,
  type AutomationRule,
  type InsertAutomationRule,
  type UserBehavior,
  type InsertUserBehavior
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Reports
  getReports(): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<Report>): Promise<Report | undefined>;
  deleteReport(id: string): Promise<boolean>;

  // Integrations
  getIntegrations(): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<Integration>): Promise<Integration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;

  // Team Members
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, member: Partial<TeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;

  // Automation Rules
  getAutomationRules(): Promise<AutomationRule[]>;
  getAutomationRule(id: string): Promise<AutomationRule | undefined>;
  createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule>;
  updateAutomationRule(id: string, rule: Partial<AutomationRule>): Promise<AutomationRule | undefined>;
  deleteAutomationRule(id: string): Promise<boolean>;

  // User Behavior
  getUserBehaviors(): Promise<UserBehavior[]>;
  createUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior>;
  getUserBehaviorsByAction(action: string): Promise<UserBehavior[]>;

  // Metrics
  getMetrics(): Promise<{
    reportsGenerated: number;
    activeProjects: number;
    completionRate: number;
    timeSaved: number;
  }>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project> = new Map();
  private reports: Map<string, Report> = new Map();
  private integrations: Map<string, Integration> = new Map();
  private teamMembers: Map<string, TeamMember> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private userBehaviors: Map<string, UserBehavior> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with some basic data for demo
    const teamMember1: TeamMember = {
      id: randomUUID(),
      name: "Sarah Mitchell",
      email: "sarah@example.com",
      initials: "SM",
      role: "Data Team Lead",
      projectIds: []
    };
    this.teamMembers.set(teamMember1.id, teamMember1);

    const integration1: Integration = {
      id: randomUUID(),
      name: "Trello",
      type: "trello",
      status: "active",
      apiKey: process.env.TRELLO_API_KEY || "",
      config: { boards: 3 },
      lastSync: new Date()
    };
    this.integrations.set(integration1.id, integration1);

    const rule1: AutomationRule = {
      id: randomUUID(),
      title: "Weekly Report Timing",
      description: "Learned that Sarah prefers reports on Monday mornings",
      type: "timing",
      condition: { day: "monday", time: "09:00" },
      action: { schedule: "weekly", notify: true },
      confidence: 94,
      applications: 12,
      isActive: true
    };
    this.automationRules.set(rule1.id, rule1);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id,
      metadata: insertProject.metadata || {},
      description: insertProject.description || null,
      status: insertProject.status || 'active',
      teamMembers: insertProject.teamMembers || []
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Reports
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = { 
      ...insertReport, 
      id,
      format: insertReport.format || 'pdf',
      status: insertReport.status || 'pending',
      projectIds: insertReport.projectIds || [],
      metrics: insertReport.metrics || {},
      filePath: insertReport.filePath || null,
      generatedAt: insertReport.status === 'completed' ? new Date() : null
    };
    this.reports.set(id, report);
    return report;
  }

  async updateReport(id: string, report: Partial<Report>): Promise<Report | undefined> {
    const existing = this.reports.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...report };
    if (updated.status === 'completed' && !updated.generatedAt) {
      updated.generatedAt = new Date();
    }
    this.reports.set(id, updated);
    return updated;
  }

  async deleteReport(id: string): Promise<boolean> {
    return this.reports.delete(id);
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    return Array.from(this.integrations.values());
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = randomUUID();
    const integration: Integration = { 
      ...insertIntegration, 
      id,
      status: insertIntegration.status || 'active',
      apiKey: insertIntegration.apiKey || null,
      config: insertIntegration.config || {},
      lastSync: null
    };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: string, integration: Partial<Integration>): Promise<Integration | undefined> {
    const existing = this.integrations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...integration };
    this.integrations.set(id, updated);
    return updated;
  }

  async deleteIntegration(id: string): Promise<boolean> {
    return this.integrations.delete(id);
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const member: TeamMember = { 
      ...insertMember, 
      id,
      projectIds: insertMember.projectIds || []
    };
    this.teamMembers.set(id, member);
    return member;
  }

  async updateTeamMember(id: string, member: Partial<TeamMember>): Promise<TeamMember | undefined> {
    const existing = this.teamMembers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...member };
    this.teamMembers.set(id, updated);
    return updated;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  // Automation Rules
  async getAutomationRules(): Promise<AutomationRule[]> {
    return Array.from(this.automationRules.values());
  }

  async getAutomationRule(id: string): Promise<AutomationRule | undefined> {
    return this.automationRules.get(id);
  }

  async createAutomationRule(insertRule: InsertAutomationRule): Promise<AutomationRule> {
    const id = randomUUID();
    const rule: AutomationRule = { 
      ...insertRule, 
      id,
      confidence: insertRule.confidence || 0,
      applications: insertRule.applications || 0,
      isActive: insertRule.isActive !== undefined ? insertRule.isActive : true
    };
    this.automationRules.set(id, rule);
    return rule;
  }

  async updateAutomationRule(id: string, rule: Partial<AutomationRule>): Promise<AutomationRule | undefined> {
    const existing = this.automationRules.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...rule };
    this.automationRules.set(id, updated);
    return updated;
  }

  async deleteAutomationRule(id: string): Promise<boolean> {
    return this.automationRules.delete(id);
  }

  // User Behavior
  async getUserBehaviors(): Promise<UserBehavior[]> {
    return Array.from(this.userBehaviors.values());
  }

  async createUserBehavior(insertBehavior: InsertUserBehavior): Promise<UserBehavior> {
    const id = randomUUID();
    const behavior: UserBehavior = { 
      ...insertBehavior, 
      id,
      context: insertBehavior.context || {},
      timestamp: new Date()
    };
    this.userBehaviors.set(id, behavior);
    return behavior;
  }

  async getUserBehaviorsByAction(action: string): Promise<UserBehavior[]> {
    return Array.from(this.userBehaviors.values()).filter(b => b.action === action);
  }

  // Metrics
  async getMetrics(): Promise<{
    reportsGenerated: number;
    activeProjects: number;
    completionRate: number;
    timeSaved: number;
  }> {
    const reports = await this.getReports();
    const projects = await this.getProjects();
    
    const completedReports = reports.filter(r => r.status === 'completed');
    const activeProjects = projects.filter(p => p.status === 'active');
    
    // Calculate completion rate based on project status
    const completedProjects = projects.filter(p => p.status === 'completed');
    const completionRate = projects.length > 0 ? 
      Math.round((completedProjects.length / projects.length) * 100) : 0;
    
    // Estimate time saved (5 hours per automated report)
    const timeSaved = completedReports.length * 5;

    return {
      reportsGenerated: completedReports.length,
      activeProjects: activeProjects.length,
      completionRate,
      timeSaved
    };
  }
}

export const storage = new MemStorage();
