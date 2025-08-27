import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search SWMM5 content..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:ring-2 focus:ring-ufOrange focus:border-transparent outline-none"
        data-testid="search-input"
      />
      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
    </div>
  );
}
