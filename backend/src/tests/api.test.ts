import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('NexusAnalytics API Suite Tests', () => {
  it('GET /health should return HEALTHY status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.service).toBe('NexusAnalytics API Service');
  });

  it('GET /api/market/coins should return list of top cryptocurrency market data', async () => {
    const res = await request(app).get('/api/market/coins?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/auth/register should validate invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
