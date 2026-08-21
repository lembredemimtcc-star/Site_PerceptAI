import React, { useState } from "react";
import { Search } from "lucide-react";
import { searchInputStyles as styles, getSearchInputStyle } from "./styles/SearchInput.styles";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "Buscar..." }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex-1 relative">
      <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2" color={styles.iconColor} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full pl-7 pr-2 py-2.5 text-[15px] outline-none"
        style={getSearchInputStyle(isFocused)}
      />
    </div>
  );
};