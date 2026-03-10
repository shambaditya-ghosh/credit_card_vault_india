/**
 * CardVault India — API Integration Tests
 */

process.env.NODE_ENV   = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_jest_testing';

const request = require('supertest');
const app     = require('../server');

describe('🏥 Health Check', () => {
  it('GET /health → 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('CardVault India API');
  });
});

describe('📡 API Root', () => {
  it('GET /api/v1 → returns endpoints list', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.statusCode).toBe(200);
    expect(res.body.endpoints).toBeDefined();
  });
});

describe('💳 Cards API', () => {
  it('GET /api/v1/cards → returns paginated cards', async () => {
    const res = await request(app).get('/api/v1/cards');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/v1/cards?bank=hdfc → filters by bank', async () => {
    const res = await request(app).get('/api/v1/cards?bank=hdfc');
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(c => expect(c.bankSlug).toBe('hdfc'));
  });

  it('GET /api/v1/cards/featured → returns featured cards', async () => {
    const res = await request(app).get('/api/v1/cards/featured');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/cards/:id → returns single card', async () => {
    const res = await request(app).get('/api/v1/cards/hdfc-infinia-metal');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe('hdfc-infinia-metal');
    expect(res.body.data.fees).toBeDefined();
    expect(res.body.data.rewards).toBeDefined();
    expect(res.body.data.lounge).toBeDefined();
  });

  it('GET /api/v1/cards/invalid-id → 404', async () => {
    const res = await request(app).get('/api/v1/cards/nonexistent-card');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/cards/:id/similar → returns similar cards', async () => {
    const res = await request(app).get('/api/v1/cards/hdfc-infinia-metal/similar');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe('🏦 Banks API', () => {
  it('GET /api/v1/banks → returns all banks', async () => {
    const res = await request(app).get('/api/v1/banks');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/banks/hdfc → returns HDFC with cards', async () => {
    const res = await request(app).get('/api/v1/banks/hdfc');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.cards).toBeInstanceOf(Array);
  });
});

describe('⚖️ Comparison API', () => {
  it('GET /api/v1/compare?ids=... → returns comparison matrix', async () => {
    const res = await request(app).get('/api/v1/compare?ids=hdfc-infinia-metal,axis-atlas');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.matrix).toBeDefined();
    expect(res.body.data.cards.length).toBe(2);
  });

  it('GET /api/v1/compare (no ids) → 400', async () => {
    const res = await request(app).get('/api/v1/compare');
    expect(res.statusCode).toBe(400);
  });
});

describe('🔍 Search API', () => {
  it('GET /api/v1/search?q=infinia → finds HDFC Infinia', async () => {
    const res = await request(app).get('/api/v1/search?q=infinia');
    expect(res.statusCode).toBe(200);
    expect(res.body.results.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/search?q=a → 400 (too short)', async () => {
    const res = await request(app).get('/api/v1/search?q=a');
    expect(res.statusCode).toBe(400);
  });
});

describe('✅ Eligibility API', () => {
  it('POST /api/v1/eligibility → returns recommended cards', async () => {
    const res = await request(app)
      .post('/api/v1/eligibility')
      .send({ monthlyIncome: 75000, employmentType: 'salaried', cibilScore: 760 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.eligible).toBeInstanceOf(Array);
    expect(res.body.summary.eligibleCards).toBeGreaterThan(0);
  });

  it('POST /api/v1/eligibility (invalid data) → 422', async () => {
    const res = await request(app)
      .post('/api/v1/eligibility')
      .send({ monthlyIncome: 'not_a_number' });
    expect(res.statusCode).toBe(422);
  });
});

describe('📋 Applications API', () => {
  it('POST /api/v1/applications → submits application', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .send({
        firstName: 'Rahul', lastName: 'Sharma',
        email: 'rahul@test.com', mobile: '9876543210',
        panCard: 'ABCDE1234F', employmentType: 'salaried',
        monthlyIncome: 100000, city: 'Mumbai',
        cardId: 'hdfc-regalia-gold', monthlySpend: 50000,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBeDefined();
  });

  it('POST /api/v1/applications (bad PAN) → 422', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .send({ firstName: 'Test', panCard: 'INVALID' });
    expect(res.statusCode).toBe(422);
  });
});

describe('🔐 Auth API', () => {
  const testUser = {
    firstName: 'Test', lastName: 'User',
    email: `test_${Date.now()}@cardvault.in`,
    password: 'SecurePass@123', mobile: '9123456789',
  };
  let token;

  it('POST /api/v1/auth/register → registers user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it('POST /api/v1/auth/login → logs in', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('GET /api/v1/auth/profile (no token) → 401', async () => {
    const res = await request(app).get('/api/v1/auth/profile');
    expect(res.statusCode).toBe(401);
  });
});
