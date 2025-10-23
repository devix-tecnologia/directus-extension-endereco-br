export const testEnv = {
  DB_CLIENT: 'pg',
  DB_HOST: 'postgres',
  DB_NAME: 'directus',
  DB_USER: 'directus',
  DB_PASSWORD: 'directus',
  DIRECTUS_KEY: 'some-secret-key',
  DIRECTUS_SECRET: 'some-secret-secret',
  SECRET: 'your-secure-secret-here',
  DIRECTUS_ADMIN_EMAIL: 'admin@example.com',
  DIRECTUS_ADMIN_PASSWORD: 'password',
  DIRECTUS_PUBLIC_URL: 'http://localhost:8055',
  STORAGE_LOCAL_ROOT: '/directus/uploads',
} as const;

export function setupTestEnv(): () => void {
  const originalEnv = { ...process.env };
  Object.entries(testEnv).forEach(([key, value]) => {
    process.env[key] = value as string;
  });
  return () => {
    Object.keys(testEnv).forEach((key) => {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    });
  };
}
