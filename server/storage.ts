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
      },
      {
        title: "Dynamic Wave Routing Advanced Implementation",
        description: "Master the most sophisticated hydraulic routing method in SWMM for complex flow conditions.",
        difficulty: "expert",
        category: "hydraulics",
        order: 8,
        scenario: {
          type: "scenario_analysis",
          situation: "You're modeling a 2-mile trunk sewer system with multiple pump stations, complex storage tanks, and varying pipe slopes. The system experiences rapid flow transitions, backwater effects, and periodic surcharging during storm events.",
          question: "Analyze the numerical challenges of implementing dynamic wave routing for this system. Discuss the impact of the Courant-Friedrichs-Lewy (CFL) condition, grid convergence, and how SWMM handles the transition from free surface to pressurized flow. What calibration strategies would you use for friction factors and minor losses?",
          correctAnswers: ["cfl condition", "courant number", "grid convergence", "pressurized flow", "friction factors", "minor losses", "manning roughness", "time step"],
          hints: [
            "Consider numerical stability requirements for explicit schemes",
            "Think about spatial and temporal discretization effects",
            "Consider how SWMM5 switches between flow regimes",
            "Think about parameter sensitivity and calibration data needs"
          ],
          solution: "Key considerations: (1) CFL condition requires time steps ≤ 0.5×(Δx/V+c) where V is velocity and c is wave celerity, (2) Grid convergence testing ensures spatial discretization doesn't affect results, (3) SWMM uses slot model for pressurization maintaining Saint-Venant framework, (4) Friction calibration requires flow/depth measurements at multiple locations, (5) Minor losses (K-factors) significantly affect results in complex systems, (6) Sensitivity analysis identifies critical parameters, (7) Multi-event calibration captures different flow regimes.",
          learningObjectives: [
            "Master advanced numerical methods in SWMM",
            "Understand computational fluid dynamics principles",
            "Apply sophisticated calibration techniques"
          ]
        }
      },
      {
        title: "Water Quality Advanced Kinetics",
        description: "Master sophisticated pollutant fate and transport modeling with complex biochemical processes.",
        difficulty: "expert", 
        category: "water quality",
        order: 9,
        scenario: {
          type: "multiple_choice",
          situation: "You're modeling a combined sewer system where organic matter undergoes biochemical transformations. The model must account for BOD decay, nitrification, denitrification, and sediment-pollutant interactions during varying residence times.",
          question: "What is the MOST critical factor when modeling first-order decay kinetics for multiple interacting pollutants in SWMM?",
          options: [
            {
              id: "a",
              text: "Using constant decay rates for all environmental conditions",
              correct: false,
              explanation: "Constant rates ignore temperature, pH, and dissolved oxygen variations that significantly affect biochemical processes."
            },
            {
              id: "b", 
              text: "Temperature-dependent decay coefficients with proper stoichiometric relationships",
              correct: true,
              explanation: "Correct! Temperature correction (θ^(T-20)) and stoichiometric coupling between processes (BOD→DO consumption, NH3→NO3 conversion) are essential for accurate kinetics modeling."
            },
            {
              id: "c",
              text: "Ignoring biochemical interactions between pollutants",
              correct: false,
              explanation: "Pollutant interactions are fundamental - BOD consumes oxygen, affecting other processes like nitrification."
            },
            {
              id: "d",
              text: "Using only washoff coefficients without decay processes",
              correct: false,
              explanation: "This ignores in-system transformations that significantly alter pollutant concentrations during transport."
            }
          ],
          learningObjectives: [
            "Master biochemical kinetics in SWMM",
            "Understand temperature effects on pollutant fate",
            "Apply stoichiometric relationships in water quality modeling"
          ]
        }
      },
      {
        title: "Groundwater-Surface Water Interaction",
        description: "Model complex groundwater interactions with sophisticated aquifer representation in SWMM.",
        difficulty: "expert",
        category: "hydrology",
        order: 10,
        scenario: {
          type: "design_challenge", 
          situation: "Model a 200-hectare urban watershed with varying groundwater depths (2-15 feet), three distinct soil types, and seasonal water table fluctuations. The system includes both groundwater infiltration and exfiltration processes.",
          parameters: {
            area: 200, // hectares
            gw_depth_range: "2-15", // feet
            soil_types: 3,
            seasonal_variation: "6-foot annual fluctuation",
            climate: "humid subtropical"
          },
          question: "Design the groundwater component including aquifer parameters, moisture accounting, and calibration strategy. How would you handle the nonlinear relationship between groundwater depth and lateral flow?",
          hints: [
            "Consider groundwater flow equation parameters in SWMM",
            "Think about moisture accounting and evapotranspiration",
            "Consider seasonal calibration and validation approaches",
            "Account for urban impacts on natural groundwater flow"
          ],
          solution: {
            aquifer_params: {
              porosity: "0.25-0.45 by soil type",
              field_capacity: "0.15-0.35",
              conductivity: "0.1-50 in/hr",
              groundwater_flow_coeff: "0.001-0.1"
            },
            calibration_strategy: "Multi-season approach with water table monitoring",
            explanation: "Use SWMM's 3-layer groundwater model with soil-specific porosity (sandy: 0.45, clay: 0.25), field capacity, and conductivity. Calibrate groundwater flow coefficient using baseflow measurements. Account for seasonal ET variations and urban heat island effects. Validate against water table measurements at multiple monitoring wells."
          },
          learningObjectives: [
            "Master SWMM groundwater modeling capabilities",
            "Understand subsurface hydrology principles",
            "Apply groundwater calibration techniques"
          ]
        }
      },
      {
        title: "Advanced LID Performance Modeling",
        description: "Optimize complex LID treatment trains with detailed performance modeling and cost-effectiveness analysis.",
        difficulty: "expert",
        category: "green infrastructure",
        order: 11,
        scenario: {
          type: "scenario_analysis",
          situation: "You're designing a comprehensive LID treatment train for a 50-acre mixed-use development. The system includes bioretention cells, permeable pavement, green roofs, and constructed wetlands with varying soil conditions and maintenance requirements.",
          question: "Develop a comprehensive modeling approach for this LID treatment train including performance optimization, long-term degradation effects, and life-cycle cost analysis. How would you account for clogging, seasonal variations, and cumulative pollutant removal efficiency?",
          correctAnswers: ["treatment train", "clogging factors", "seasonal variation", "cumulative removal", "life cycle cost", "performance degradation", "maintenance scheduling"],
          hints: [
            "Consider LID performance reduction over time",
            "Think about series vs parallel treatment configurations",
            "Consider maintenance costs and effectiveness restoration",
            "Think about pollutant removal synergies and antagonisms"
          ],
          solution: "Modeling approach: (1) Configure treatment train with series connections for optimal pollutant removal, (2) Apply time-dependent clogging factors reducing infiltration rates (bioretention: 50% in 5 years, permeable pavement: 70% in 3 years), (3) Model seasonal performance variations with temperature-dependent biological processes, (4) Calculate cumulative removal efficiency accounting for pollutant interactions, (5) Include maintenance costs and performance restoration cycles, (6) Validate with long-term monitoring data and adjust parameters based on observed performance degradation, (7) Optimize configuration using benefit-cost analysis.",
          learningObjectives: [
            "Master advanced LID modeling in SWMM",
            "Understand long-term performance prediction", 
            "Apply life-cycle cost analysis to green infrastructure"
          ]
        }
      },
      {
        title: "Extreme Event Modeling and Uncertainty Analysis",
        description: "Model extreme precipitation events with comprehensive uncertainty quantification and risk assessment.",
        difficulty: "expert",
        category: "climate adaptation",
        order: 12,
        scenario: {
          type: "multiple_choice",
          situation: "Climate projections show 20% increase in rainfall intensity and 15% increase in total annual precipitation by 2050. Your SWMM model must evaluate system performance under deep uncertainty with multiple climate scenarios and parameter uncertainty.",
          question: "What is the MOST robust approach for uncertainty analysis in SWMM climate adaptation studies?",
          options: [
            {
              id: "a",
              text: "Use single climate projection with sensitivity analysis on key parameters",
              correct: false,
              explanation: "Single projections don't capture climate uncertainty and may lead to maladaptive decisions."
            },
            {
              id: "b",
              text: "Monte Carlo simulation with multiple climate models and parameter distributions",
              correct: true,
              explanation: "Correct! Monte Carlo approach with ensemble climate projections and probabilistic parameter distributions provides comprehensive uncertainty quantification for robust decision-making under deep uncertainty."
            },
            {
              id: "c", 
              text: "Deterministic analysis using worst-case climate scenario",
              correct: false,
              explanation: "Worst-case scenarios may lead to over-conservative and economically inefficient designs."
            },
            {
              id: "d",
              text: "Historical rainfall patterns adjusted by fixed climate factors",
              correct: false,
              explanation: "Simple scaling doesn't capture changes in rainfall patterns, storm structure, and extreme event frequencies."
            }
          ],
          learningObjectives: [
            "Master uncertainty quantification in SWMM",
            "Apply climate science to urban drainage modeling",
            "Understand robust decision-making frameworks"
          ]
        }
      },
      {
        title: "St. Venant Equations: ICM vs SWMM5 Implementation",
        description: "Compare the numerical implementation differences of St. Venant equations between InfoWorks ICM and SWMM5.",
        difficulty: "expert",
        category: "hydraulics",
        order: 13,
        scenario: {
          type: "scenario_analysis",
          situation: "You're modeling a 1200mm trunk sewer with significant backwater effects. The pipe operates under both free surface and pressurized conditions during storm events. You need to choose between ICM's Preissmann scheme and SWMM5's dynamic wave routing.",
          question: "Analyze the key differences between ICM's implementation of the St. Venant equations (Preissmann implicit scheme) versus SWMM5's dynamic wave approach. How do these differences affect computational stability, accuracy, and the ability to handle transitions between free surface and pressurized flow?",
          correctAnswers: ["preissmann scheme", "implicit", "explicit", "cfl condition", "pressure flow", "free surface", "slot model", "computational stability"],
          hints: [
            "Consider the time-stepping approach (implicit vs explicit)",
            "Think about how each software handles pressurization",
            "Consider computational efficiency and stability requirements",
            "Think about the treatment of momentum terms and friction"
          ],
          solution: "Key differences: (1) ICM uses Preissmann implicit finite difference scheme which allows larger time steps and better stability but requires matrix solutions, (2) SWMM5 uses explicit finite difference with CFL-limited time steps requiring smaller timesteps but simpler computations, (3) ICM handles pressurization through a slot model that maintains the 1D framework, (4) SWMM5 switches to a pressure flow algorithm when pipes surcharge, (5) ICM's implicit scheme better handles rapid flow transitions and reverse flow, (6) SWMM5's approach is more computationally efficient for large networks but may require very small time steps for stability.",
          learningObjectives: [
            "Understand numerical scheme differences in hydraulic modeling",
            "Compare implicit vs explicit finite difference approaches",
            "Analyze computational trade-offs in complex flow modeling"
          ]
        }
      },
      {
        title: "Advanced 2D Shallow Water Equations",
        description: "Master the implementation of 2D shallow water equations for urban flood modeling with complex boundary conditions.",
        difficulty: "expert",
        category: "2d modeling",
        order: 14,
        scenario: {
          type: "multiple_choice",
          situation: "You're modeling urban flooding using 2D shallow water equations. The domain includes buildings, roads with curbs, underground parking entrances, and variable terrain. The mesh has 50,000 elements with resolution from 0.5m to 5m.",
          question: "What is the MOST critical consideration for ensuring numerical stability and physical accuracy in this complex 2D flood model?",
          options: [
            {
              id: "a",
              text: "Using uniform Manning's roughness across the entire domain",
              correct: false,
              explanation: "Uniform roughness ignores the significant flow resistance variations between different urban surface types."
            },
            {
              id: "b",
              text: "Implementing proper treatment of wet-dry boundaries and building representation",
              correct: true,
              explanation: "Correct! Wet-dry boundary treatment prevents numerical instabilities at flood fronts, while proper building representation (as obstacles or high roughness zones) is crucial for accurate flow paths and depths."
            },
            {
              id: "c",
              text: "Using the smallest possible time step throughout the simulation",
              correct: false,
              explanation: "While small time steps improve stability, adaptive time stepping based on CFL condition is more efficient and equally stable."
            },
            {
              id: "d",
              text: "Applying no-slip boundary conditions at all solid boundaries",
              correct: false,
              explanation: "No-slip conditions are inappropriate for shallow water equations; slip conditions or wall functions are more suitable."
            }
          ],
          learningObjectives: [
            "Understand critical aspects of 2D flood modeling",
            "Master wet-dry boundary treatment techniques",
            "Apply appropriate boundary conditions for urban environments"
          ]
        }
      },
      {
        title: "2D Mesh Generation and Adaptive Refinement",
        description: "Design optimal mesh strategies for complex urban domains with adaptive refinement based on flow characteristics.",
        difficulty: "expert",
        category: "2d modeling",
        order: 15,
        scenario: {
          type: "design_challenge",
          situation: "Design a 2D mesh for a 10 km² urban watershed with diverse features: dense city center, suburban areas, major highways, river corridors, and industrial zones. Flow velocities range from 0.1 to 8 m/s.",
          parameters: {
            domain_area: 10, // km²
            velocity_range: "0.1-8", // m/s
            features: ["city center", "suburbs", "highways", "rivers", "industrial"],
            target_elements: 150000
          },
          question: "Specify your mesh refinement strategy including element size criteria, adaptive refinement triggers, and quality metrics to ensure computational efficiency while capturing critical flow physics.",
          hints: [
            "Consider Courant number requirements for stability",
            "Think about geometric features requiring fine resolution",
            "Consider flow gradients and velocity variations",
            "Balance computational cost with accuracy requirements"
          ],
          solution: {
            mesh_strategy: {
              city_center: "0.5-2m elements",
              highways: "1-3m elements", 
              rivers: "2-5m along channels",
              suburbs: "5-10m elements",
              refinement_criteria: "velocity gradient > 2 m/s/m, depth gradient > 0.5 m/m",
              quality_metric: "minimum angle > 25°, aspect ratio < 4"
            },
            explanation: "Use finest resolution (0.5-2m) in dense urban areas for building representation, medium resolution (1-3m) along highways for flow channeling, variable resolution (2-5m) in river corridors following channel geometry, coarser resolution (5-10m) in suburban areas, and adaptive refinement based on velocity/depth gradients exceeding thresholds. Maintain element quality with minimum angles >25° and aspect ratios <4."
          },
          learningObjectives: [
            "Design efficient mesh strategies for complex domains",
            "Apply adaptive refinement criteria based on flow physics",
            "Balance computational efficiency with modeling accuracy"
          ]
        }
      },
      {
        title: "2D-1D Coupling Advanced Techniques",
        description: "Implement sophisticated coupling between 2D surface models and 1D channel/sewer networks.",
        difficulty: "expert",
        category: "2d modeling",
        order: 16,
        scenario: {
          type: "scenario_analysis",
          situation: "You're modeling a complex urban system where surface flooding interacts with both river channels and sewer networks. The system includes 50 river cross-sections, 200 manholes, and 5 km² of 2D surface domain. Coupling occurs through weirs, orifices, and direct connections.",
          question: "Describe the numerical challenges and solution strategies for maintaining mass conservation and stability when coupling 2D shallow water equations with 1D river flow and 1D sewer hydraulics. Address time step synchronization, interface boundary conditions, and validation approaches.",
          correctAnswers: ["mass conservation", "interface boundary conditions", "time step synchronization", "energy continuity", "subcritical supercritical", "coupling algorithms", "validation"],
          hints: [
            "Consider different time stepping requirements between models",
            "Think about energy and momentum conservation at interfaces",
            "Consider flow regime transitions at coupling points",
            "Think about iterative solution algorithms for coupled systems"
          ],
          solution: "Key strategies include: (1) Implement mass-conservative coupling algorithms that ensure continuity equation satisfaction across all interfaces, (2) Use energy-based boundary conditions at 1D-2D interfaces to handle subcritical/supercritical transitions, (3) Apply adaptive time step synchronization where 2D domain may require smaller steps than 1D networks, (4) Use iterative coupling procedures within each time step to achieve convergence, (5) Validate through independent measurements at coupling points and overall watershed mass balance checks, (6) Implement specialized treatment for flow reversals and complex hydraulic structures, (7) Use sub-time stepping at interfaces during rapid flow changes.",
          learningObjectives: [
            "Master advanced coupling algorithms for integrated models",
            "Understand mass and energy conservation in coupled systems",
            "Apply validation techniques for complex integrated models"
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
      },
      {
        title: "Conceptual Model",
        slug: "conceptual-model",
        order: 4,
        content: {
          type: "conceptual_model",
          description: "SWMM5's conceptual model divides the urban drainage system into environmental compartments that interact through well-defined physical processes, enabling comprehensive simulation of the complete hydrologic and hydraulic cycle.",
          compartments: [
            {
              name: "Atmospheric Compartment",
              description: "Contains precipitation data and climatic conditions that drive the system",
              processes: ["Rainfall input", "Evaporation rates", "Temperature effects", "Wind patterns"]
            },
            {
              name: "Land Surface Compartment", 
              description: "Represents the watershed surface where rainfall becomes runoff",
              processes: ["Interception storage", "Depression storage", "Infiltration", "Surface runoff generation"]
            },
            {
              name: "Groundwater Compartment",
              description: "Models subsurface processes including aquifer interactions",
              processes: ["Groundwater flow", "Baseflow contribution", "Percolation", "Exfiltration"]
            },
            {
              name: "Transport System Compartment",
              description: "Represents the engineered drainage infrastructure",
              processes: ["Pipe flow", "Channel routing", "Storage detention", "Treatment processes"]
            }
          ],
          interactions: [
            {
              from: "Atmospheric",
              to: "Land Surface", 
              process: "Precipitation drives surface processes"
            },
            {
              from: "Land Surface",
              to: "Groundwater",
              process: "Infiltration recharges groundwater"
            },
            {
              from: "Land Surface", 
              to: "Transport System",
              process: "Surface runoff enters drainage network"
            },
            {
              from: "Groundwater",
              to: "Transport System", 
              process: "Baseflow and infiltration/inflow"
            }
          ],
          keyPrinciples: [
            "Mass conservation across all compartments",
            "Energy conservation in hydraulic routing",
            "Process-based parameter estimation",
            "Spatial and temporal discretization"
          ]
        }
      },
      {
        title: "LID Development", 
        slug: "lid-development",
        order: 5,
        content: {
          type: "lid_controls",
          description: "Low Impact Development (LID) controls in SWMM5 represent sustainable stormwater management practices that reduce runoff through infiltration, evapotranspiration, and reuse, mimicking natural hydrologic processes.",
          lidTypes: [
            {
              name: "Bioretention Cells",
              description: "Vegetated depressions that filter and infiltrate runoff",
              parameters: ["Surface area", "Soil depth", "Underdrain properties", "Plant characteristics"],
              applications: ["Parking lot islands", "Roadside swales", "Rain gardens"]
            },
            {
              name: "Infiltration Trenches",
              description: "Gravel-filled excavations that promote groundwater recharge", 
              parameters: ["Storage depth", "Void ratio", "Infiltration rate", "Clogging factors"],
              applications: ["Linear drainage", "Property boundaries", "Highway medians"]
            },
            {
              name: "Permeable Pavement",
              description: "Porous surfaces that allow water to infiltrate through the pavement structure",
              parameters: ["Pavement thickness", "Storage capacity", "Permeability", "Underdrain design"],
              applications: ["Parking areas", "Sidewalks", "Low-traffic roads"]
            },
            {
              name: "Green Roofs",
              description: "Vegetated building rooftops that retain and slowly release rainfall",
              parameters: ["Soil depth", "Drainage mat", "Plant selection", "Irrigation needs"],
              applications: ["Commercial buildings", "Residential structures", "Industrial facilities"]
            },
            {
              name: "Rain Barrels/Cisterns",
              description: "Storage containers that capture and reuse rooftop runoff",
              parameters: ["Storage volume", "Drain time", "Overflow handling", "Water quality"],
              applications: ["Residential properties", "Small commercial", "Irrigation systems"]
            }
          ],
          designConsiderations: [
            "Site soil conditions and infiltration rates",
            "Contributing drainage area and runoff coefficients", 
            "Groundwater depth and contamination concerns",
            "Maintenance requirements and access",
            "Integration with existing infrastructure",
            "Performance monitoring and adaptive management"
          ],
          modelingApproach: [
            "Define LID unit properties and placement",
            "Specify treatment train configurations",
            "Calibrate performance parameters",
            "Evaluate cost-effectiveness and co-benefits"
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
