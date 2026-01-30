"use client";

import { forwardRef } from "react";

interface LinkItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

const links: LinkItem[] = [
  {
    title: "Explore the Shelby docs",
    url: "https://docs.shelby.xyz",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    title: "Learn more about Shelby",
    url: "https://shelby.xyz",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
    ),
  },
  {
    title: "Join our Discord community",
    url: "https://discord.gg/shelbyserves",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: "Try the Shelby quickstart",
    url: "https://github.com/shelby/shelby-quickstart",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
  },
];

interface NextStepsProps {
  showGlow?: boolean;
  onLinkClick?: () => void;
}

export const NextSteps = forwardRef<HTMLDivElement, NextStepsProps>(
  function NextSteps({ showGlow, onLinkClick }, ref) {
    return (
      <div
        ref={ref}
        className={`glass-neon rounded-xl p-6 space-y-4 ${showGlow ? "glow-pulse" : ""}`}
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground">Next Steps</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Congratulations on your first upload! Here are some resources to
            help you continue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onLinkClick}
              className="group p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[var(--poline-accent-9)] hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--poline-accent-9)] group-hover:text-[var(--poline-accent-9)]">
                  {link.icon}
                </span>
                <span className="text-sm font-medium text-foreground group-hover:text-[var(--poline-accent-9)] transition-colors">
                  {link.title}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  },
);
