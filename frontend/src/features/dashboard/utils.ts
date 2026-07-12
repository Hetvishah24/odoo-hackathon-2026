/** "fleet_manager" -> "Fleet Manager". Works for any future role with zero changes here. */
export function formatRoleLabel(role: string | null): string {
  if (!role) return "—";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
