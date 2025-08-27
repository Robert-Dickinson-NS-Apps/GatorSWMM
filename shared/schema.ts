import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const swmmSections = pgTable("swmm_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: json("content").notNull(),
  order: integer("order").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const glossaryTerms = pgTable("glossary_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  term: text("term").notNull().unique(),
  definition: text("definition").notNull(),
  category: text("category"),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sectionId: varchar("section_id").references(() => swmmSections.id),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSectionSchema = createInsertSchema(swmmSections).omit({
  id: true,
  createdAt: true,
});

export const insertGlossaryTermSchema = createInsertSchema(glossaryTerms).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  completedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SwmmSection = typeof swmmSections.$inferSelect;
export type InsertSwmmSection = z.infer<typeof insertSectionSchema>;
export type GlossaryTerm = typeof glossaryTerms.$inferSelect;
export type InsertGlossaryTerm = z.infer<typeof insertGlossaryTermSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
