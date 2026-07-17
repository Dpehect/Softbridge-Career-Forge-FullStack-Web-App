export const PROTECTED_WORKSPACE_PATHS = [
  "/account",
  "/coach",
  "/dashboard",
  "/forge",
  "/jobs",
  "/paths",
  "/resume",
] as const;

export function isProtectedWorkspacePath(pathname: string): boolean {
  return PROTECTED_WORKSPACE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
