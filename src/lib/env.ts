/**
 * Type-safe environment variable validation
 *
 * Add your environment variables here and they will be validated at build time.
 * Access them via `env.VARIABLE_NAME` for type safety.
 */

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

function getEnvVarOptional(key: string): string | undefined {
  return process.env[key];
}

/**
 * Server-side environment variables
 * These are only available on the server
 */
export const serverEnv = {
  NODE_ENV: getEnvVar("NODE_ENV", false) || "development",
  // Add server-only environment variables here
  // Example: DATABASE_URL: getEnvVar("DATABASE_URL"),
};

/**
 * Client-side environment variables
 * These must be prefixed with NEXT_PUBLIC_ to be exposed to the browser
 */
export const clientEnv = {
  // Add client-side environment variables here
  // Example: NEXT_PUBLIC_API_URL: getEnvVar("NEXT_PUBLIC_API_URL"),
};

/**
 * Combined environment object for convenience
 */
export const env = {
  ...serverEnv,
  ...clientEnv,
};
