import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./Tooltip";

type PageControlProps = Omit<
  ComponentProps<typeof TooltipTrigger>,
  "aria-label" | "children"
> & {
  children: ReactNode;
  label: string;
};

export function PageControl({ children, label, ...props }: PageControlProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        {...props}
        className="page-control"
        type="button"
        aria-label={label}
      >
        <span className="page-control__glyph" aria-hidden="true">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type PageControlIconProps = {
  active: boolean;
  icon: IconSvgElement;
};

export function PageControlIcon({ active, icon }: PageControlIconProps) {
  return (
    <HugeiconsIcon
      className="page-control__icon"
      data-active={active}
      icon={icon}
      size={16}
      strokeWidth={1.7}
    />
  );
}
