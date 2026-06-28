/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck - Bypassing checks for template compilation checks
/**
 * Replaces mustache-style variables in a string with values from a context object.
 * Supported format: {{entity.field}}
 * 
 * @param template The string containing variables
 * @param context The object containing data (e.g., { patient: { name: 'John' } })
 * @returns The string with variables replaced
 */
export const replaceVariables = (template: string, context: Record<string, any>): string => {
    if (!template) return '';

    return template.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
        const value = path.split('.').reduce((obj: any, key: string) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
        }, context);

        return value !== undefined ? String(value) : match;
    });
};

/**
 * Validates a template string to check if all variables exist in the provided context structure.
 * Returns a list of missing variables.
 */
export const validateVariables = (template: string, sampleContext: Record<string, any>): string[] => {
    const matches = template.match(/\{\{([\w.]+)\}\}/g) || [];
    const missing: string[] = [];

    matches.forEach(match => {
        const path = match.slice(2, -2); // Remove {{ and }}
        const value = path.split('.').reduce((obj: any, key: string) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
        }, sampleContext);

        if (value === undefined) {
            missing.push(path);
        }
    });

    return missing;
};
