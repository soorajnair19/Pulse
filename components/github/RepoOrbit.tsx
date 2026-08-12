"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RepoContribution, WidgetVariant } from "@/types";
import { useTheme } from "./ThemeProvider";

const MAX_NODES = 16;

/** Stable SVG coords across SSR + client (avoids hydration float drift). */
function roundSvg(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

type RepoOrbitProps = {
  repos: RepoContribution[];
  avatarUrl?: string;
  username: string;
  variant: WidgetVariant;
};

type OrbitNode = RepoContribution & {
  x: number;
  y: number;
  r: number;
  color: string;
};

function sizeRadius(
  contributions: number,
  minC: number,
  maxC: number,
  minR: number,
  maxR: number
): number {
  if (maxC <= minC) return roundSvg((minR + maxR) / 2);
  const t = (contributions - minC) / (maxC - minC);
  return roundSvg(minR + Math.sqrt(t) * (maxR - minR));
}

function repoColor(repo: RepoContribution, fallback: string): string {
  return repo.primaryLanguage?.color ?? fallback;
}

/** Few repos cluster on the right; many repos use a full ring. */
function nodeAngles(count: number): number[] {
  if (count === 1) return [0];
  if (count <= 5) {
    const span = count === 2 ? Math.PI / 2 : (220 * Math.PI) / 180;
    const start = -span / 2;
    return Array.from({ length: count }, (_, index) =>
      start + (index / (count - 1)) * span
    );
  }
  return Array.from({ length: count }, (_, index) =>
    -Math.PI / 2 + (index / count) * Math.PI * 2
  );
}

function effectiveOrbitR(baseR: number, count: number): number {
  if (count === 1) return roundSvg(baseR * 0.82);
  if (count <= 3) return roundSvg(baseR * 0.88);
  if (count <= 5) return roundSvg(baseR * 0.94);
  return baseR;
}

function OrbitTooltip({
  repo,
  x,
  y,
  visible,
}: {
  repo: RepoContribution | null;
  x: number;
  y: number;
  visible: boolean;
}) {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ left: x, top: y, ready: false });

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !ref.current) {
      setCoords((prev) => ({ ...prev, ready: false }));
      return;
    }
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x - rect.width / 2;
    let top = y - rect.height - 8;
    left = Math.max(8, Math.min(left, vw - rect.width - 8));
    if (top < 8) top = y + 20;
    top = Math.max(8, Math.min(top, vh - rect.height - 8));
    setCoords({ left, top, ready: true });
  }, [visible, x, y, repo]);

  if (!visible || !mounted || !repo) return null;

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      className="pointer-events-none fixed z-[9999] w-max max-w-[min(320px,calc(100vw-16px))] rounded-md px-2.5 py-1.5 text-xs shadow-lg"
      style={{
        left: coords.left,
        top: coords.top,
        opacity: coords.ready ? 1 : 0,
        background: theme.tooltipBg,
        color: theme.tooltipText,
      }}
    >
      <div className="font-medium">{repo.nameWithOwner}</div>
      <div className="opacity-80">
        {repo.contributions.toLocaleString()} commit
        {repo.contributions === 1 ? "" : "s"}
        {repo.stargazerCount != null && repo.stargazerCount > 0
          ? ` · ${repo.stargazerCount.toLocaleString()} ★`
          : ""}
      </div>
      {repo.primaryLanguage && (
        <div className="mt-0.5 flex items-center gap-1.5 opacity-80">
          <span
            className="inline-block size-2 rounded-full"
            style={{
              backgroundColor: repo.primaryLanguage.color ?? theme.levels[4],
            }}
          />
          {repo.primaryLanguage.name}
        </div>
      )}
    </div>,
    document.body
  );
}

function RepoOrbitTable({
  repos,
  highlightedKey,
  onHover,
  showStars,
}: {
  repos: RepoContribution[];
  highlightedKey: string | null;
  onHover: (repo: RepoContribution | null) => void;
  showStars: boolean;
}) {
  const theme = useTheme();

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div
        className="mb-2 flex items-baseline justify-between gap-2 text-[10px] font-medium uppercase tracking-wide"
        style={{ color: theme.textMuted }}
      >
        <span>Top repositories</span>
        <span className="normal-case tracking-normal">by commits</span>
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto rounded-md border"
        style={{
          borderColor: theme.border,
          maxHeight: "100%",
        }}
      >
        <table className="w-full text-left text-[11px] leading-tight">
          <thead
            className="sticky top-0 z-[1]"
            style={{
              background: theme.surface,
              color: theme.textMuted,
            }}
          >
            <tr>
              <th className="w-6 px-2.5 py-2 font-medium">#</th>
              <th className="px-2.5 py-2 font-medium">Repo</th>
              <th className="px-2.5 py-2 font-medium">Lang</th>
              <th className="px-2.5 py-2 font-medium text-right tabular-nums">
                Commits
              </th>
              {showStars && (
                <th className="px-2.5 py-2 font-medium text-right tabular-nums">
                  ★
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {repos.map((repo, index) => {
              const isHighlighted = highlightedKey === repo.nameWithOwner;
              const color = repoColor(repo, theme.levels[4]);
              return (
                <tr
                  key={repo.nameWithOwner}
                  className="transition-colors"
                  style={{
                    background: isHighlighted ? theme.surface : "transparent",
                  }}
                  onMouseEnter={() => onHover(repo)}
                  onMouseLeave={() => onHover(null)}
                >
                  <td
                    className="px-2.5 py-1.5 tabular-nums"
                    style={{ color: theme.textMuted }}
                  >
                    {index + 1}
                  </td>
                  <td className="max-w-0 px-2.5 py-1.5">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 items-center gap-1.5 hover:underline"
                      style={{ color: theme.text }}
                    >
                      <span
                        className="inline-block size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                      <span className="truncate font-medium">{repo.name}</span>
                    </a>
                  </td>
                  <td
                    className="truncate px-2.5 py-1.5"
                    style={{ color: theme.textMuted }}
                  >
                    {repo.primaryLanguage?.name ?? "—"}
                  </td>
                  <td
                    className="px-2.5 py-1.5 text-right font-semibold tabular-nums"
                    style={{ color: theme.text }}
                  >
                    {repo.contributions.toLocaleString()}
                  </td>
                  {showStars && (
                    <td
                      className="px-2.5 py-1.5 text-right tabular-nums"
                      style={{ color: theme.textMuted }}
                    >
                      {repo.stargazerCount != null && repo.stargazerCount > 0
                        ? repo.stargazerCount.toLocaleString()
                        : "—"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrbitGraphic({
  nodes,
  size,
  center,
  orbitR,
  avatarR,
  avatarUrl,
  username,
  highlightedKey,
  onNodeHover,
}: {
  nodes: OrbitNode[];
  size: number;
  center: number;
  orbitR: number;
  avatarR: number;
  avatarUrl?: string;
  username: string;
  highlightedKey: string | null;
  onNodeHover: (
    payload: { repo: RepoContribution; x: number; y: number } | null
  ) => void;
}) {
  const theme = useTheme();
  const nodeCount = nodes.length;
  const ringR = effectiveOrbitR(orbitR, nodeCount);
  const useArcRing = nodeCount <= 5;
  const arcPath = useMemo(() => {
    if (!useArcRing) return null;
    const angles = nodeAngles(nodeCount);
    const pad = nodeCount === 1 ? 0.35 : 0.22;
    const a0 = angles[0] - pad;
    const a1 = angles[angles.length - 1] + pad;
    const x0 = roundSvg(center + Math.cos(a0) * ringR);
    const y0 = roundSvg(center + Math.sin(a0) * ringR);
    const x1 = roundSvg(center + Math.cos(a1) * ringR);
    const y1 = roundSvg(center + Math.sin(a1) * ringR);
    const largeArc = a1 - a0 > Math.PI ? 1 : 0;
    const r = roundSvg(ringR);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`;
  }, [useArcRing, nodeCount, center, ringR]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${username} repository orbit`}
      className="max-h-full max-w-full overflow-visible"
    >
      {useArcRing && arcPath ? (
        <path
          d={arcPath}
          fill="none"
          stroke={theme.border}
          strokeWidth={1}
          strokeDasharray="3 5"
          opacity={0.7}
        />
      ) : (
        <circle
          cx={center}
          cy={center}
          r={ringR}
          fill="none"
          stroke={theme.border}
          strokeWidth={1}
          strokeDasharray="3 5"
          opacity={0.7}
        />
      )}

      <defs>
        <clipPath id="pulse-orbit-avatar">
          <circle cx={center} cy={center} r={avatarR} />
        </clipPath>
      </defs>

      {avatarUrl ? (
        <image
          href={avatarUrl}
          x={center - avatarR}
          y={center - avatarR}
          width={avatarR * 2}
          height={avatarR * 2}
          clipPath="url(#pulse-orbit-avatar)"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <circle
          cx={center}
          cy={center}
          r={avatarR}
          fill={theme.surface}
          stroke={theme.border}
        />
      )}
      <circle
        cx={center}
        cy={center}
        r={avatarR}
        fill="none"
        stroke={theme.border}
        strokeWidth={1.5}
      />

      {nodes.map((node) => {
        const isHighlighted = highlightedKey === node.nameWithOwner;
        return (
        <a
          key={node.nameWithOwner}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            onNodeHover({
              repo: node,
              x: rect.left + rect.width / 2,
              y: rect.top,
            });
          }}
          onMouseLeave={() => onNodeHover(null)}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r={roundSvg(isHighlighted ? node.r + 2 : node.r)}
            fill={node.color}
            stroke={isHighlighted ? theme.text : theme.background}
            strokeWidth={isHighlighted ? 2 : 1.5}
            style={{ cursor: "pointer" }}
          />
        </a>
        );
      })}
    </svg>
  );
}

export function RepoOrbit({
  repos,
  avatarUrl,
  username,
  variant,
}: RepoOrbitProps) {
  const theme = useTheme();
  const [hover, setHover] = useState<{
    repo: RepoContribution;
    x: number;
    y: number;
  } | null>(null);

  const showTable = variant !== "compact";
  const size =
    variant === "compact" ? 140 : variant === "detailed" ? 240 : 188;
  const center = size / 2;
  const avatarR =
    variant === "compact" ? 18 : variant === "detailed" ? 30 : 24;
  const orbitR =
    variant === "compact" ? 48 : variant === "detailed" ? 88 : 68;
  const minNodeR = variant === "compact" ? 4 : 5;
  const maxNodeR =
    variant === "compact" ? 10 : variant === "detailed" ? 17 : 13;

  const sortedRepos = useMemo(
    () =>
      [...repos]
        .filter((r) => r.contributions > 0)
        .sort((a, b) => b.contributions - a.contributions),
    [repos]
  );

  const nodes = useMemo((): OrbitNode[] => {
    const sliced = sortedRepos.slice(0, MAX_NODES);
    if (sliced.length === 0) return [];
    const counts = sliced.map((r) => r.contributions);
    const minC = Math.min(...counts);
    const maxC = Math.max(...counts);
    const angles = nodeAngles(sliced.length);
    const ringR = effectiveOrbitR(orbitR, sliced.length);

    return sliced.map((repo, index) => {
      const angle = angles[index];
      const r = sizeRadius(
        repo.contributions,
        minC,
        maxC,
        minNodeR,
        maxNodeR
      );
      return {
        ...repo,
        x: roundSvg(center + Math.cos(angle) * ringR),
        y: roundSvg(center + Math.sin(angle) * ringR),
        r,
        color: repoColor(repo, theme.levels[4]),
      };
    });
  }, [
    sortedRepos,
    center,
    orbitR,
    minNodeR,
    maxNodeR,
    theme.levels,
  ]);

  const highlightedKey =
    hover?.repo?.nameWithOwner ?? null;

  if (nodes.length === 0) {
    return (
      <div
        className="flex h-full w-full items-center justify-center text-center text-xs"
        style={{ color: "var(--pulse-text-muted)" }}
      >
        No commit activity by repository in this period.
      </div>
    );
  }

  const handleTableHover = (repo: RepoContribution | null) => {
    if (!repo) {
      setHover(null);
      return;
    }
    setHover({ repo, x: 0, y: 0 });
  };

  if (!showTable) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <OrbitGraphic
          nodes={nodes}
          size={size}
          center={center}
          orbitR={orbitR}
          avatarR={avatarR}
          avatarUrl={avatarUrl}
          username={username}
          highlightedKey={highlightedKey}
          onNodeHover={setHover}
        />
        <OrbitTooltip
          repo={hover?.repo ?? null}
          x={hover?.x ?? 0}
          y={hover?.y ?? 0}
          visible={Boolean(hover && hover.x > 0)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full items-start gap-4">
      <div className="flex shrink-0 items-start justify-start self-start">
        <OrbitGraphic
          nodes={nodes}
          size={size}
          center={center}
          orbitR={orbitR}
          avatarR={avatarR}
          avatarUrl={avatarUrl}
          username={username}
          highlightedKey={highlightedKey}
          onNodeHover={setHover}
        />
      </div>

      <RepoOrbitTable
        repos={sortedRepos}
        highlightedKey={highlightedKey}
        onHover={handleTableHover}
        showStars={variant === "detailed"}
      />

      <OrbitTooltip
        repo={hover?.repo ?? null}
        x={hover?.x ?? 0}
        y={hover?.y ?? 0}
        visible={Boolean(hover && hover.x > 0)}
      />
    </div>
  );
}
