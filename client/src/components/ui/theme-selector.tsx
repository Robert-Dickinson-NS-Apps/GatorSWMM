import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Droplets, Waves, Mountain, Leaf } from "lucide-react";
import { useTheme, themes, type Theme } from "@/hooks/use-theme";

const iconMap = {
  Droplets,
  Waves,
  Mountain,
  Leaf,
};

export function ThemeSelector() {
  const { theme, themeConfig, setTheme } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const CurrentIcon = iconMap[themeConfig.icon as keyof typeof iconMap] || Droplets;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3" data-testid="theme-selector">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-theme-primary rounded-full flex items-center justify-center">
              <CurrentIcon className="text-white w-3 h-3" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-theme-secondary">
              {themeConfig.name}
            </span>
            <span className="text-xl">{themeConfig.mascot}</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(themes).map(([themeId, config]) => {
          const Icon = iconMap[config.icon as keyof typeof iconMap] || Droplets;
          return (
            <DropdownMenuItem
              key={themeId}
              onClick={() => handleThemeChange(themeId as Theme)}
              className={`cursor-pointer ${theme === themeId ? 'bg-muted' : ''}`}
              data-testid={`theme-option-${themeId}`}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: config.colors.primary }}>
                  <Icon className="text-white w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{config.name}</div>
                  <div className="text-xs text-muted-foreground">{config.displayName}</div>
                </div>
                <span className="text-lg">{config.mascot}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}