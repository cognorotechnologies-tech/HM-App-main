import React, { useState, useRef, useEffect } from 'react';
import { Search, Check } from 'lucide-react';

interface AutocompleteOption {
    name: string;
    category?: string;
    commonDosage?: string;
    commonFrequency?: string;
    stock?: string | number;
    id?: string;
}

interface MedicineAutocompleteProps {
    value: string;
    onChange: (value: string, option?: AutocompleteOption) => void;
    onSelectMedicine?: (medicine: AutocompleteOption) => void;
    options?: AutocompleteOption[];
    onSearch?: (query: string) => Promise<AutocompleteOption[]>;
    placeholder?: string;
    className?: string;
}

export const MedicineAutocomplete: React.FC<MedicineAutocompleteProps> = ({
    value,
    onChange,
    onSelectMedicine,
    options = [],
    onSearch,
    placeholder = "Search medicines...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<any>(null);
    const ignoreNextSearch = useRef(false);

    useEffect(() => {
        if (!value) {
            setFilteredOptions([]);
            setIsOpen(false);
            return;
        }

        // If this update was triggered by a selection, ignore it
        if (ignoreNextSearch.current) {
            ignoreNextSearch.current = false;
            setIsOpen(false);
            return;
        }

        if (onSearch) {
            // Async search mode
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            setLoading(true);
            debounceTimeout.current = setTimeout(async () => {
                const results = await onSearch(value);
                setFilteredOptions(results);
                // Only open if we haven't just selected (double check) and have results
                // AND the user is likely still interacting (this is hard to know precisely without focus tracking, but standard flow works)
                setIsOpen(results.length > 0);
                setLoading(false);
            }, 300);
        } else {
            // Static options mode
            const filtered = options.filter(opt =>
                opt.name.toLowerCase().includes(value.toLowerCase()) ||
                opt.category?.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredOptions(filtered);
            setIsOpen(filtered.length > 0);
        }
    }, [value, options, onSearch]);

    // Cleanup timeout
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: AutocompleteOption) => {
        ignoreNextSearch.current = true; // Set flag to ignore the next value-change triggered search
        onChange(option.name, option);
        if (onSelectMedicine) {
            onSelectMedicine(option);
        }
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => value && filteredOptions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-8"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && value && isOpen && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {filteredOptions.length} found
                    </div>
                )}
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto animate-fadeIn">
                    <div className="p-2 space-y-1">
                        {filteredOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(option)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${index === highlightedIndex
                                    ? 'bg-green-50 border-2 border-green-200'
                                    : 'hover:bg-gray-50 border-2 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {option.name}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                            {option.category && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                    {option.category}
                                                </span>
                                            )}
                                            {option.commonDosage && (
                                                <span className="text-gray-500">
                                                    Usual: {option.commonDosage}
                                                </span>
                                            )}
                                            {/* Show stock if available */}
                                            {option.stock !== undefined && (
                                                <span className={`font-medium ${Number(option.stock) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    Stock: {option.stock}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {index === highlightedIndex && (
                                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
