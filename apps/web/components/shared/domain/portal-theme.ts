/** Shared portal colors used by lightweight UI primitives. */
export const portalColors = {
  accent: "#60a5fa",
  accentSoft: "#7dd3fc",
  gold: "#f0b35f",
  panelText: "#e5edf7",
  textMuted: "#8ca3ba",
  textStrong: "#f8fbff",
} as const;

/** Base panel surface used across feature pages. */
export const portalPanelSx = {
  bgcolor: "rgba(4, 15, 28, 0.78)",
  border: "1px solid rgba(96, 165, 250, 0.18)",
  borderRadius: 1,
  boxShadow: "0 22px 60px rgba(0, 0, 0, 0.28)",
  color: portalColors.panelText,
};

/** Denser panel surface for list cards and compact management sections. */
export const portalCompactPanelSx = {
  ...portalPanelSx,
  border: "1px solid rgba(96, 165, 250, 0.16)",
  boxShadow: "0 18px 46px rgba(0, 0, 0, 0.24)",
};

/** Shared MUI field styling for dark portal forms. */
export const portalFieldSx = {
  "& .MuiInputBase-input": {
    color: portalColors.panelText,
  },
  "& .MuiInputLabel-root": {
    color: portalColors.textMuted,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: portalColors.accent,
  },
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(2, 8, 18, 0.38)",
    "& fieldset": {
      borderColor: "rgba(148, 163, 184, 0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(96, 165, 250, 0.42)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(96, 165, 250, 0.72)",
    },
  },
};

/** Shared primary button style for portal actions. */
export const portalPrimaryButtonSx = {
  bgcolor: "#1d4ed8",
  fontWeight: 800,
  textTransform: "none",
  "&:hover": {
    bgcolor: "#2563eb",
  },
};

/** Shared outlined button style for secondary portal actions. */
export const portalOutlinedButtonSx = {
  borderColor: "rgba(96, 165, 250, 0.35)",
  color: "#bfdbfe",
  fontWeight: 800,
  textTransform: "none",
};

/** Shared text button style for quiet actions. */
export const portalTextButtonSx = {
  color: portalColors.accentSoft,
  fontWeight: 800,
  textTransform: "none",
};
