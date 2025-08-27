import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  progress: number;
  completed: number;
  total: number;
}

export function ProgressTracker({ progress, completed, total }: ProgressTrackerProps) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-muted-foreground">Progress:</span>
      <div className="w-20">
        <Progress value={progress} className="h-2" />
      </div>
      <span className="text-sm font-medium text-ufBlue">{progress}%</span>
    </div>
  );
}
