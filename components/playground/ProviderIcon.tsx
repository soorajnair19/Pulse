import type { ProviderId } from "@/lib/providers";

type ProviderIconProps = {
  id: ProviderId;
  className?: string;
};

const ICON_SRC: Record<ProviderId, string> = {
  github: "/providers/github.svg",
  figma: "/providers/figma.svg",
  goodreads: "/providers/goodreads.svg",
  letterboxd: "/providers/letterboxd.svg",
};

export function ProviderIcon({ id, className }: ProviderIconProps) {
  return (
    // Brand marks under /public/providers
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ICON_SRC[id]}
      alt=""
      width={14}
      height={14}
      className={className}
      draggable={false}
    />
  );
}
