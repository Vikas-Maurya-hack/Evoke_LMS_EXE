import { useState, useCallback, useMemo } from "react";

export interface SearchableItem {
    id: string;
    name: string;
    type: "student" | "course" | "page";
    description?: string;
    email?: string;
    course?: string;
    path?: string;
}

export function useSearch(items: SearchableItem[], debounceMs = 300) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce the search query
    const updateQuery = useCallback((value: string) => {
        setQuery(value);

        const timer = setTimeout(() => {
            setDebouncedQuery(value);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [debounceMs]);

    // Fuzzy search implementation
    const fuzzyMatch = useCallback((text: string, search: string): boolean => {
        const searchLower = search.toLowerCase();
        const textLower = text.toLowerCase();

        // Exact match
        if (textLower.includes(searchLower)) return true;

        // Fuzzy match - check if all characters in search appear in order in text
        let searchIndex = 0;
        for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
            if (textLower[i] === searchLower[searchIndex]) {
                searchIndex++;
            }
        }
        return searchIndex === searchLower.length;
    }, []);

    // Filter items based on search query
    const results = useMemo(() => {
        if (!debouncedQuery.trim()) return [];

        return items.filter((item) => {
            const searchableFields = [
                item.name,
                item.description || "",
                item.email || "",
                item.course || "",
            ];

            return searchableFields.some((field) =>
                fuzzyMatch(field, debouncedQuery)
            );
        }).slice(0, 10); // Limit to 10 results
    }, [items, debouncedQuery, fuzzyMatch]);

    // Highlight matching text
    const highlightMatch = useCallback((text: string, search: string): string => {
        if (!search) return text;

        const regex = new RegExp(`(${search})`, "gi");
        return text.replace(regex, "<mark>$1</mark>");
    }, []);

    return {
        query,
        setQuery: updateQuery,
        results,
        highlightMatch,
        hasResults: results.length > 0,
        isSearching: query !== debouncedQuery,
    };
}
