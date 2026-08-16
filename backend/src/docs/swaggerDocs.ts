import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NexusAnalytics REST API Suite',
    version: '1.0.0',
    description: 'Enterprise Financial & Crypto Portfolio Intelligence Platform API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Alex Developer' },
                  email: { type: 'string', example: 'alex@example.com' },
                  password: { type: 'string', example: 'SecurePassword123!' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'User registered successfully' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user & issue JWT tokens',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'alex@example.com' },
                  password: { type: 'string', example: 'SecurePassword123!' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Login successful' } },
      },
    },
    '/portfolios': {
      get: {
        summary: 'List user portfolios with live P&L calculations',
        responses: { 200: { description: 'Portfolios list' } },
      },
      post: {
        summary: 'Create a new portfolio',
        responses: { 201: { description: 'Portfolio created' } },
      },
    },
    '/market/coins': {
      get: {
        summary: 'Get top cryptocurrency prices and market data',
        responses: { 200: { description: 'Market data list' } },
      },
    },
    '/analytics/portfolio/{portfolioId}/ai-insights': {
      get: {
        summary: 'Get AI-driven portfolio risk and optimization insights',
        parameters: [
          { name: 'portfolioId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'AI Insights generated' } },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
