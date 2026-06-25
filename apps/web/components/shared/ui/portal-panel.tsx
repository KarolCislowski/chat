import { Paper, PaperProps } from "@mui/material";
import { ElementType, FormEventHandler } from "react";
import { portalPanelSx } from "../domain/portal-theme";

type PortalPanelProps = Omit<PaperProps, "onSubmit"> & {
  /** Optional component override, such as form or section. */
  component?: ElementType;
  /** Form submit handler when the panel is rendered as a form. */
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

/**
 * Portal-styled Paper surface for feature cards, forms, and management panels.
 *
 * @param props - MUI Paper props passed through to the underlying component.
 * @returns Dark portal panel surface.
 */
export function PortalPanel({ sx, ...props }: PortalPanelProps) {
  return <Paper {...(props as any)} sx={[portalPanelSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} />;
}
