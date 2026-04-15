// Runs after setupFiles - MSW, mocks that need Jest to be ready
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';

const { setupServer } = require('msw/node');
const { handlers } = require('./__tests__/mocks/handlers');

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
