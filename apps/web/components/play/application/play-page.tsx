"use client";

import { useLanguageStore } from "../../../stores/language-store";
import { FeaturePlaceholderPage } from "../../shared/ui/feature-placeholder-page";

/**
 * Renders the future game section placeholder.
 *
 * @returns Play page with localized copy and game artwork.
 */
export function PlayPage() {
  const t = useLanguageStore((state) => state.t);

  return (
    <FeaturePlaceholderPage
      actionLabel={t.backToChat}
      backgroundUrl="/assets/imgs/game-bg.png"
      body={t.playPlaceholderBody}
      eyebrow={t.play}
      title={t.playPlaceholderTitle}
    />
  );
}
