"use client";

import { useLanguageStore } from "../../../stores/language-store";
import { FeaturePlaceholderPage } from "../../shared/ui/feature-placeholder-page";

/**
 * Renders the future shop section placeholder.
 *
 * @returns Shop page with localized copy and shop artwork.
 */
export function ShopPage() {
  const t = useLanguageStore((state) => state.t);

  return (
    <FeaturePlaceholderPage
      actionLabel={t.backToChat}
      backgroundUrl="/assets/imgs/shop-bg.png"
      body={t.shopPlaceholderBody}
      eyebrow={t.shop}
      title={t.shopPlaceholderTitle}
    />
  );
}
