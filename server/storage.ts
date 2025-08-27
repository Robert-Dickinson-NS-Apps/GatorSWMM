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
        userId: insertProgress.userId || null,
        sectionId: insertProgress.sectionId || null,
        completed: insertProgress.completed || false,
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
            {
              name: "Time-varying rainfall",
              description: "In SWMM5, time-varying rainfall is modeled using rain gage objects that supply precipitation data to subcatchment areas. Rainfall can be input as user-defined time series or from external files in various formats (e.g., user-prepared, NCDC, DSI-3240, HLY03, 15M03). The model assumes rainfall is constant over each time interval. Key parameters include time interval (e.g., 5-15 minutes for typical applications), units (intensity or volume), and station ID for file-based formats."
            },
            {
              name: "Evaporation of standing water",
              description: "SWMM5 models evaporation of standing surface water as part of hydrologic losses from subcatchment surfaces, groundwater aquifers, open channels, and storage units. Evaporation rates can be specified as constant values, monthly averages, time series, computed via the Hargreaves method from daily min/max temperatures, or from external climate files. These represent potential rates; actual evaporation is limited by available water."
            },
            {
              name: "Snow accumulation and melting",
              description: "SWMM5 simulates snow accumulation and melting using a temperature index method on subcatchment surfaces. Precipitation falls as snow if air temperature is below a dividing temperature. Snow accumulates until melting occurs when temperature rises. Melting is modeled with degree-day coefficients, considering factors like elevation bands, areal depletion curves, and plowing/transfer to snow packs."
            },
            {
              name: "Rainfall infiltration",
              description: "Rainfall infiltration in SWMM5 is modeled for pervious areas of subcatchments using methods like Horton, Modified Horton, Green-Ampt, Modified Green-Ampt, or Curve Number. It represents water soaking into unsaturated soil layers, reducing surface runoff. For Green-Ampt, it uses suction head, conductivity, and initial deficit. Horton uses max/min rates and decay constant."
            },
            {
              name: "Groundwater percolation",
              description: "Groundwater percolation in SWMM5 models the movement of infiltrated water from unsaturated to saturated soil zones (aquifers) beneath subcatchments. It uses parameters like porosity, field capacity, wilting point, hydraulic conductivity, and aquifer geometry. Percolation rate depends on upper zone moisture content. Groundwater can interact with drainage systems via lateral flow or deep percolation."
            },
            {
              name: "Low Impact Development (LID)",
              description: "LID in SWMM5 simulates green infrastructure practices to reduce runoff, such as bio-retention cells, rain gardens, green roofs, infiltration trenches, permeable pavement, rain barrels, and vegetative swales. Each LID type has layers (surface, soil, storage, pavement, drain) with parameters for storage depth, void ratio, conductivity, clogging, etc."
            }
          ],
          hydraulicCapabilities: [
            {
              name: "Unlimited network size",
              description: "SWMM5 supports modeling of drainage networks of unlimited size, with no fixed limit on the number of nodes, links, or other objects. This capability allows simulation of large, complex urban stormwater systems, combined sewers, or regional watersheds. Memory allocation is dynamic, constrained only by system resources."
            },
            {
              name: "Various conduit shapes",
              description: "SWMM5 allows a wide variety of closed and open conduit shapes, including circular, rectangular, trapezoidal, triangular, parabolic, power function, modified basket-handle, and user-defined custom shapes. Natural channels can be modeled with irregular cross-sections defined by station-elevation data."
            },
            {
              name: "Pumps, weirs, and orifices",
              description: "SWMM5 models control structures like pumps (ideal, types 1-4, variable speed), weirs (transverse, sidewall, v-notch, trapezoidal), and orifices (side/bottom discharge). Pumps use on/off depths or curves relating flow to wet well volume/head. Weirs and orifices follow standard hydraulic equations, with parameters like crest height, discharge coefficients, and flap gates for backflow prevention."
            },
            {
              name: "Dynamic wave routing",
              description: "Dynamic wave routing in SWMM5 solves the full Saint-Venant equations for unsteady flow in open channels and closed conduits, accounting for channel storage, backwater, entrance/exit losses, flow reversal, and pressurized flow. It uses an implicit finite difference scheme for accuracy in complex networks."
            },
            {
              name: "Backwater and reverse flow",
              description: "SWMM5's dynamic wave routing inherently handles backwater effects and reverse flow in conduits. Backwater occurs when downstream conditions restrict upstream flow, causing water levels to rise. Reverse flow is simulated when gradients allow flow against the defined direction. No special parameters are needed; it's part of the Saint-Venant solution."
            },
            {
              name: "Real-time control rules",
              description: "Real-time control (RTC) in SWMM5 uses user-defined rules to dynamically adjust settings of pumps, orifices, weirs, and outlets based on simulation time or conditions like depths, flows, or volumes at nodes/links. Rules consist of premises (if/then conditions) and actions, supporting logical operators and variables/expressions."
            }
          ],
          applications: [
            {
              icon: "fas fa-shield-alt",
              title: "Flood Control", 
              description: "Design and sizing of drainage system components",
              background: "SWMM5 supports flood control applications by enabling the design and sizing of drainage system components such as pipes, channels, pumps, detention storage, and low impact development (LID) controls. It simulates stormwater runoff under various rainfall scenarios to evaluate system capacity, identify flood-prone areas, and optimize infrastructure to mitigate flooding. Key features include dynamic wave routing for accurate backwater effects and real-time control rules for adaptive management."
            },
            {
              icon: "fas fa-tint",
              title: "Water Quality",
              description: "Pollutant loading and BMP effectiveness",
              background: "SWMM5 models water quality by tracking pollutant buildup, washoff, and transport in runoff from subcatchments through the drainage network. It supports multiple pollutants with parameters for land use-specific accumulation rates, washoff exponents, and treatment efficiencies. This allows assessment of stormwater impacts on receiving waters, aiding in pollution control strategies. Integration with LID and BMPs evaluates reductions in total suspended solids, nutrients, and other contaminants."
            },
            {
              icon: "fas fa-map",
              title: "Flood Mapping",
              description: "Natural channel systems and flood plains",
              background: "Flood mapping in SWMM5 involves simulating inundation in natural channel systems and floodplains by modeling overbank flow, storage, and routing. It uses cross-section data for irregular channels and links to GIS for spatial visualization. Simulations with extreme rainfall events generate flood extents, depths, and durations, aiding in hazard mapping and evacuation planning. Integration with 2D models like SWMM's linkage to other tools enhances accuracy for large-scale applications."
            },
            {
              icon: "fas fa-exclamation-triangle",
              title: "CSO/SSO Control",
              description: "Combined and sanitary sewer overflow strategies",
              background: "SWMM5 facilitates CSO/SSO control by modeling combined and sanitary sewer systems under wet weather conditions, evaluating inflow/infiltration effects. It simulates overflow volumes and frequencies, testing strategies like storage tunnels, pump upgrades, or real-time controls to minimize discharges. Regulatory drivers include reducing untreated sewage releases to comply with Clean Water Act requirements."
            },
            {
              icon: "fas fa-clipboard-list", 
              title: "Master Planning",
              description: "Sewer collection systems and urban watersheds",
              background: "Master planning with SWMM5 involves holistic modeling of sewer collection systems and urban watersheds for long-term infrastructure development. It integrates land use changes, population growth projections, and climate scenarios to forecast system demands, identify bottlenecks, and prioritize upgrades. Outputs guide capital improvement programs, ensuring sustainable urban drainage."
            },
            {
              icon: "fas fa-balance-scale",
              title: "Regulatory Compliance", 
              description: "NPDES permits, CMOM, and TMDL analysis",
              background: "SWMM5 aids regulatory compliance by simulating scenarios for NPDES permits, CMOM (Capacity, Management, Operation, and Maintenance) programs, and TMDL (Total Maximum Daily Load) analysis. It generates reports on stormwater discharges, pollutant loads, and system performance to meet EPA standards, supporting permit applications and monitoring plans."
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
              title: "SWMM Version 5.2.4 (Current)",
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
      const glossaryTerm: GlossaryTerm = { 
        id,
        term: term.term,
        definition: term.definition,
        category: term.category || null
      };
      this.glossaryTerms.set(id, glossaryTerm);
    });
  }
}

export const storage = new MemStorage();
