import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { reportGenerator } from "./services/reportGenerator";
import { scheduler } from "./services/scheduler";
import { learningEngine } from "./services/learningEngine";
import { 
  insertProjectSchema,
  insertReportSchema,
  insertIntegrationSchema,
  insertTeamMemberSchema,
  insertAutomationRuleSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start scheduler
  await scheduler.scheduleWeeklyReports();

  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(reportData);
      
      // Track user behavior
      await learningEngine.trackUserAction("user1", "create_report", {
        type: report.type,
        format: report.format
      });
      
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid report data" });
    }
  });

  app.post("/api/reports/generate", async (req, res) => {
    try {
      const report = await reportGenerator.generateWeeklyReport();
      
      // Track user behavior
      await learningEngine.trackUserAction("user1", "generate_report", {
        type: "weekly",
        trigger: "manual"
      });
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get("/api/reports/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id);
      
      if (!report || report.status !== 'completed') {
        return res.status(404).json({ message: "Report not found or not ready" });
      }

      // Track user behavior
      await learningEngine.trackUserAction("user1", "download_report", {
        format: report.format,
        type: report.type
      });
      
      // In a real implementation, this would serve the actual file
      res.json({ 
        message: "Report download started",
        filePath: report.filePath,
        format: report.format
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  // Integrations
  app.get("/api/integrations", async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post("/api/integrations", async (req, res) => {
    try {
      const integrationData = insertIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration(integrationData);
      
      // Track user behavior
      await learningEngine.trackUserAction("user1", "add_integration", {
        type: integration.type
      });
      
      res.json(integration);
    } catch (error) {
      res.status(400).json({ message: "Invalid integration data" });
    }
  });

  app.put("/api/integrations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const integration = await storage.updateIntegration(id, updates);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      res.json(integration);
    } catch (error) {
      res.status(500).json({ message: "Failed to update integration" });
    }
  });

  // Team Members
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid team member data" });
    }
  });

  // Automation Rules
  app.get("/api/automation-rules", async (req, res) => {
    try {
      const rules = await storage.getAutomationRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch automation rules" });
    }
  });

  app.post("/api/automation-rules", async (req, res) => {
    try {
      const ruleData = insertAutomationRuleSchema.parse(req.body);
      const rule = await storage.createAutomationRule(ruleData);
      res.json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid automation rule data" });
    }
  });

  app.put("/api/automation-rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const rule = await storage.updateAutomationRule(id, updates);
      if (!rule) {
        return res.status(404).json({ message: "Automation rule not found" });
      }
      res.json(rule);
    } catch (error) {
      res.status(500).json({ message: "Failed to update automation rule" });
    }
  });

  // Metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // User Behavior Tracking
  app.post("/api/track", async (req, res) => {
    try {
      const { action, context } = req.body;
      await learningEngine.trackUserAction("user1", action, context);
      res.json({ message: "Behavior tracked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to track behavior" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
