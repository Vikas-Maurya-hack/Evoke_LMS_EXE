import React, { createContext, useContext, useState, ReactNode } from "react";
import { SearchableItem } from "@/hooks/useSearch";
import { courseData } from "@/constants/courseData";

interface SearchContextType {
    searchableItems: SearchableItem[];
    recentSearches: string[];
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Build searchable items from all data sources
    // Note: Students are now fetched from database, so we don't include them in static search
    const searchableItems: SearchableItem[] = [
        // Courses
        ...courseData.flatMap((category) =>
            (category.courses || []).flatMap((course) =>
                (course.variants || []).map((variant) => ({
                    id: variant.id,
                    name: `${course.name} - ${variant.name}`,
                    type: "course" as const,
                    description: variant.description || course.description,
                }))
            )
        ),

        // Pages
        {
            id: "page-dashboard",
            name: "Dashboard",
            type: "page" as const,
            description: "View your dashboard overview",
            path: "/",
        },
        {
            id: "page-students",
            name: "Students",
            type: "page" as const,
            description: "Manage student profiles",
            path: "/students",
        },
        {
            id: "page-courses",
            name: "Courses",
            type: "page" as const,
            description: "Explore available courses",
            path: "/courses",
        },
        {
            id: "page-settings",
            name: "Settings",
            type: "page" as const,
            description: "Configure your preferences",
            path: "/settings",
        },
        {
            id: "page-analytics",
            name: "Analytics",
            type: "page" as const,
            description: "View analytics and reports",
            path: "/analytics",
        },
        {
            id: "page-payments",
            name: "Payments",
            type: "page" as const,
            description: "Manage payments and transactions",
            path: "/payments",
        },
        {
            id: "page-notifications",
            name: "Notifications",
            type: "page" as const,
            description: "View your notifications",
            path: "/notifications",
        },
    ];

    const addRecentSearch = (query: string) => {
        if (!query.trim()) return;

        setRecentSearches((prev) => {
            const filtered = prev.filter((q) => q !== query);
            return [query, ...filtered].slice(0, 5); // Keep only 5 recent searches
        });
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
    };

    return (
        <SearchContext.Provider
            value={{
                searchableItems,
                recentSearches,
                addRecentSearch,
                clearRecentSearches,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

export function useSearchContext() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearchContext must be used within SearchProvider");
    }
    return context;
}
