"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, PlusCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  /** Navigate to this route when clicked. */
  href?: string;
  /** Or run a custom handler instead. */
  onSelect?: () => void;
}

interface QuickActionsMenuProps {
  actions: readonly QuickAction[];
  label?: string;
  align?: "start" | "center" | "end";
}

export function QuickActionsMenu({
  actions,
  label = "Quick Actions",
  align = "end",
}: QuickActionsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleSelect = (action: QuickAction) => {
    setOpen(false);
    if (action.onSelect) action.onSelect();
    else if (action.href) router.push(action.href);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="default" />}>
        <PlusCircle className="h-4 w-4" />
        {label}
        <ChevronDown className="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent align={align} className="w-64 p-3">
        <div className="flex flex-col gap-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleSelect(action)}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
