import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSectionSchema, insertGlossaryTermSchema, insertUserProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // SWMM Sections routes
  app.get("/api/sections", async (req, res) => {
    try {
      const sections = await storage.getSections();
      res.json(sections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.get("/api/sections/:slug", async (req, res) => {
    try {
      const section = await storage.getSection(req.params.slug);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(section);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch section" });
    }
  });

  app.post("/api/sections", async (req, res) => {
    try {
      const validatedData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(validatedData);
      res.status(201).json(section);
    } catch (error) {
      res.status(400).json({ message: "Invalid section data" });
    }
  });

  // Glossary routes
  app.get("/api/glossary", async (req, res) => {
    try {
      const terms = await storage.getGlossaryTerms();
      res.json(terms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch glossary terms" });
    }
  });

  app.get("/api/glossary/:term", async (req, res) => {
    try {
      const term = await storage.getGlossaryTerm(req.params.term);
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      res.json(term);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch term" });
    }
  });

  app.post("/api/glossary", async (req, res) => {
    try {
      const validatedData = insertGlossaryTermSchema.parse(req.body);
      const term = await storage.createGlossaryTerm(validatedData);
      res.status(201).json(term);
    } catch (error) {
      res.status(400).json({ message: "Invalid glossary term data" });
    }
  });

  // Progress tracking routes
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.updateUserProgress(validatedData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
