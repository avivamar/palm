/**
 * Utility functions for admin package
 */

type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;
type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) {
      continue;
    }

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (typeof input === 'object') {
      if (Array.isArray(input)) {
        const nestedClass = clsx(...input);
        if (nestedClass) {
          classes.push(nestedClass);
        }
      } else {
        for (const key in input) {
          if (input[key]) {
            classes.push(key);
          }
        }
      }
    }
  }

  return classes.join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
