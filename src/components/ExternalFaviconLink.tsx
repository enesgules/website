import type { ReactNode } from "react";

type ExternalFaviconLinkProps = {
  children: ReactNode;
  faviconSrc: string;
  href: string;
};

export function ExternalFaviconLink({
  children,
  faviconSrc,
  href,
}: ExternalFaviconLinkProps) {
  return (
    <a
      className="inline-favicon-link"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
      <img
        className="inline-favicon-link__icon"
        src={faviconSrc}
        alt=""
        width="20"
        height="20"
        aria-hidden="true"
      />
    </a>
  );
}
