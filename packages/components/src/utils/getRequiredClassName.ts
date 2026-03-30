export function getRequiredClassName(
  styles: Record<string, string | undefined>,
  className: string
): string {
  const resolvedClassName = styles[className];

  if (!resolvedClassName) {
    throw new Error(`Missing CSS module class: ${className}`);
  }

  return resolvedClassName;
}
