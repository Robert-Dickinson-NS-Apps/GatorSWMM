import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'gators' | 'beavers' | 'buffaloes' | 'epa';

export interface ThemeConfig {
  id: Theme;
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    lightPrimary: string;
    lightSecondary: string;
  };
  mascot: string;
  icon: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  gators: {
    id: 'gators',
    name: 'Gator Nation',
    displayName: 'University of Florida',
    colors: {
      primary: 'hsl(20 100% 50%)',
      secondary: 'hsl(221 83% 33%)',
      lightPrimary: 'hsl(20 100% 95%)',
      lightSecondary: 'hsl(221 100% 95%)',
    },
    mascot: '🐊',
    icon: 'Droplets',
  },
  beavers: {
    id: 'beavers',
    name: 'Beaver Nation',
    displayName: 'Oregon State University',
    colors: {
      primary: 'hsl(20 100% 40%)',
      secondary: 'hsl(0 0% 20%)',
      lightPrimary: 'hsl(20 100% 95%)',
      lightSecondary: 'hsl(0 0% 95%)',
    },
    mascot: '🦫',
    icon: 'Waves',
  },
  buffaloes: {
    id: 'buffaloes',
    name: "Ralphie's Herd",
    displayName: 'University of Colorado',
    colors: {
      primary: 'hsl(213 100% 20%)',
      secondary: 'hsl(43 100% 60%)',
      lightPrimary: 'hsl(213 100% 95%)',
      lightSecondary: 'hsl(43 100% 95%)',
    },
    mascot: '🦬',
    icon: 'Mountain',
  },
  epa: {
    id: 'epa',
    name: 'EPA Official',
    displayName: 'US Environmental Protection Agency',
    colors: {
      primary: 'hsl(120 60% 35%)',
      secondary: 'hsl(213 100% 35%)',
      lightPrimary: 'hsl(120 60% 95%)',
      lightSecondary: 'hsl(213 100% 95%)',
    },
    mascot: '🌿',
    icon: 'Leaf',
  },
};

interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('gators');

  useEffect(() => {
    // Apply theme class to document root
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const themeConfig = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}