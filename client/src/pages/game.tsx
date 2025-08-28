import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/hooks/use-theme";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Target, 
  Brain, 
  Lightbulb,
  ArrowRight,
  Award,
  Star,
  Circle,
  Gamepad2
} from "lucide-react";
import type { GameScenario, GameProgress } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface GameState {
  currentScenario: GameScenario | null;
  selectedAnswer: string | null;
  userAnswer: string;
  showResult: boolean;
  score: number;
  attempts: number;
  isCorrect: boolean;
  showExplanation: boolean;
}

const iconMap = { Play, CheckCircle, Trophy, Target, Brain };

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: null,
    selectedAnswer: null,
    userAnswer: "",
    showResult: false,
    score: 0,
    attempts: 0,
    isCorrect: false,
    showExplanation: false
  });

  const { themeConfig } = useTheme();
  const ThemeIcon = iconMap[themeConfig.icon as keyof typeof iconMap] || Brain;
  const queryClient = useQueryClient();

  const { data: scenarios = [], isLoading } = useQuery<GameScenario[]>({
    queryKey: ["/api/game/scenarios"],
  });

  const { data: gameProgress = [] } = useQuery<GameProgress[]>({
    queryKey: ["/api/game/progress/demo-user"],
  });

  const progressMutation = useMutation({
    mutationFn: (progress: any) => apiRequest("POST", "/api/game/progress", progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/progress/demo-user"] });
    }
  });

  const startScenario = (scenario: GameScenario) => {
    setGameState({
      currentScenario: scenario,
      selectedAnswer: null,
      userAnswer: "",
      showResult: false,
      score: 0,
      attempts: 0,
      isCorrect: false,
      showExplanation: false
    });
  };

  const submitAnswer = () => {
    if (!gameState.currentScenario) return;

    const scenario = gameState.currentScenario.scenario as any;
    let isCorrect = false;
    let score = 0;

    if (scenario.type === "multiple_choice") {
      const selectedOption = scenario.options.find((opt: any) => opt.id === gameState.selectedAnswer);
      isCorrect = selectedOption?.correct || false;
      score = isCorrect ? 100 : 0;
    } else if (scenario.type === "scenario_analysis") {
      // Simple keyword matching for scenario analysis
      const userAnswerLower = gameState.userAnswer.toLowerCase();
      const correctAnswers = scenario.correctAnswers || [];
      const matchedAnswers = correctAnswers.filter((answer: string) => 
        userAnswerLower.includes(answer.toLowerCase())
      );
      isCorrect = matchedAnswers.length >= 2; // Need at least 2 correct concepts
      score = Math.min(100, (matchedAnswers.length / correctAnswers.length) * 100);
    } else if (scenario.type === "design_challenge") {
      // For design challenges, check if answer is within acceptable range
      const userValue = parseFloat(gameState.userAnswer);
      const correctValue = scenario.solution?.minDiameter || 18;
      const tolerance = correctValue * 0.1; // 10% tolerance
      isCorrect = Math.abs(userValue - correctValue) <= tolerance;
      score = isCorrect ? 100 : Math.max(0, 100 - Math.abs(userValue - correctValue) * 5);
    }

    setGameState(prev => ({
      ...prev,
      showResult: true,
      isCorrect,
      score: Math.round(score),
      attempts: prev.attempts + 1,
      showExplanation: true
    }));

    // Update progress
    progressMutation.mutate({
      userId: "demo-user",
      scenarioId: gameState.currentScenario.id,
      score: Math.round(score),
      completed: isCorrect,
      attempts: gameState.attempts + 1
    });
  };

  const resetScenario = () => {
    setGameState(prev => ({
      ...prev,
      selectedAnswer: null,
      userAnswer: "",
      showResult: false,
      showExplanation: false
    }));
  };

  const getScenarioProgress = (scenarioId: string) => {
    return gameProgress.find(p => p.scenarioId === scenarioId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hydrology": return <Target className="w-4 h-4" />;
      case "hydraulics": return <Trophy className="w-4 h-4" />;
      case "water-quality": return <CheckCircle className="w-4 h-4" />;
      case "system-design": return <Brain className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SWMM5 game scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50" data-testid="game-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
                  <ThemeIcon className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold text-theme-secondary">SWMM5 Learning Game</h1>
              </div>
              <span className="text-sm text-muted-foreground">Interactive Concept Exploration</span>
              
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-theme-secondary hover:bg-theme-light-primary">
                    <Circle className="w-4 h-4 mr-2" />
                    Learn
                  </Button>
                </Link>
                <Link href="/game">
                  <Button variant="ghost" size="sm" className="text-theme-secondary hover:bg-theme-light-secondary bg-theme-light-secondary">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Play Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!gameState.currentScenario ? (
          // Scenario Selection Screen
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-theme-secondary mb-4">
                Choose Your SWMM5 Challenge
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Test your understanding of stormwater modeling concepts through interactive scenarios. 
                Each challenge teaches key SWMM5 principles while building practical engineering skills.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => {
                const progress = getScenarioProgress(scenario.id);
                return (
                  <Card key={scenario.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(scenario.category)}
                          <h3 className="font-semibold text-lg">{scenario.title}</h3>
                        </div>
                        <Badge className={getDifficultyColor(scenario.difficulty)}>
                          {scenario.difficulty}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {scenario.description}
                      </p>

                      {progress && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Best Score:</span>
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">{progress.score}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Attempts:</span>
                            <span>{progress.attempts}</span>
                          </div>
                          {progress.completed && (
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <Award className="w-4 h-4" />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={() => startScenario(scenario)}
                        className="w-full"
                        data-testid={`start-scenario-${scenario.title.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {progress ? "Try Again" : "Start Challenge"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          // Game Play Screen
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                onClick={() => setGameState(prev => ({ ...prev, currentScenario: null }))}
                variant="outline"
                data-testid="back-to-scenarios"
              >
                ← Back to Scenarios
              </Button>
              <Badge className={getDifficultyColor(gameState.currentScenario.difficulty)}>
                {gameState.currentScenario.difficulty}
              </Badge>
            </div>

            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-theme-secondary mb-2">
                    {gameState.currentScenario.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {gameState.currentScenario.description}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-theme-secondary mb-3">Scenario:</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {(gameState.currentScenario.scenario as any).situation}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-theme-secondary mb-4">
                    {(gameState.currentScenario.scenario as any).question}
                  </h3>

                  {(gameState.currentScenario.scenario as any).type === "multiple_choice" && (
                    <RadioGroup 
                      value={gameState.selectedAnswer || ""} 
                      onValueChange={(value) => setGameState(prev => ({ ...prev, selectedAnswer: value }))}
                      className="space-y-3"
                    >
                      {(gameState.currentScenario.scenario as any).options.map((option: any) => (
                        <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-gray-50 dark:hover:bg-gray-800">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {(gameState.currentScenario.scenario as any).type === "scenario_analysis" && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Explain the cause of flooding and suggest solutions..."
                        value={gameState.userAnswer}
                        onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
                        className="min-h-32"
                        data-testid="scenario-analysis-input"
                      />
                      <div className="text-sm text-muted-foreground">
                        <strong>Tip:</strong> Consider factors like surface types, runoff patterns, and potential solutions.
                      </div>
                    </div>
                  )}

                  {(gameState.currentScenario.scenario as any).type === "design_challenge" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <strong>Peak Flow:</strong> {(gameState.currentScenario.scenario as any).parameters.peakFlow} CFS
                        </div>
                        <div>
                          <strong>Distance:</strong> {(gameState.currentScenario.scenario as any).parameters.distance} feet
                        </div>
                        <div>
                          <strong>Elevation Drop:</strong> {(gameState.currentScenario.scenario as any).parameters.elevationDrop} feet
                        </div>
                        <div>
                          <strong>Area:</strong> {(gameState.currentScenario.scenario as any).parameters.area} acres
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="diameter-input">Minimum Pipe Diameter (inches):</Label>
                        <input
                          id="diameter-input"
                          type="number"
                          placeholder="Enter diameter in inches"
                          value={gameState.userAnswer}
                          onChange={(e) => setGameState(prev => ({ ...prev, userAnswer: e.target.value }))}
                          className="w-full px-3 py-2 border border-border rounded-md"
                          data-testid="design-challenge-input"
                        />
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          <Lightbulb className="w-4 h-4 inline mr-2" />
                          Hints:
                        </h4>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                          {(gameState.currentScenario.scenario as any).hints.map((hint: string, index: number) => (
                            <li key={index}>• {hint}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {!gameState.showResult && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={submitAnswer}
                      disabled={
                        ((gameState.currentScenario.scenario as any).type === "multiple_choice" && !gameState.selectedAnswer) ||
                        (((gameState.currentScenario.scenario as any).type === "scenario_analysis" || 
                          (gameState.currentScenario.scenario as any).type === "design_challenge") && !gameState.userAnswer.trim())
                      }
                      className="px-8"
                      data-testid="submit-answer"
                    >
                      Submit Answer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {gameState.showResult && (
                  <div className="space-y-4">
                    <div className={`p-6 rounded-lg border ${
                      gameState.isCorrect 
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    }`}>
                      <div className="flex items-center space-x-3 mb-4">
                        {gameState.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                        <span className={`font-semibold text-lg ${
                          gameState.isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                        }`}>
                          {gameState.isCorrect ? "Excellent!" : "Not quite right"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium">{gameState.score}%</span>
                        </div>
                      </div>

                      {gameState.showExplanation && (gameState.currentScenario.scenario as any).type === "multiple_choice" && (
                        <div className="space-y-3">
                          {(gameState.currentScenario.scenario as any).options.map((option: any) => (
                            <div key={option.id} className={`p-3 rounded border ${
                              option.correct ? "border-green-300 bg-green-100 dark:bg-green-900" : 
                              option.id === gameState.selectedAnswer ? "border-red-300 bg-red-100 dark:bg-red-900" : 
                              "border-gray-200 bg-gray-50 dark:bg-gray-800"
                            }`}>
                              <div className="flex items-center space-x-2 mb-2">
                                {option.correct && <CheckCircle className="w-4 h-4 text-green-600" />}
                                {!option.correct && option.id === gameState.selectedAnswer && <XCircle className="w-4 h-4 text-red-600" />}
                                <span className="font-medium">{option.text}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{option.explanation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Learning Objectives:</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        {(gameState.currentScenario.scenario as any).learningObjectives.map((objective: string, index: number) => (
                          <li key={index}>• {objective}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <Button onClick={resetScenario} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                      <Button onClick={() => setGameState(prev => ({ ...prev, currentScenario: null }))}>
                        Next Challenge
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}