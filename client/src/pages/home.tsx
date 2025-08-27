import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SearchBar } from "@/components/ui/search-bar";
import { ProgressTracker } from "@/components/ui/progress-tracker";
import { Timeline } from "@/components/ui/timeline";
import { GlossaryTerm } from "@/components/ui/glossary-term";
import { ChevronUp, ChevronDown, Play, CheckCircle, Circle, ExternalLink, Download, Droplets } from "lucide-react";
import type { SwmmSection } from "@shared/schema";

export default function Home() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview", "program-description", "history-timeline"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set(["overview", "program-description"]));

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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-ufOrange rounded-lg flex items-center justify-center">
                  <Droplets className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold text-ufBlue">SWMM5Wiki</h1>
              </div>
              <span className="text-sm text-muted-foreground">Interactive Storm Droplets Management Guide</span>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <SearchBar onSearch={setSearchQuery} data-testid="search-input" />
            </div>
            
            <ProgressTracker 
              progress={progressPercent} 
              completed={completedSections.size} 
              total={sections.length}
              data-testid="progress-tracker"
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-80 bg-white border-r border-border h-screen overflow-y-auto sticky top-16" data-testid="sidebar">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-ufBlue mb-4">Table of Contents</h2>
            
            {/* Progress Overview */}
            <div className="bg-ufLightBlue rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ufBlue">Learning Progress</span>
                <span className="text-xs text-ufBlue">{completedSections.size} of {sections.length} sections</span>
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
                          ? "bg-ufLightOrange border border-ufOrange text-ufOrange" 
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
                  className="flex items-center space-x-2 text-sm text-ufBlue hover:text-ufOrange transition-colors"
                  data-testid="link-wikipedia"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Original Wikipedia Article</span>
                </a>
                <a 
                  href="https://www.epa.gov/water-research/storm-water-management-model-swmm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-ufBlue hover:text-ufOrange transition-colors"
                  data-testid="link-epa"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>EPA Official Page</span>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-sm text-ufBlue hover:text-ufOrange p-0 h-auto justify-start"
                  data-testid="button-download"
                >
                  <Download className="w-3 h-3" />
                  <span>Download SWMM 5.2.3</span>
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" data-testid="main-content">
          <div className="max-w-4xl mx-auto p-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-ufBlue to-blue-700 rounded-2xl p-8 text-white mb-8" data-testid="hero-section">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Storm Droplets Management Model (SWMM5)</h1>
                  <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                    EPA's comprehensive dynamic rainfall-runoff simulation model used worldwide for urban drainage system analysis and design.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                      First Developed: 1969-1971
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                      Current Version: 5.2.4
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                      Global Usage
                    </Badge>
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                  alt="Urban drainage system visualization" 
                  className="rounded-xl shadow-lg w-64 h-48 object-cover hidden lg:block"
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
                  section.slug === "history-timeline" ? "bg-ufLightOrange" : ""
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {section.slug === "history-timeline" ? (
                        <Play className="w-5 h-5 text-ufOrange" />
                      ) : completedSections.has(section.slug) ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                      <h2 className="text-2xl font-bold text-ufBlue">{section.title}</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection(section.slug)}
                      className="text-ufOrange hover:text-ufBlue"
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
                          <GlossaryTerm 
                            term="Storm Water Management Model (SWMM)" 
                            definition="A dynamic rainfall-runoff-subsurface runoff simulation model for urban drainage systems"
                            className="font-semibold text-ufBlue"
                          />{" "}
                          is a comprehensive tool used throughout the world for planning, analysis and design related to stormwater runoff, combined and sanitary sewers, and other drainage systems in urban areas.
                        </p>
                        
                        <div className="bg-ufLightBlue rounded-lg p-6 mb-6">
                          <h3 className="text-lg font-semibold text-ufBlue mb-3">Key Characteristics</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {(section.content as any)?.characteristics?.map((char: any, index: number) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-ufOrange/10 flex items-center justify-center flex-shrink-0">
                                  <Droplets className="w-4 h-4 text-ufOrange" />
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
                          <GlossaryTerm 
                            term="rainfall-runoff" 
                            definition="The process by which water from precipitation flows over land surfaces to drainage systems"
                          />,{" "}
                          <GlossaryTerm 
                            term="evaporation" 
                            definition="The process of water changing from liquid to vapor"
                          />,{" "}
                          <GlossaryTerm 
                            term="infiltration" 
                            definition="The process by which water on the ground surface enters the soil"
                          />, and groundwater interactions. 
                          The model operates on collections of subcatchment areas divided into{" "}
                          <GlossaryTerm 
                            term="impervious" 
                            definition="Surfaces that do not allow water to penetrate, like concrete and asphalt"
                          /> and{" "}
                          <GlossaryTerm 
                            term="pervious" 
                            definition="Surfaces that allow water to penetrate, like soil and grass"
                          /> areas.
                        </p>
                      </div>
                    )}

                    {(section.content as any)?.type === "program_description" && (
                      <div>
                        <div className="grid lg:grid-cols-2 gap-8 mb-8">
                          <div>
                            <h3 className="text-lg font-semibold text-ufBlue mb-4">Hydrologic Processes</h3>
                            <div className="space-y-3">
                              {(section.content as any)?.hydrologicProcesses?.map((process: string, index: number) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-ufLightBlue rounded-lg">
                                  <Droplets className="w-4 h-4 text-ufOrange" />
                                  <span>{process}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-ufBlue mb-4">Hydraulic Capabilities</h3>
                            <div className="space-y-3">
                              {(section.content as any)?.hydraulicCapabilities?.map((capability: string, index: number) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-ufLightOrange rounded-lg">
                                  <Droplets className="w-4 h-4 text-ufBlue" />
                                  <span>{capability}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-ufBlue mb-4">Typical Applications</h3>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(section.content as any)?.applications?.map((app: any, index: number) => (
                              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Droplets className="w-4 h-4 text-ufOrange" />
                                  <h4 className="font-medium">{app.title}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">{app.description}</p>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {(section.content as any)?.type === "timeline" && (
                      <Timeline 
                        items={(section.content as any)?.timelineItems} 
                        statistics={(section.content as any)?.statistics}
                        data-testid="timeline-component"
                      />
                    )}
                  </div>
                )}
              </Card>
            ))}

            {/* Continue Learning Section */}
            <div className="bg-gradient-to-r from-ufBlue to-blue-700 rounded-xl p-6 text-white" data-testid="continue-learning">
              <h3 className="text-xl font-semibold mb-4">Continue Learning</h3>
              <p className="mb-4">Explore the remaining sections to complete your SWMM5 journey:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="secondary"
                  className="text-left p-4 bg-white/10 hover:bg-white/20 border-0 h-auto justify-start"
                  data-testid="button-conceptual-model"
                >
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-4 h-4 text-ufOrange" />
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
                    <Droplets className="w-4 h-4 text-green-400" />
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
