import type { CSSProperties, ReactNode } from "react";

type ExternalFaviconLinkProps = {
  children: ReactNode;
  faviconSrc: string;
  href: string;
  iconBackground?: string;
  iconPadding?: number;
};

export function ExternalFaviconLink({
  children,
  faviconSrc,
  href,
  iconBackground,
  iconPadding,
}: ExternalFaviconLinkProps) {
  const imageStyle = iconBackground || iconPadding
    ? ({
        "--favicon-image-bg": iconBackground,
        padding: iconPadding,
      } as CSSProperties)
    : undefined;

  return (
    <a
      className="inline-favicon-link"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
      <span
        className="link-icon-tile inline-favicon-link__icon"
        aria-hidden="true"
      >
        <img
          className="inline-favicon-link__image"
          src={faviconSrc}
          alt=""
          width="16"
          height="16"
          style={imageStyle}
        />
      </span>
    </a>
  );
}
