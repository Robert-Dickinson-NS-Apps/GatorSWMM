import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useTheme } from "@/hooks/use-theme";
import { Search, Droplets, Waves, Mountain, Leaf, ChevronUp, ChevronDown, Play, CheckCircle, Circle, ExternalLink, Download, Gamepad2, Code } from "lucide-react";
import type { SwmmSection } from "@shared/schema";

const iconMap = { Droplets, Waves, Mountain, Leaf };

export default function Home() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview", "program-description", "history-timeline"]));
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set(["overview", "program-description"]));
  
  const { themeConfig } = useTheme();
  const ThemeIcon = iconMap[themeConfig.icon as keyof typeof iconMap] || Droplets;

  const { data: sections = [], isLoading } = useQuery<SwmmSection[]>({
    queryKey: ["/api/sections"],
  });

  const { data: glossaryTerms = [] } = useQuery({
    queryKey: ["/api/glossary"],
  });

  const toggleSection = (slug: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug);
    } else {
      newExpanded.add(slug);
    }
    setExpandedSections(newExpanded);
  };

  const toggleProcess = (processName: string) => {
    const newExpanded = new Set(expandedProcesses);
    if (newExpanded.has(processName)) {
      newExpanded.delete(processName);
    } else {
      newExpanded.add(processName);
    }
    setExpandedProcesses(newExpanded);
  };

  const markSectionCompleted = (slug: string) => {
    setCompletedSections(prev => new Set([...Array.from(prev), slug]));
  };

  const progressPercent = Math.round((completedSections.size / sections.length) * 100) || 25;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ufOrange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SWMM5 content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
                  <ThemeIcon className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold text-theme-secondary">SWMM5Wiki</h1>
              </div>
              <span className="text-sm text-muted-foreground">Interactive SWMM5 & ICM Urban Drainage Guide</span>
              
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <a href="https://www.linkedin.com/newsletters/7159940733972434944/" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="text-theme-secondary hover:bg-theme-light-primary">
                    <Circle className="w-4 h-4 mr-2" />
                    Learn
                  </Button>
                </a>
                <a href="https://boards.autodesk.com/icm" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="text-theme-secondary hover:bg-theme-light-primary">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    ICM Hub
                  </Button>
                </a>
                <Link href="/game">
                  <Button variant="ghost" size="sm" className="text-theme-secondary hover:bg-theme-light-secondary">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Play Game
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search SWMM5 content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:ring-2 focus:ring-ufOrange focus:border-transparent outline-none"
                  data-testid="search-input"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3" data-testid="progress-tracker">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <div className="w-20">
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <span className="text-sm font-medium text-theme-secondary">{progressPercent}%</span>
              </div>
              <ThemeSelector />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-80 bg-white border-r border-border h-screen overflow-y-auto sticky top-16" data-testid="sidebar">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-theme-secondary mb-4">Table of Contents</h2>
            
            {/* Progress Overview */}
            <div className="bg-ufLightBlue rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-theme-secondary">Learning Progress</span>
                <span className="text-xs text-theme-secondary">{completedSections.size} of {sections.length} sections</span>
              </div>
              <Progress value={progressPercent} className="h-2" data-testid="progress-bar" />
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2" data-testid="navigation-menu">
              {sections.map((section) => {
                const isCompleted = completedSections.has(section.slug);
                const isCurrent = section.slug === "history-timeline";
                
                return (
                  <div key={section.slug} className="nav-item">
                    <Button
                      variant="ghost"
                      className={`w-full justify-between p-3 h-auto ${
                        isCurrent 
                          ? "bg-theme-light-primary border border-theme-primary text-theme-primary" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        const element = document.getElementById(section.slug);
                        element?.scrollIntoView({ behavior: "smooth" });
                        if (!isCompleted) {
                          markSectionCompleted(section.slug);
                        }
                      }}
                      data-testid={`nav-item-${section.slug}`}
                    >
                      <div className="flex items-center space-x-2">
                        {isCurrent ? (
                          <Play className="w-4 h-4" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className="font-medium">{section.title}</span>
                      </div>
                      <ChevronUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                );
              })}
            </nav>

            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Links</h3>
              <div className="space-y-2">
                <a 
                  href="https://en.wikipedia.org/wiki/Storm_Water_Management_Model" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors"
                  data-testid="link-wikipedia"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Original Wikipedia Article</span>
                </a>
                <a 
                  href="https://www.epa.gov/water-research/storm-water-management-model-swmm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-theme-secondary hover:text-theme-primary transition-colors"
                  data-testid="link-epa"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>EPA Official Page</span>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-sm text-theme-secondary hover:text-theme-primary p-0 h-auto justify-start"
                  data-testid="button-download"
                >
                  <Download className="w-3 h-3" />
                  <span>Download SWMM 5.2.4</span>
                </Button>
              </div>
            </div>

            {/* Source Code Section */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
                <button
                  onClick={() => toggleProcess('source-code')}
                  className="w-full p-4 text-left hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  data-testid="source-code-section"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">View Source Code</h3>
                    </div>
                    {expandedProcesses.has('source-code') ? (
                      <ChevronUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Explore the React TypeScript codebase for this educational app
                  </p>
                </button>
                {expandedProcesses.has('source-code') && (
                  <div className="px-4 pb-4">
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded p-3 text-xs text-muted-foreground leading-relaxed border border-blue-300 dark:border-blue-700">
                      <div className="space-y-2">
                        <div>
                          <strong>Frontend:</strong> React 18 + TypeScript + Vite
                        </div>
                        <div>
                          <strong>Backend:</strong> Express.js + TypeScript
                        </div>
                        <div>
                          <strong>UI:</strong> Tailwind CSS + shadcn/ui components
                        </div>
                        <div>
                          <strong>Features:</strong> Interactive content, game system, theme switching
                        </div>
                        <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-700">
                          <a 
                            href="https://github.com/replit/replit" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Built on Replit Platform</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" data-testid="main-content">
          <div className="max-w-4xl mx-auto p-8">
            {/* Hero Section */}
            <div className="rounded-2xl p-8 mb-8 relative overflow-hidden bg-gradient-to-br from-theme-secondary to-blue-800" data-testid="hero-section" style={{background: `linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-primary) 100%)`}}>
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Storm Droplets for SWMM5</h1>
                  <p className="text-xl mb-6 max-w-2xl text-white/90 drop-shadow-md">
                    EPA's comprehensive dynamic rainfall-runoff simulation model used worldwide for urban drainage system analysis and design.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="outline" className="bg-black/20 border-white/30 text-white backdrop-blur-sm">
                      First Developed: 1969-1971
                    </Badge>
                    <Badge variant="outline" className="bg-black/20 border-white/30 text-white backdrop-blur-sm">
                      Current Version: 5.2.4
                    </Badge>
                    <Badge variant="outline" className="bg-black/20 border-white/30 text-white backdrop-blur-sm">
                      Global Usage
                    </Badge>
                  </div>
                </div>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/NapervilleSWMM5.png/960px-NapervilleSWMM5.png" 
                  alt="SWMM5 network diagram from Wikipedia showing urban drainage system modeling" 
                  className="rounded-xl shadow-lg w-64 h-48 object-contain bg-white/10 backdrop-blur-sm border border-white/20 hidden lg:block"
                />
              </div>
            </div>

            {/* Content Sections */}
            {sections.map((section) => (
              <Card 
                key={section.slug} 
                id={section.slug}
                className={`mb-6 ${
                  completedSections.has(section.slug) 
                    ? "bg-green-50 border-green-200" 
                    : section.slug === "history-timeline" 
                      ? "border-ufOrange" 
                      : "border-border"
                }`}
                data-testid={`section-${section.slug}`}
              >
                {/* Section Header */}
                <div className={`p-6 border-b border-border ${
                  section.slug === "history-timeline" ? "bg-theme-light-primary" : ""
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {section.slug === "history-timeline" ? (
                        <Play className="w-5 h-5 text-theme-primary" />
                      ) : completedSections.has(section.slug) ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                      <h2 className="text-2xl font-bold text-theme-secondary">{section.title}</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection(section.slug)}
                      className="text-theme-primary hover:text-theme-secondary"
                      data-testid={`toggle-${section.slug}`}
                    >
                      {expandedSections.has(section.slug) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Section Content */}
                {expandedSections.has(section.slug) && (
                  <div className="p-6">
                    {(section.content as any)?.type === "overview" && (
                      <div>
                        <p className="text-lg leading-relaxed mb-4">
                          The United States Environmental Protection Agency (EPA){" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-semibold text-ufBlue border-b border-dotted border-ufOrange cursor-help">
                                Storm Water Management Model (SWMM)
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>A dynamic rainfall-runoff-subsurface runoff simulation model for urban drainage systems</p>
                            </TooltipContent>
                          </Tooltip>{" "}
                          is a comprehensive tool used throughout the world for planning, analysis and design related to stormwater runoff, combined and sanitary sewers, and other drainage systems in urban areas.
                        </p>
                        
                        <div className="bg-ufLightBlue rounded-lg p-6 mb-6">
                          <h3 className="text-lg font-semibold text-theme-secondary mb-3">Key Characteristics</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {(section.content as any)?.characteristics?.map((char: any, index: number) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-theme-primary/10 flex items-center justify-center flex-shrink-0">
                                  <ThemeIcon className="w-4 h-4 text-theme-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{char.title}</h4>
                                  <p className="text-sm text-muted-foreground">{char.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <p className="leading-relaxed">
                          SWMM can simulate various hydrological processes including{" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="border-b border-dotted border-ufOrange cursor-help">
                                rainfall-runoff
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>The process by which water from precipitation flows over land surfaces to drainage systems</p>
                            </TooltipContent>
                          </Tooltip>,{" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="border-b border-dotted border-ufOrange cursor-help">
                                evaporation
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>The process of water changing from liquid to vapor</p>
                            </TooltipContent>
                          </Tooltip>,{" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="border-b border-dotted border-ufOrange cursor-help">
                                infiltration
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>The process by which water on the ground surface enters the soil</p>
                            </TooltipContent>
                          </Tooltip>, and groundwater interactions. 
                          The model operates on collections of subcatchment areas divided into{" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="border-b border-dotted border-ufOrange cursor-help">
                                impervious
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Surfaces that do not allow water to penetrate, like concrete and asphalt</p>
                            </TooltipContent>
                          </Tooltip> and{" "}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="border-b border-dotted border-ufOrange cursor-help">
                                pervious
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Surfaces that allow water to penetrate, like soil and grass</p>
                            </TooltipContent>
                          </Tooltip> areas.
                        </p>

                        {/* Enhanced SWMM5 Overview Graphics */}
                        <div className="mt-8 space-y-6">
                          {/* Water Cycle Visualization */}
                          <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Droplets className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-xl font-semibold text-theme-secondary">Urban Water Cycle Modeling</h4>
                            </div>
                            <div className="grid md:grid-cols-4 gap-4">
                              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Droplets className="w-6 h-6 text-blue-600" />
                                </div>
                                <h5 className="font-medium text-sm">Precipitation</h5>
                                <p className="text-xs text-muted-foreground mt-1">Rainfall & Snow</p>
                              </div>
                              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Mountain className="w-6 h-6 text-green-600" />
                                </div>
                                <h5 className="font-medium text-sm">Surface Runoff</h5>
                                <p className="text-xs text-muted-foreground mt-1">Urban Drainage</p>
                              </div>
                              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Waves className="w-6 h-6 text-orange-600" />
                                </div>
                                <h5 className="font-medium text-sm">Flow Routing</h5>
                                <p className="text-xs text-muted-foreground mt-1">Pipe Networks</p>
                              </div>
                              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Leaf className="w-6 h-6 text-purple-600" />
                                </div>
                                <h5 className="font-medium text-sm">Water Quality</h5>
                                <p className="text-xs text-muted-foreground mt-1">Pollutant Transport</p>
                              </div>
                            </div>
                          </div>

                          {/* SWMM5 Benefits */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg p-5 border border-green-200 dark:border-green-800">
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                  <Leaf className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="font-semibold text-green-800 dark:text-green-200">Environmental Benefits</h5>
                              </div>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Reduces urban flooding risks</li>
                                <li>• Improves water quality management</li>
                                <li>• Supports green infrastructure design</li>
                                <li>• Enables sustainable stormwater solutions</li>
                              </ul>
                            </div>
                            
                            <div className="bg-gradient-to-br from-theme-light-primary to-orange-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-5 border border-theme-primary/20">
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
                                  <Search className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="font-semibold text-theme-secondary">Engineering Applications</h5>
                              </div>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Urban drainage system design</li>
                                <li>• Combined sewer overflow analysis</li>
                                <li>• Best Management Practice evaluation</li>
                                <li>• Regulatory compliance modeling</li>
                              </ul>
                            </div>
                          </div>

                          {/* Additional SWMM5 Technical Details */}
                          <div className="mt-6 space-y-6">
                            {/* Model Components Visualization */}
                            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                  <Search className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-xl font-semibold text-theme-secondary">SWMM5 Model Components</h4>
                              </div>
                              <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                      <Mountain className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h5 className="font-semibold text-theme-secondary">Subcatchments</h5>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Surface areas that collect rainfall and generate runoff to the drainage system</p>
                                  <div className="mt-2 text-xs space-y-1">
                                    <div>• Impervious/Pervious areas</div>
                                    <div>• Depression storage</div>
                                    <div>• Infiltration parameters</div>
                                  </div>
                                </div>
                                
                                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                                      <Waves className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <h5 className="font-semibold text-theme-secondary">Conveyance Network</h5>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Pipes, channels, and conduits that transport runoff through the system</p>
                                  <div className="mt-2 text-xs space-y-1">
                                    <div>• Flow routing methods</div>
                                    <div>• Hydraulic controls</div>
                                    <div>• Backwater effects</div>
                                  </div>
                                </div>
                                
                                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                      <Leaf className="w-4 h-4 text-green-600" />
                                    </div>
                                    <h5 className="font-semibold text-theme-secondary">Treatment Units</h5>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Storage facilities and LID controls for flow management and water quality</p>
                                  <div className="mt-2 text-xs space-y-1">
                                    <div>• Detention ponds</div>
                                    <div>• Green infrastructure</div>
                                    <div>• Treatment devices</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* SWMM5 Analysis Capabilities */}
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-lg p-5 border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                    <Droplets className="w-4 h-4 text-white" />
                                  </div>
                                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200">Hydraulic Analysis</h5>
                                </div>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Steady and unsteady flow routing</li>
                                  <li>• Pressure flow and surcharging</li>
                                  <li>• Flow control structures</li>
                                  <li>• Real-time control operations</li>
                                  <li>• Pump and orifice modeling</li>
                                </ul>
                              </div>
                              
                              <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-lg p-5 border border-violet-200 dark:border-violet-800">
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                                    <Leaf className="w-4 h-4 text-white" />
                                  </div>
                                  <h5 className="font-semibold text-violet-800 dark:text-violet-200">Water Quality Modeling</h5>
                                </div>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Pollutant buildup and washoff</li>
                                  <li>• Treatment device efficiency</li>
                                  <li>• First flush effects</li>
                                  <li>• BMPs performance evaluation</li>
                                  <li>• Total Maximum Daily Loads (TMDL)</li>
                                </ul>
                              </div>
                            </div>

                            {/* Version 5.2.4 Features */}
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                                  <Download className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-xl font-semibold text-theme-secondary">Latest in SWMM5 v5.2.4</h4>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h6 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Enhanced Features</h6>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Improved LID modeling capabilities</li>
                                    <li>• Enhanced real-time control</li>
                                    <li>• Better groundwater interactions</li>
                                    <li>• Advanced reporting options</li>
                                  </ul>
                                </div>
                                <div>
                                  <h6 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Performance Improvements</h6>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Faster computation speeds</li>
                                    <li>• Reduced memory usage</li>
                                    <li>• Better numerical stability</li>
                                    <li>• Enhanced error checking</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(section.content as any)?.type === "program_description" && (
                      <div>
                        <div className="grid lg:grid-cols-2 gap-8 mb-8">
                          <div>
                            <h3 className="text-lg font-semibold text-theme-secondary mb-4">Hydrologic Processes</h3>
                            <div className="space-y-3">
                              {(section.content as any)?.hydrologicProcesses?.map((process: any, index: number) => (
                                <div key={index} className="bg-theme-light-secondary rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => toggleProcess(`hydro-${index}`)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-theme-light-secondary/80 transition-colors text-left"
                                    data-testid={`process-${process.name?.replace(/\s+/g, '-').toLowerCase()}`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <ThemeIcon className="w-4 h-4 text-theme-primary" />
                                      <span className="font-medium">{process.name}</span>
                                    </div>
                                    {expandedProcesses.has(`hydro-${index}`) ? (
                                      <ChevronUp className="w-4 h-4 text-theme-primary" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-theme-primary" />
                                    )}
                                  </button>
                                  {expandedProcesses.has(`hydro-${index}`) && (
                                    <div className="px-3 pb-3">
                                      <div className="bg-white/50 dark:bg-gray-800/50 rounded p-3 text-sm text-muted-foreground leading-relaxed">
                                        {process.description}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-theme-secondary mb-4">Hydraulic Capabilities</h3>
                            <div className="space-y-3">
                              {(section.content as any)?.hydraulicCapabilities?.map((capability: any, index: number) => (
                                <div key={index} className="bg-theme-light-primary rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => toggleProcess(`hydraulic-${index}`)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-theme-light-primary/80 transition-colors text-left"
                                    data-testid={`capability-${capability.name?.replace(/\s+/g, '-').toLowerCase()}`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <ThemeIcon className="w-4 h-4 text-theme-secondary" />
                                      <span className="font-medium">{capability.name}</span>
                                    </div>
                                    {expandedProcesses.has(`hydraulic-${index}`) ? (
                                      <ChevronUp className="w-4 h-4 text-theme-secondary" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-theme-secondary" />
                                    )}
                                  </button>
                                  {expandedProcesses.has(`hydraulic-${index}`) && (
                                    <div className="px-3 pb-3">
                                      <div className="bg-white/50 dark:bg-gray-800/50 rounded p-3 text-sm text-muted-foreground leading-relaxed">
                                        {capability.description}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-theme-secondary mb-4">Typical Applications</h3>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(section.content as any)?.applications?.map((app: any, index: number) => (
                              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                                <button
                                  onClick={() => toggleProcess(`application-${index}`)}
                                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  data-testid={`application-${app.title?.replace(/\s+/g, '-').toLowerCase()}`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <ThemeIcon className="w-4 h-4 text-theme-primary" />
                                      <h4 className="font-medium">{app.title}</h4>
                                    </div>
                                    {expandedProcesses.has(`application-${index}`) ? (
                                      <ChevronUp className="w-4 h-4 text-theme-primary" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-theme-primary" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{app.description}</p>
                                </button>
                                {expandedProcesses.has(`application-${index}`) && (
                                  <div className="px-4 pb-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded p-3 text-sm text-muted-foreground leading-relaxed border border-blue-200 dark:border-blue-800">
                                      {app.background}
                                    </div>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Enhanced SWMM5 Information Section */}
                        <div className="mt-8 space-y-6">
                          {/* SWMM5 Core Features */}
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-10 h-10 bg-theme-primary rounded-full flex items-center justify-center">
                                <Waves className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-xl font-semibold text-theme-secondary">SWMM5 v5.2.4 - Advanced Stormwater Modeling</h4>
                            </div>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                              The Storm Water Management Model (SWMM5) is a dynamic rainfall-runoff simulation model used worldwide for planning, 
                              analysis and design of stormwater management systems in urban areas. This comprehensive tool helps engineers and 
                              planners design effective drainage systems and assess water quality impacts.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 mt-4">
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                  <Droplets className="w-3 h-3 text-blue-600" />
                                </div>
                                <span>Rainfall-Runoff Analysis</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                                  <Mountain className="w-3 h-3 text-green-600" />
                                </div>
                                <span>Urban Hydrology</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center">
                                  <Leaf className="w-3 h-3 text-purple-600" />
                                </div>
                                <span>Water Quality Modeling</span>
                              </div>
                            </div>
                          </div>

                          {/* Technical Capabilities */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-theme-light-primary to-orange-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-5 border border-theme-primary/20">
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
                                  <Search className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="font-semibold text-theme-secondary">Hydrodynamic Routing</h5>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                SWMM5 uses sophisticated algorithms to route flows through pipe networks, 
                                accounting for backwater effects, surcharging, and pressure flow conditions.
                              </p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-theme-light-secondary to-blue-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-5 border border-theme-secondary/20">
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="w-8 h-8 bg-theme-secondary rounded-lg flex items-center justify-center">
                                  <Waves className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="font-semibold text-theme-primary">LID Controls</h5>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Comprehensive Low Impact Development (LID) modeling including rain gardens, 
                                permeable pavement, and green infrastructure practices.
                              </p>
                            </div>
                          </div>

                          {/* Usage Statistics */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800 overflow-hidden">
                            <button
                              onClick={() => toggleProcess('global-impact')}
                              className="w-full p-6 text-center hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                              data-testid="global-impact-section"
                            >
                              <div className="flex items-center justify-center space-x-2 mb-3">
                                <Leaf className="w-6 h-6 text-green-600" />
                                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">Global Impact</h4>
                                {expandedProcesses.has('global-impact') ? (
                                  <ChevronUp className="w-4 h-4 text-green-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                                SWMM5 is used by thousands of engineers worldwide for stormwater management, 
                                helping cities reduce flooding risks and improve water quality in urban watersheds.
                              </p>
                            </button>
                            {expandedProcesses.has('global-impact') && (
                              <div className="px-6 pb-6">
                                <div className="bg-white/70 dark:bg-gray-800/70 rounded p-4 text-sm text-muted-foreground leading-relaxed border border-green-300 dark:border-green-700">
                                  SWMM5 is used by thousands of engineers worldwide for stormwater management, helping cities reduce flooding risks and improve water quality in urban watersheds. According to Google Scholar, a search for 'SWMM' returns about 56,700 results, the SWMM5 User's Manual by L.A. Rossman (2010) has been cited over 2,000 times, and the SWMM4 User's Manual by W.C. Huber and R.E. Dickinson (1988) has been cited 839 times, demonstrating its significant influence in the field of stormwater modeling and research.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(section.content as any)?.type === "timeline" && (
                      <div data-testid="timeline-component">
                        <p className="text-lg leading-relaxed mb-8 text-center">
                          SWMM has evolved over more than 50 years, with four major upgrades transforming it into today's comprehensive modeling platform.
                        </p>
                        
                        
                        <div className="relative min-h-[800px]">
                          {/* Timeline Line */}
                          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-orange-500"></div>
                          
                          {/* Timeline Items */}
                          <div className="space-y-8 relative z-10">
                            {(section.content as any)?.timelineItems?.map((item: any, index: number) => {
                              const colorClass = item.color === "ufOrange" ? "bg-orange-500" : 
                                                item.color === "ufBlue" ? "bg-blue-600" :
                                                item.color === "green" ? "bg-green-500" : "bg-orange-500";
                              
                              const cardClass = item.color === "ufOrange" ? "bg-ufLightOrange" :
                                               item.color === "ufBlue" ? "bg-blue-50" :
                                               item.color === "green" ? "bg-green-50" : "bg-ufLightOrange";

                              return (
                                <div key={index} className="flex items-start space-x-6 relative" data-testid={`timeline-item-${item.year}`}>
                                  <div className={`flex-shrink-0 w-16 h-16 ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-sm relative z-20`}>
                                    {item.year}
                                  </div>
                                  <Card className={`flex-1 ${cardClass} rounded-lg p-6 ${item.current ? "border-2 border-ufOrange" : ""}`}>
                                    <h3 className="text-lg font-semibold text-theme-secondary mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground mb-3">{item.description}</p>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                      <Badge variant="outline" className="bg-white">
                                        {item.era}
                                      </Badge>
                                      {item.highlights?.map((highlight: string, idx: number) => (
                                        <Badge 
                                          key={idx} 
                                          variant={item.current ? "default" : "secondary"}
                                          className={item.current ? "bg-theme-primary text-white" : ""}
                                        >
                                          {highlight}
                                        </Badge>
                                      ))}
                                    </div>
                                  </Card>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Statistics */}
                        <div className="mt-8 grid md:grid-cols-3 gap-6">
                          {(section.content as any)?.statistics?.map((stat: any, index: number) => {
                            const bgClass = index === 0 ? "bg-ufLightBlue" :
                                           index === 1 ? "bg-ufLightOrange" : "bg-green-50";
                            const textClass = index === 0 ? "text-theme-secondary" :
                                             index === 1 ? "text-theme-primary" : "text-green-600";
                            
                            return (
                              <div key={index} className={`text-center p-4 ${bgClass} rounded-lg`} data-testid={`statistic-${index}`}>
                                <div className={`text-2xl font-bold ${textClass}`}>{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}

            {/* Continue Learning Section */}
            <div className="bg-gradient-to-r rounded-xl p-6 text-white" data-testid="continue-learning" style={{background: `linear-gradient(to right, var(--theme-secondary), hsl(from var(--theme-secondary) h s calc(l - 10%)))`}}>
              <h3 className="text-xl font-semibold mb-4">Continue Learning</h3>
              <p className="mb-4">Explore the remaining sections to complete your SWMM5 journey:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="secondary"
                  className="text-left p-4 bg-white/10 hover:bg-white/20 border-0 h-auto justify-start"
                  data-testid="button-conceptual-model"
                >
                  <div className="flex items-center space-x-3">
                    <ThemeIcon className="w-4 h-4 text-theme-primary" />
                    <div>
                      <h4 className="font-medium">Conceptual Model</h4>
                      <p className="text-sm text-blue-200">Understanding SWMM's environmental compartments</p>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="text-left p-4 bg-white/10 hover:bg-white/20 border-0 h-auto justify-start"
                  data-testid="button-lid-development"
                >
                  <div className="flex items-center space-x-3">
                    <ThemeIcon className="w-4 h-4 text-green-400" />
                    <div>
                      <h4 className="font-medium">LID Development</h4>
                      <p className="text-sm text-blue-200">Low Impact Development features and controls</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
