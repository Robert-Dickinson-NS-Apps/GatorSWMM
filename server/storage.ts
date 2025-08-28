import { type User, type InsertUser, type SwmmSection, type InsertSwmmSection, type GlossaryTerm, type InsertGlossaryTerm, type UserProgress, type InsertUserProgress, type GameScenario, type InsertGameScenario, type GameProgress, type InsertGameProgress } from "@shared/schema";
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
  
  getGameScenarios(): Promise<GameScenario[]>;
  getGameScenario(id: string): Promise<GameScenario | undefined>;
  getGameScenariosByCategory(category: string): Promise<GameScenario[]>;
  
  getGameProgress(userId: string): Promise<GameProgress[]>;
  updateGameProgress(progress: InsertGameProgress): Promise<GameProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sections: Map<string, SwmmSection>;
  private glossaryTerms: Map<string, GlossaryTerm>;
  private userProgress: Map<string, UserProgress>;
  private gameScenarios: Map<string, GameScenario>;
  private gameProgress: Map<string, GameProgress>;

  constructor() {
    this.users = new Map();
    this.sections = new Map();
    this.glossaryTerms = new Map();
    this.userProgress = new Map();
    this.gameScenarios = new Map();
    this.gameProgress = new Map();
    
    // Initialize with SWMM5 content
    this.initializeSWMMContent();
    this.initializeGlossary();
    this.initializeGameScenarios();
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

  async getGameScenarios(): Promise<GameScenario[]> {
    return Array.from(this.gameScenarios.values()).sort((a, b) => a.order - b.order);
  }

  async getGameScenario(id: string): Promise<GameScenario | undefined> {
    return this.gameScenarios.get(id);
  }

  async getGameScenariosByCategory(category: string): Promise<GameScenario[]> {
    return Array.from(this.gameScenarios.values())
      .filter(scenario => scenario.category === category)
      .sort((a, b) => a.order - b.order);
  }

  async getGameProgress(userId: string): Promise<GameProgress[]> {
    return Array.from(this.gameProgress.values()).filter(p => p.userId === userId);
  }

  async updateGameProgress(insertProgress: InsertGameProgress): Promise<GameProgress> {
    const existing = Array.from(this.gameProgress.values()).find(p => 
      p.userId === insertProgress.userId && p.scenarioId === insertProgress.scenarioId
    );
    
    if (existing) {
      existing.score = insertProgress.score || 0;
      existing.completed = insertProgress.completed || false;
      existing.attempts = (existing.attempts || 0) + 1;
      existing.completedAt = insertProgress.completed ? new Date() : null;
      this.gameProgress.set(existing.id, existing);
      return existing;
    } else {
      const id = randomUUID();
      const progress: GameProgress = { 
        ...insertProgress, 
        id,
        userId: insertProgress.userId || null,
        scenarioId: insertProgress.scenarioId || null,
        score: insertProgress.score || 0,
        completed: insertProgress.completed || false,
        attempts: 1,
        completedAt: insertProgress.completed ? new Date() : null
      };
      this.gameProgress.set(id, progress);
      return progress;
    }
  }

  private initializeGameScenarios() {
    const scenarios = [
      {
        title: "Urban Runoff Basics",
        description: "Learn how rainfall creates runoff in urban areas and identify key factors affecting stormwater flow.",
        difficulty: "beginner",
        category: "hydrology",
        order: 1,
        scenario: {
          type: "multiple_choice",
          situation: "A 2-inch rainfall event occurs over a small urban watershed. The area has 60% impervious surfaces (roads, buildings, parking lots) and 40% pervious surfaces (parks, lawns).",
          question: "Which factor will have the GREATEST impact on the amount of surface runoff generated?",
          options: [
            {
              id: "a",
              text: "The percentage of impervious surfaces",
              correct: true,
              explanation: "Correct! Impervious surfaces prevent infiltration, causing most rainfall to become surface runoff. With 60% impervious coverage, a significant portion of the 2-inch rainfall will flow directly to storm drains."
            },
            {
              id: "b", 
              text: "The total rainfall amount",
              correct: false,
              explanation: "While rainfall amount is important, the surface type determines how much becomes runoff. Even heavy rain on pervious surfaces can infiltrate."
            },
            {
              id: "c",
              text: "The slope of the terrain", 
              correct: false,
              explanation: "Slope affects flow velocity and timing, but doesn't significantly change the total volume of runoff generated."
            },
            {
              id: "d",
              text: "The air temperature",
              correct: false,
              explanation: "Temperature has minimal direct effect on runoff generation during liquid precipitation events."
            }
          ],
          learningObjectives: [
            "Understand the relationship between surface types and runoff generation",
            "Identify the primary factors controlling urban stormwater volumes",
            "Recognize why impervious surfaces are critical in urban hydrology"
          ]
        }
      },
      {
        title: "Infiltration Process",
        description: "Understand how SWMM models water infiltration into soil and the factors that control this process.",
        difficulty: "intermediate", 
        category: "hydrology",
        order: 2,
        scenario: {
          type: "scenario_analysis",
          situation: "You're modeling a residential area with clay soil. Recent development increased impervious cover from 30% to 70%. A neighbor complains about increased flooding in their yard after storms.",
          question: "Using SWMM's infiltration modeling, explain why flooding increased and suggest two solutions.",
          correctAnswers: [
            "Reduced infiltration area due to more impervious surfaces",
            "Higher peak flows due to faster runoff from impervious areas", 
            "Less time for soil to absorb water",
            "Clay soil has low infiltration capacity"
          ],
          solutions: [
            "Install rain gardens or bioretention areas",
            "Use permeable pavement for driveways/walkways",
            "Add detention ponds to store excess runoff",
            "Implement green roofs to reduce runoff"
          ],
          learningObjectives: [
            "Apply SWMM infiltration concepts to real-world problems",
            "Understand the impact of development on hydrology",
            "Identify appropriate stormwater management solutions"
          ]
        }
      },
      {
        title: "Pipe Network Design",
        description: "Design a storm drain network to handle peak flows using SWMM's hydraulic routing capabilities.",
        difficulty: "advanced",
        category: "hydraulics", 
        order: 3,
        scenario: {
          type: "design_challenge",
          situation: "Design a pipe network for a 10-acre commercial development. Peak inflow is 15 CFS. You have 500 feet to the outfall with 8 feet of elevation drop.",
          parameters: {
            peakFlow: 15, // CFS
            distance: 500, // feet  
            elevationDrop: 8, // feet
            area: 10 // acres
          },
          question: "What minimum pipe diameter would you specify to convey this flow without surcharging?",
          hints: [
            "Use Manning's equation for pipe flow calculations",
            "Assume Manning's n = 0.013 for concrete pipes",
            "Consider velocity constraints (typically 3-15 ft/s)",
            "Account for entrance and exit losses"
          ],
          solution: {
            minDiameter: 18, // inches
            velocity: 4.2, // ft/s
            explanation: "An 18-inch diameter pipe provides adequate capacity with reasonable velocity. Smaller pipes would cause excessive velocity or surcharging."
          },
          learningObjectives: [
            "Apply Manning's equation for pipe sizing",
            "Understand hydraulic design constraints",
            "Use SWMM for pipe network analysis"
          ]
        }
      },
      {
        title: "LID Controls Implementation",
        description: "Master Low Impact Development controls in SWMM5 for sustainable stormwater management.",
        difficulty: "intermediate",
        category: "green infrastructure",
        order: 4,
        scenario: {
          type: "multiple_choice",
          situation: "A city wants to retrofit a parking lot with LID controls to reduce runoff volume by 30%. The lot is 2 acres with sandy soil (infiltration rate = 0.5 in/hr).",
          question: "Which LID control would be MOST effective for this application?",
          options: [
            {
              id: "a",
              text: "Permeable pavement with underdrain",
              correct: true,
              explanation: "Correct! Permeable pavement is ideal for parking lots, allowing infiltration while maintaining functionality. With sandy soil and underdrain, it can achieve significant volume reduction."
            },
            {
              id: "b",
              text: "Bioretention cell",
              correct: false,
              explanation: "While effective, bioretention cells require dedicated space that may not be available in a parking lot retrofit."
            },
            {
              id: "c",
              text: "Green roof",
              correct: false,
              explanation: "Green roofs are for building tops, not parking lots."
            },
            {
              id: "d",
              text: "Infiltration trench",
              correct: false,
              explanation: "Trenches work well but require significant space and may interfere with parking operations."
            }
          ],
          learningObjectives: [
            "Select appropriate LID controls for specific applications",
            "Understand LID performance in different soil conditions",
            "Apply SWMM5 LID modeling capabilities"
          ]
        }
      },
      {
        title: "St. Venant Equations",
        description: "Understand how SWMM5 uses the St. Venant equations for dynamic wave routing in conduits.",
        difficulty: "advanced",
        category: "hydraulics",
        order: 5,
        scenario: {
          type: "scenario_analysis",
          situation: "SWMM5 uses the St. Venant equations for dynamic wave routing to model unsteady flow in conduits. These equations solve for both momentum and continuity.",
          question: "Explain when you would choose Dynamic Wave routing over Kinematic Wave routing in SWMM5, and what hydraulic phenomena can only be captured with the St. Venant equations.",
          correctAnswers: ["backwater", "reverse flow", "pressurization", "surcharging", "momentum", "acceleration"],
          hints: [
            "Consider flow conditions where momentum effects are important",
            "Think about situations with varying downstream conditions",
            "Consider when pipes may flow under pressure"
          ],
          solution: "Dynamic Wave routing using St. Venant equations should be used when: (1) Backwater effects are significant due to downstream restrictions, (2) Reverse flow may occur, (3) Conduits may become pressurized or surcharged, (4) Momentum and acceleration terms are important for accurate timing, (5) Complex hydraulic phenomena like hydraulic jumps need to be modeled. Kinematic Wave assumes uniform flow and cannot capture these effects.",
          learningObjectives: [
            "Understand the physics behind St. Venant equations",
            "Choose appropriate routing methods in SWMM5",
            "Recognize when momentum effects are important"
          ]
        }
      },
      {
        title: "Storage Node Design",
        description: "Design detention basins and storage facilities using SWMM5 storage nodes for flood control.",
        difficulty: "intermediate",
        category: "hydraulics",
        order: 6,
        scenario: {
          type: "design_challenge",
          situation: "Design a detention basin to reduce peak outflow from 45 CFS to 15 CFS for a 25-year storm. The basin has a fixed orifice outlet.",
          parameters: {
            peakInflow: 45, // CFS
            targetOutflow: 15, // CFS
            stormDuration: 6, // hours
            requiredVolume: 3.2 // acre-feet
          },
          question: "What orifice diameter would you specify to achieve the target peak outflow of 15 CFS?",
          hints: [
            "Use orifice equation Q = Cd × A × sqrt(2gh)",
            "Assume Cd = 0.6 for a sharp-edged orifice",
            "Estimate head based on storage-discharge relationship",
            "Consider that head varies as storage fills and empties"
          ],
          solution: {
            orificeDiameter: 12, // inches
            estimatedHead: 8, // feet
            explanation: "A 12-inch orifice with approximately 8 feet of head will discharge about 15 CFS. The actual performance depends on the storage curve and routing through the storm event."
          },
          learningObjectives: [
            "Design storage facilities using SWMM5",
            "Apply hydraulic principles to outlet structures",
            "Understand storage-indication routing"
          ]
        }
      },
      {
        title: "Link Exfiltration Modeling",
        description: "Model groundwater interaction and pipe exfiltration losses in aging urban infrastructure.",
        difficulty: "advanced",
        category: "hydrology",
        order: 7,
        scenario: {
          type: "multiple_choice",
          situation: "An old concrete sewer system has significant exfiltration losses. The 48-inch diameter pipes are 50 years old with joint deterioration. Groundwater table is 5 feet below the pipe invert.",
          question: "How should exfiltration be modeled in SWMM5 for this aging infrastructure?",
          options: [
            {
              id: "a",
              text: "Use constant exfiltration rate based on pipe condition",
              correct: false,
              explanation: "Constant rates don't account for varying hydraulic conditions and water table interactions."
            },
            {
              id: "b",
              text: "Model as head-dependent exfiltration with appropriate loss coefficient",
              correct: true,
              explanation: "Correct! Head-dependent exfiltration accounts for varying hydraulic head and groundwater conditions. The loss rate varies with the difference between pipe flow depth and groundwater elevation."
            },
            {
              id: "c",
              text: "Ignore exfiltration since pipes are below groundwater",
              correct: false,
              explanation: "Even with high groundwater, exfiltration can occur when pipe flow depth exceeds groundwater elevation."
            },
            {
              id: "d",
              text: "Use infiltration/inflow instead of exfiltration",
              correct: false,
              explanation: "The question specifically asks about exfiltration (water leaving the system), not I/I (water entering the system)."
            }
          ],
          learningObjectives: [
            "Understand exfiltration modeling in SWMM5",
            "Apply appropriate loss coefficients for aging infrastructure",
            "Consider groundwater interactions in sewer modeling"
          ]
        }
      }
    ];

    scenarios.forEach(scenario => {
      const id = randomUUID();
      const gameScenario: GameScenario = { 
        id,
        title: scenario.title,
        description: scenario.description,
        scenario: scenario.scenario,
        difficulty: scenario.difficulty,
        category: scenario.category,
        order: scenario.order
      };
      this.gameScenarios.set(id, gameScenario);
    });
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
