import { TextField, TextFieldProps } from "@mui/material";
import { portalFieldSx } from "../domain/portal-theme";

/**
 * TextField with the portal dark-form styling applied by default.
 *
 * @param props - MUI TextField props passed through to the underlying field.
 * @returns Styled MUI TextField.
 */
export function PortalTextField({ sx, ...props }: TextFieldProps) {
  return <TextField {...props} sx={[portalFieldSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} />;
}
