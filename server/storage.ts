import { type User, type InsertUser, type SwmmSection, type InsertSwmmSection, type GlossaryTerm, type InsertGlossaryTerm, type UserProgress, type InsertUserProgress } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getSections(): Promise<SwmmSection[]>;
  getSection(slug: string): Promise<SwmmSection | undefined>;
  createSection(section: InsertSwmmSection): Promise<SwmmSection>;
  
  getGlossaryTerms(): Promise<GlossaryTerm[]>;
  getGlossaryTerm(term: string): Promise<GlossaryTerm | undefined>;
  createGlossaryTerm(term: InsertGlossaryTerm): Promise<GlossaryTerm>;
  
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sections: Map<string, SwmmSection>;
  private glossaryTerms: Map<string, GlossaryTerm>;
  private userProgress: Map<string, UserProgress>;

  constructor() {
    this.users = new Map();
    this.sections = new Map();
    this.glossaryTerms = new Map();
    this.userProgress = new Map();
    
    // Initialize with SWMM5 content
    this.initializeSWMMContent();
    this.initializeGlossary();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSections(): Promise<SwmmSection[]> {
    return Array.from(this.sections.values()).sort((a, b) => a.order - b.order);
  }

  async getSection(slug: string): Promise<SwmmSection | undefined> {
    return Array.from(this.sections.values()).find(section => section.slug === slug);
  }

  async createSection(insertSection: InsertSwmmSection): Promise<SwmmSection> {
    const id = randomUUID();
    const section: SwmmSection = { 
      ...insertSection, 
      id,
      createdAt: new Date(),
      isCompleted: false 
    };
    this.sections.set(id, section);
    return section;
  }

  async getGlossaryTerms(): Promise<GlossaryTerm[]> {
    return Array.from(this.glossaryTerms.values());
  }

  async getGlossaryTerm(term: string): Promise<GlossaryTerm | undefined> {
    return Array.from(this.glossaryTerms.values()).find(t => t.term.toLowerCase() === term.toLowerCase());
  }

  async createGlossaryTerm(insertTerm: InsertGlossaryTerm): Promise<GlossaryTerm> {
    const id = randomUUID();
    const term: GlossaryTerm = { ...insertTerm, id };
    this.glossaryTerms.set(id, term);
    return term;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(p => p.userId === userId);
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const existingKey = `${insertProgress.userId}-${insertProgress.sectionId}`;
    const existing = Array.from(this.userProgress.values()).find(p => 
      p.userId === insertProgress.userId && p.sectionId === insertProgress.sectionId
    );
    
    if (existing) {
      existing.completed = insertProgress.completed || false;
      existing.completedAt = insertProgress.completed ? new Date() : null;
      this.userProgress.set(existing.id, existing);
      return existing;
    } else {
      const id = randomUUID();
      const progress: UserProgress = { 
        ...insertProgress, 
        id,
        completedAt: insertProgress.completed ? new Date() : null
      };
      this.userProgress.set(id, progress);
      return progress;
    }
  }

  private initializeSWMMContent() {
    const sections = [
      {
        title: "Overview",
        slug: "overview",
        order: 1,
        content: {
          type: "overview",
          description: "EPA's Storm Water Management Model (SWMM) is used throughout the world for planning, analysis and design related to stormwater runoff, combined and sanitary sewers, and other drainage systems in urban areas.",
          keyPoints: [
            "Dynamic rainfall-runoff simulation model",
            "Used worldwide for urban drainage analysis", 
            "Models both water quantity and quality",
            "Open source and public domain software"
          ],
          characteristics: [
            {
              icon: "fas fa-water",
              title: "Dynamic Simulation",
              description: "Models rainfall-runoff processes over time"
            },
            {
              icon: "fas fa-city", 
              title: "Urban Focus",
              description: "Specialized for urban and suburban areas"
            },
            {
              icon: "fas fa-chart-line",
              title: "Quality & Quantity", 
              description: "Models both water flow and pollutant transport"
            },
            {
              icon: "fas fa-code",
              title: "Open Source",
              description: "Public domain software, freely available"
            }
          ]
        }
      },
      {
        title: "Program Description", 
        slug: "program-description",
        order: 2,
        content: {
          type: "program_description",
          hydrologicProcesses: [
            "Time-varying rainfall",
            "Evaporation of standing water", 
            "Snow accumulation and melting",
            "Rainfall infiltration",
            "Groundwater percolation",
            "Low Impact Development (LID)"
          ],
          hydraulicCapabilities: [
            "Unlimited network size",
            "Various conduit shapes", 
            "Pumps, weirs, and orifices",
            "Dynamic wave routing",
            "Backwater and reverse flow",
            "Real-time control rules"
          ],
          applications: [
            {
              icon: "fas fa-shield-alt",
              title: "Flood Control", 
              description: "Design and sizing of drainage system components"
            },
            {
              icon: "fas fa-tint",
              title: "Water Quality",
              description: "Pollutant loading and BMP effectiveness"
            },
            {
              icon: "fas fa-map",
              title: "Flood Mapping",
              description: "Natural channel systems and flood plains"  
            },
            {
              icon: "fas fa-exclamation-triangle",
              title: "CSO/SSO Control",
              description: "Combined and sanitary sewer overflow strategies"
            },
            {
              icon: "fas fa-clipboard-list", 
              title: "Master Planning",
              description: "Sewer collection systems and urban watersheds"
            },
            {
              icon: "fas fa-balance-scale",
              title: "Regulatory Compliance", 
              description: "NPDES permits, CMOM, and TMDL analysis"
            }
          ]
        }
      },
      {
        title: "History & Development Timeline",
        slug: "history-timeline", 
        order: 3,
        content: {
          type: "timeline",
          timelineItems: [
            {
              year: "1969",
              title: "SWMM Version 1",
              description: "Original development (1969-1971) by University of Florida, CDM, and M&E",
              era: "Foundation Era",
              highlights: ["First urban runoff model"],
              color: "ufOrange"
            },
            {
              year: "1975", 
              title: "SWMM Version 2",
              description: "Major upgrade (1973-1975) by University of Florida",
              era: "Enhancement Era",
              highlights: ["Improved hydraulics"],
              color: "ufBlue"
            },
            {
              year: "1981",
              title: "SWMM Version 3", 
              description: "Comprehensive update (1979-1981) by University of Florida and CDM",
              era: "Expansion Era",
              highlights: ["Water quality modeling"],
              color: "ufOrange"
            },
            {
              year: "1988",
              title: "SWMM Version 4",
              description: "Fourth generation (1985-1988) by UF, OSU, and CDM", 
              era: "Modernization Era",
              highlights: ["Extended capabilities"],
              color: "ufBlue"
            },
            {
              year: "2004",
              title: "SWMM Version 5",
              description: "Complete rewrite (2001-2004) by EPA and CDM in C programming language",
              era: "Current Era", 
              highlights: ["GUI Interface", "Open Source", "Cross-platform"],
              color: "green"
            },
            {
              year: "2023",
              title: "SWMM Version 5.2.3 (Current)",
              description: "Latest stable release with enhanced LID controls and climate change tools",
              era: "Active Development",
              highlights: ["LID Enhanced", "Climate Ready", "FEMA Approved"],
              color: "ufOrange",
              current: true
            }
          ],
          statistics: [
            { value: "54+", label: "Years of Development" },
            { value: "5", label: "Major Versions" }, 
            { value: "Global", label: "Usage Worldwide" }
          ]
        }
      }
    ];

    sections.forEach(section => {
      const id = randomUUID();
      const swmmSection: SwmmSection = {
        id,
        title: section.title,
        slug: section.slug, 
        content: section.content,
        order: section.order,
        isCompleted: false,
        createdAt: new Date()
      };
      this.sections.set(id, swmmSection);
    });
  }

  private initializeGlossary() {
    const terms = [
      {
        term: "Storm Water Management Model (SWMM)",
        definition: "A dynamic rainfall-runoff-subsurface runoff simulation model for urban drainage systems",
        category: "General"
      },
      {
        term: "rainfall-runoff",
        definition: "The process by which water from precipitation flows over land surfaces to drainage systems",
        category: "Hydrology"
      },
      {
        term: "evaporation", 
        definition: "The process of water changing from liquid to vapor",
        category: "Hydrology"
      },
      {
        term: "infiltration",
        definition: "The process by which water on the ground surface enters the soil", 
        category: "Hydrology"
      },
      {
        term: "impervious",
        definition: "Surfaces that do not allow water to penetrate, like concrete and asphalt",
        category: "Surface Types"
      },
      {
        term: "pervious", 
        definition: "Surfaces that allow water to penetrate, like soil and grass",
        category: "Surface Types"
      },
      {
        term: "subcatchment",
        definition: "A subdivision of a watershed used in SWMM to represent homogeneous areas",
        category: "Model Components"
      },
      {
        term: "Low Impact Development (LID)",
        definition: "Stormwater management practices that reduce runoff through infiltration, evapotranspiration, and reuse",
        category: "Green Infrastructure"
      }
    ];

    terms.forEach(term => {
      const id = randomUUID();
      const glossaryTerm: GlossaryTerm = { ...term, id };
      this.glossaryTerms.set(id, glossaryTerm);
    });
  }
}

export const storage = new MemStorage();
