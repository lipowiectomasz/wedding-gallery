import '@testing-library/jest-dom/vitest';

process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??= 'http://localhost:8443/v1';
process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ??= 'test-project-id';
