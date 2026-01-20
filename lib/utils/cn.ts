/**
 * Utility function to merge className strings
 * Useful for conditional CSS classes with Tailwind CSS
 */

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter((cls) => typeof cls === 'string' && cls.length > 0)
    .join(' ');
}
