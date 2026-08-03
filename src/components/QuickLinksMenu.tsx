import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

type ProjectLink = {
  name: string;
  href: string;
};

type QuickLinksMenuProps = {
  projects: ReadonlyArray<ProjectLink>;
};

const pageLinks = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Projects", href: "/#projects" },
];

const contactLinks = [
  { label: "GitHub", href: "https://github.com/enesgules", newTab: true },
  { label: "X", href: "https://x.com/abdushbag", newTab: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/abdullah-enes-gules",
    newTab: true,
  },
  {
    label: "Email",
    href: "mailto:abdullah.enes.gules@gmail.com",
    newTab: false,
  },
];

function preventPreviewNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

export function QuickLinksMenu({ projects }: QuickLinksMenuProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      firstLinkRef.current?.focus();
      return;
    }

    if (hasOpenedRef.current) {
      const focusFrame = window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });

      return () => {
        window.cancelAnimationFrame(focusFrame);
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <motion.div
      className="quick-links"
      data-open={open || undefined}
      layout
      ref={rootRef}
      style={{ borderRadius: open ? 26 : 9999 }}
      transition={{
        layout: reduceMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 400,
              damping: 34,
              mass: 0.85,
            },
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.nav
            aria-label="Quick links"
            animate={{ opacity: 1 }}
            className="quick-links__panel"
            exit={{ opacity: 0 }}
            id="quick-links-menu"
            initial={{ opacity: 0 }}
            key="panel"
            layout="position"
            transition={{
              duration: reduceMotion ? 0 : 0.16,
              delay: reduceMotion ? 0 : 0.04,
            }}
          >
            <div className="quick-links__group" role="group" aria-label="Pages">
              <span className="quick-links__group-label" aria-hidden="true">
                Pages
              </span>
              {pageLinks.map((link, index) => (
                <a
                  className="quick-links__link"
                  href={link.href}
                  key={link.href}
                  onAuxClick={preventPreviewNavigation}
                  onClick={preventPreviewNavigation}
                  ref={index === 0 ? firstLinkRef : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div
              className="quick-links__group"
              role="group"
              aria-label="Project links"
            >
              <span className="quick-links__group-label" aria-hidden="true">
                Work
              </span>
              {projects.map((project) => (
                <a
                  className="quick-links__link"
                  href={project.href}
                  key={project.href}
                  onAuxClick={preventPreviewNavigation}
                  onClick={preventPreviewNavigation}
                  rel="noreferrer"
                  target="_blank"
                >
                  {project.name}
                </a>
              ))}
            </div>

            <div
              className="quick-links__group"
              role="group"
              aria-label="Contact links"
            >
              <span className="quick-links__group-label" aria-hidden="true">
                Contact
              </span>
              <div className="quick-links__contacts">
                {contactLinks.map((link) => (
                  <a
                    className="quick-links__contact"
                    href={link.href}
                    key={link.href}
                    onAuxClick={preventPreviewNavigation}
                    onClick={preventPreviewNavigation}
                    rel={link.newTab ? "noreferrer" : undefined}
                    target={link.newTab ? "_blank" : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <button
              className="quick-links__close"
              onClick={() => setOpen(false)}
              type="button"
            >
              Close
            </button>
          </motion.nav>
        ) : (
          <motion.button
            aria-controls="quick-links-menu"
            aria-expanded="false"
            animate={{ opacity: 1 }}
            className="quick-links__trigger"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="pill"
            layout="position"
            onClick={() => setOpen(true)}
            ref={triggerRef}
            transition={{ duration: reduceMotion ? 0 : 0.12 }}
            type="button"
          >
            Quick links
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
