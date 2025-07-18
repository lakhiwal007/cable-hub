import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes and limits text input values
 * @param value - The input value to sanitize
 * @param maxLength - Maximum length (default: 250)
 * @param allowedChars - Regex pattern for allowed characters (default: alphanumeric, comma, period, space)
 * @returns Sanitized string
 */
export function sanitizeTextInput(
  value: string, 
  maxLength: number = 250, 
  allowedChars: string = '[^a-zA-Z0-9,.\\- ]'
): string {
  return value.replace(new RegExp(allowedChars, 'g'), '').slice(0, maxLength);
}

/**
 * Sanitizes text input allowing additional characters like hyphens
 * @param value - The input value to sanitize
 * @param maxLength - Maximum length (default: 250)
 * @returns Sanitized string
 */
export function sanitizeTextInputWithHyphens(
  value: string, 
  maxLength: number = 250
): string {
  return sanitizeTextInput(value, maxLength, '[^a-zA-Z0-9,.\\- ]');
}
