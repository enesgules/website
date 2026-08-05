import { useId, type ReactNode, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

type IconBaseProps = IconProps & {
  children: ReactNode;
};

function IconBase({ children, strokeWidth = 0.95, ...props }: IconBaseProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        {children}
      </g>
    </svg>
  );
}

function EsnafBase() {
  return (
    <>
      <path d="M16.5 8.2c0 3.15-1.8 5.2-4.5 5.2s-4.5-2.05-4.5-5.2c0-2.8 1.7-4.6 4.5-4.6s4.5 1.8 4.5 4.6Z" />
      <path d="M19 20.5a7 7 0 0 0-14 0" />
      <path
        d="M12 10.5c-.86-.64-1.92-.67-2.66-.08.4.9 1.42 1.2 2.66.48 1.24.72 2.26.42 2.66-.48-.74-.59-1.8-.56-2.66.08Z"
        fill="currentColor"
        strokeWidth={0.4}
      />
    </>
  );
}

function EsnafOpenVest() {
  return (
    <>
      <path d="M6.95 15.7v4.7M10.6 14v6.4M17.05 15.7v4.7M13.4 14v6.4" />
      <path d="M8.1 17.45h1.2v.95c0 .3-.2.45-.6.45s-.6-.15-.6-.45Z" />
    </>
  );
}

type CayGlassProps = {
  children?: ReactNode;
};

function CayGlass({ children }: CayGlassProps) {
  return (
    <g transform="translate(0 1.2) scale(1 .94)">
      <path d="M7.8 4h8.4c-.2 1.8-.6 3.4-1.1 4.7-.4 1.15-.3 2.1.3 3.15.75 1.4 1.05 3.2.85 4.8-.15 1.2-.8 1.85-1.7 1.85h-5.1c-.9 0-1.55-.65-1.7-1.85-.2-1.6.1-3.4.85-4.8.6-1.05.7-2 .3-3.15-.5-1.3-.9-2.9-1.1-4.7Z" />
      <path d="M8.7 6.6h6.6" />
      <path d="M9.45 18.5H4.9c1.3 1.15 3 1.7 5.1 1.7h4c2.1 0 3.8-.55 5.1-1.7h-4.55" />
      {children}
    </g>
  );
}

export function EsnafIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <EsnafBase />
      <EsnafOpenVest />
    </IconBase>
  );
}

export function EsnafSmokingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <EsnafBase />
      <EsnafOpenVest />
      <path d="m13.4 10.95 3.55.75" />
      <path
        d="M17.45 11.2c.55-.5-.3-.95.18-1.5.4-.45.25-.9.05-1.25"
        strokeWidth={0.7}
      />
    </IconBase>
  );
}

export function EsnafButtonedIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <EsnafBase />
      <path d="M7.5 15.7v4.7m9-4.7v4.7M9.6 14l2.4 3.1 2.4-3.1M12 17.1v3.3M13.3 18.2h.01M13.3 19.6h.01" />
    </IconBase>
  );
}

export function CayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <CayGlass />
    </IconBase>
  );
}

export function CaySpoonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <CayGlass>
        <g strokeWidth={1.25}>
          <path d="M16.25 3.5 9.65 15.7" />
          <ellipse
            cx="9.25"
            cy="16.55"
            fill="currentColor"
            rx=".82"
            ry="1.15"
            transform="rotate(29 9.25 16.55)"
          />
        </g>
      </CayGlass>
    </IconBase>
  );
}

export function CaySugarIcon(props: IconProps) {
  const cubeMaskId = useId().replaceAll(":", "");
  const frontCubeMaskId = useId().replaceAll(":", "");
  const saucerFrontMaskId = useId().replaceAll(":", "");

  return (
    <IconBase {...props}>
      <defs>
        <mask
          height="24"
          id={cubeMaskId}
          maskUnits="userSpaceOnUse"
          width="24"
          x="0"
          y="0"
        >
          <rect fill="white" height="24" stroke="none" width="24" />
          <g
            fill="black"
            stroke="black"
            strokeWidth={0.95}
            transform="translate(0 1.2) scale(1 .94)"
          >
            <path d="M14.4 16.3l.45-.45h2.7v2.7l-.45.45h-2.7Z" />
            <path
              d="M11.85 16.3l.45-.45H15v2.7l-.45.45h-2.7Z"
              transform="rotate(8 13.2 17.65)"
            />
          </g>
          <rect
            fill="white"
            height="6.05"
            stroke="none"
            width="24"
            x="0"
            y="17.95"
          />
        </mask>
        <mask
          height="24"
          id={frontCubeMaskId}
          maskUnits="userSpaceOnUse"
          width="24"
          x="0"
          y="0"
        >
          <rect fill="white" height="24" stroke="none" width="24" />
          <g
            fill="black"
            stroke="black"
            strokeWidth={0.95}
            transform="translate(0 1.2) scale(1 .94)"
          >
            <path
              d="M11.85 16.3l.45-.45H15v2.7l-.45.45h-2.7Z"
              transform="rotate(8 13.2 17.65)"
            />
          </g>
        </mask>
        <mask
          height="24"
          id={saucerFrontMaskId}
          maskUnits="userSpaceOnUse"
          width="24"
          x="0"
          y="0"
        >
          <rect fill="white" height="18.55" stroke="none" width="24" />
        </mask>
      </defs>
      <g mask={`url(#${cubeMaskId})`}>
        <CayGlass />
      </g>
      <g mask={`url(#${saucerFrontMaskId})`}>
        <g mask={`url(#${frontCubeMaskId})`}>
          <g transform="translate(0 1.2) scale(1 .94)" strokeWidth={0.95}>
            <path d="M14.4 16.3h2.7V19h-2.7Z" />
            <path d="m14.4 16.3.45-.45h2.7l-.45.45m.45-.45v2.7l-.45.45" />
          </g>
        </g>
        <g transform="translate(0 1.2) scale(1 .94)" strokeWidth={0.95}>
          <g transform="rotate(8 13.2 17.65)">
            <path d="M11.85 16.3h2.7V19h-2.7Z" />
            <path d="m11.85 16.3.45-.45H15l-.45.45m.45-.45v2.7l-.45.45" />
          </g>
        </g>
      </g>
    </IconBase>
  );
}
