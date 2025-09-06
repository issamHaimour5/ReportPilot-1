import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  source: text("source").notNull(), // 'trello', 'github', 'asana'
  sourceId: text("source_id").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'paused'
  teamMembers: text("team_members").array().default([]),
  metadata: jsonb("metadata").default({}),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'weekly', 'sprint', 'monthly'
  status: text("status").notNull().default("pending"), // 'pending', 'generating', 'completed', 'failed'
  format: text("format").notNull().default("pdf"), // 'pdf', 'html', 'email'
  projectIds: text("project_ids").array().default([]),
  metrics: jsonb("metrics").default({}),
  generatedAt: timestamp("generated_at"),
  filePath: text("file_path"),
});

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'trello', 'github', 'asana'
  status: text("status").notNull().default("active"), // 'active', 'syncing', 'error'
  apiKey: text("api_key"),
  config: jsonb("config").default({}),
  lastSync: timestamp("last_sync"),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  initials: text("initials").notNull(),
  role: text("role").notNull(),
  projectIds: text("project_ids").array().default([]),
});

export const automationRules = pgTable("automation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'timing', 'format', 'priority', 'metrics'
  condition: jsonb("condition").notNull(),
  action: jsonb("action").notNull(),
  confidence: integer("confidence").notNull().default(0), // 0-100
  applications: integer("applications").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const userBehavior = pgTable("user_behavior", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  context: jsonb("context").default({}),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  generatedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  lastSync: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
});

export const insertAutomationRuleSchema = createInsertSchema(automationRules).omit({
  id: true,
});

export const insertUserBehaviorSchema = createInsertSchema(userBehavior).omit({
  id: true,
  timestamp: true,
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = z.infer<typeof insertAutomationRuleSchema>;

export type UserBehavior = typeof userBehavior.$inferSelect;
export type InsertUserBehavior = z.infer<typeof insertUserBehaviorSchema>;
