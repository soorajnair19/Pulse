"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  ContributionPeriod,
  ThemeId,
  WidgetVariant,
  WidgetVisualization,
} from "@/types";
import {
  buildEmbedSnippet,
  getEmbedHeight,
  getProvider,
  getSiteOrigin,
  type ProviderId,
} from "@/lib/providers";
import { coercePeriodForProvider, parsePeriod } from "@/lib/period";
import { getTheme } from "@/lib/themes";
import {
  coerceVisualizationForProvider,
  parseVisualization,
} from "@/lib/visualizations";
import { ProviderSelect } from "./ProviderSelect";
import { UsernameForm } from "./UsernameForm";
import { OptionControls } from "./OptionControls";
import { PreviewFrame } from "./PreviewFrame";
import { WidgetActions } from "./WidgetActions";
import { EmbedCode } from "./EmbedCode";
import { PulseLogo } from "@/components/shared/PulseLogo";

function parseVariantParam(value: string | null): WidgetVariant {
  if (value === "compact" || value === "detailed" || value === "default") {
    return value;
  }
  return "default";
}

export function Playground() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [providerId, setProviderId] = useState<ProviderId>(() =>
    getProvider(searchParams.get("provider")).id
  );
  const [usernamesByProvider, setUsernamesByProvider] = useState<
    Partial<Record<ProviderId, string>>
  >(() => {
    const initial = searchParams.get("u") ?? "";
    if (!initial) return {};
    const id = getProvider(searchParams.get("provider")).id;
    return { [id]: initial };
  });
  const [activeByProvider, setActiveByProvider] = useState<
    Partial<Record<ProviderId, string>>
  >(() => {
    const initial = searchParams.get("u") ?? "";
    if (!initial) return {};
    const id = getProvider(searchParams.get("provider")).id;
    return { [id]: initial };
  });
  const usernameInput = usernamesByProvider[providerId] ?? "";
  const activeUsername = activeByProvider[providerId] ?? "";
  const [visualization, setVisualization] = useState<WidgetVisualization>(
    () =>
      parseVisualization(
        searchParams.get("visualization"),
        getProvider(searchParams.get("provider")).id
      )
  );
  const [variant, setVariant] = useState<WidgetVariant>(() =>
    parseVariantParam(searchParams.get("variant"))
  );
  const [period, setPeriod] = useState<ContributionPeriod>(() => {
    const provider = getProvider(searchParams.get("provider")).id;
    return parsePeriod(searchParams.get("period"), provider);
  });
  const [theme, setTheme] = useState<ThemeId>(() => {
    const fromUrl = searchParams.get("theme");
    return getTheme(fromUrl).id;
  });
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [previewReady, setPreviewReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const provider = useMemo(() => getProvider(providerId), [providerId]);
  const handlePreviewLoadChange = useCallback((loaded: boolean) => {
    setPreviewReady(loaded);
  }, []);

  useEffect(() => {
    setOrigin(getSiteOrigin());
  }, []);

  const syncUrl = useCallback(
    (next: {
      provider: ProviderId;
      username: string;
      visualization: WidgetVisualization;
      variant: WidgetVariant;
      period: ContributionPeriod;
      theme: ThemeId;
    }) => {
      const params = new URLSearchParams();
      params.set("provider", next.provider);
      if (next.username) params.set("u", next.username);
      params.set("visualization", next.visualization);
      params.set("variant", next.variant);
      params.set("period", next.period);
      params.set("theme", next.theme);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const embedOptions = useMemo(
    () => ({ variant, period, theme, visualization }),
    [variant, period, theme, visualization]
  );

  const embedPath =
    activeUsername.length > 0
      ? provider.buildEmbedPath(activeUsername, embedOptions)
      : null;

  const previewSrc = embedPath ? embedPath : null;
  const height = getEmbedHeight(provider, variant, visualization);

  const embedCode =
    origin && embedPath
      ? buildEmbedSnippet(origin, embedPath, height)
      : null;

  function handleGenerate() {
    const validationError = provider.validateUsername(usernameInput);
    if (validationError) {
      setError(validationError);
      setActiveByProvider((prev) => ({ ...prev, [providerId]: "" }));
      return;
    }

    const trimmed = usernameInput.trim();
    setError(null);
    setActiveByProvider((prev) => ({ ...prev, [providerId]: trimmed }));
    syncUrl({
      provider: providerId,
      username: trimmed,
      visualization,
      variant,
      period,
      theme,
    });
  }

  function handleProviderChange(id: ProviderId) {
    setProviderId(id);
    setError(null);
    const nextPeriod = coercePeriodForProvider(period, id);
    const nextVisualization = coerceVisualizationForProvider(
      visualization,
      id
    );
    setPeriod(nextPeriod);
    setVisualization(nextVisualization);
    syncUrl({
      provider: id,
      username: activeByProvider[id] ?? "",
      visualization: nextVisualization,
      variant,
      period: nextPeriod,
      theme,
    });
  }

  function handleVisualizationChange(next: WidgetVisualization) {
    setVisualization(next);
    syncUrl({
      provider: providerId,
      username: activeUsername,
      visualization: next,
      variant,
      period,
      theme,
    });
  }

  function handleVariantChange(next: WidgetVariant) {
    setVariant(next);
    syncUrl({
      provider: providerId,
      username: activeUsername,
      visualization,
      variant: next,
      period,
      theme,
    });
  }

  function handlePeriodChange(next: ContributionPeriod) {
    setPeriod(next);
    syncUrl({
      provider: providerId,
      username: activeUsername,
      visualization,
      variant,
      period: next,
      theme,
    });
  }

  function handleThemeChange(next: ThemeId) {
    setTheme(next);
    syncUrl({
      provider: providerId,
      username: activeUsername,
      visualization,
      variant,
      period,
      theme: next,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight text-[#e6edf3] sm:text-5xl">
          <PulseLogo accent={provider.heatmapAccent} />
          Pulse
        </h1>
        <p className="text-base text-[#7d8590]">
          Embeddable activity widgets as grids.
        </p>
      </header>

      <section className="flex flex-col gap-6 rounded-xl border border-[#30363d] bg-[#161b22]/60 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#7d8590]">
            Provider
          </p>
          <ProviderSelect value={providerId} onChange={handleProviderChange} />
        </div>

        <UsernameForm
          provider={provider}
          value={usernameInput}
          error={error}
          onChange={(value) => {
            setUsernamesByProvider((prev) => ({ ...prev, [providerId]: value }));
            if (error) setError(null);
          }}
          onSubmit={handleGenerate}
        />

        <OptionControls
          providerId={providerId}
          visualization={visualization}
          variant={variant}
          period={period}
          theme={theme}
          onVisualizationChange={handleVisualizationChange}
          onVariantChange={handleVariantChange}
          onPeriodChange={handlePeriodChange}
          onThemeChange={handleThemeChange}
        />
      </section>

      <PreviewFrame
        ref={iframeRef}
        cacheKey={providerId}
        src={previewSrc}
        height={height}
        title={`${provider.label} widget preview`}
        onLoadChange={handlePreviewLoadChange}
      />

      <WidgetActions
        code={embedCode}
        filename={`pulse-${providerId}-${(activeUsername || "widget").replace(/[^a-zA-Z0-9._-]/g, "_")}.png`}
        iframeRef={iframeRef}
        canDownload={Boolean(previewSrc) && previewReady}
      />

      <EmbedCode code={embedCode} />
    </div>
  );
}
