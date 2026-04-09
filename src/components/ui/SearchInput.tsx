"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
  initialValue?: string;
}

export default function SearchInput({
  placeholder = "ابحث...",
  onSearch,
  className = "",
  initialValue = "",
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleClear = useCallback(() => {
    setValue("");
  }, []);

  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 bg-card border border-card-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-foreground font-bold shadow-sm"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors text-muted-fg"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
