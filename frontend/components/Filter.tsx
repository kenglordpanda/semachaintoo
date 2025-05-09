import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter as FilterIcon } from "lucide-react";

interface FilterProps {
  onFilter: (filter: string) => void;
  activeFilter: string;
}

const filters = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "In Review", value: "review" },
];

const categories = [
  { label: "All Categories", value: "all" },
  { label: "Guide", value: "guide" },
  { label: "Technical", value: "technical" },
  { label: "Reference", value: "reference" },
];

export function Filter({ onFilter, activeFilter }: FilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuGroup>
          {filters.map((filter) => (
            <DropdownMenuItem
              key={filter.value}
              onClick={() => onFilter(filter.value)}
              className={activeFilter === filter.value ? "bg-accent" : ""}
            >
              {filter.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Category</DropdownMenuLabel>
        <DropdownMenuGroup>
          {categories.map((category) => (
            <DropdownMenuItem
              key={category.value}
              onClick={() => onFilter(category.value)}
              className={activeFilter === category.value ? "bg-accent" : ""}
            >
              {category.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 