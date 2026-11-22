export function buyerBackTarget(pathname: string): "/" | "/buyer/properties" {
  return pathname === "/buyer" || pathname === "/buyer/" || pathname === "/buyer/properties"
    ? "/"
    : "/buyer/properties";
}