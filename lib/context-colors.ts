export const CONTEXT_COLORS = [
  { bg: "#FDE8D8", text: "#3D2C20", band: "#F0956A" }, // apricot wash
  { bg: "#D8EDE6", text: "#1E3D30", band: "#7BBFAA" }, // sage wash
  { bg: "#E8DCEE", text: "#2E1E40", band: "#B8A4D8" }, // lavender wash
  { bg: "#FDF4DC", text: "#3D2C10", band: "#F4D080" }, // yellow wash
] as const;

export function getContextColor(priority: number) {
  return CONTEXT_COLORS[(priority - 1) % CONTEXT_COLORS.length];
}
