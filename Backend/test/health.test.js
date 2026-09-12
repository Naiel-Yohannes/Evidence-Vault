const supertest = require('supertest')
const app = require('../src/server')

const api = supertest(app)

test('health check', async () => {
  const result = await api.get('/api/health')
  expect(result.status).toBe(200)
  expect(result.body.status).toBe('ok')
})

afterAll(async () => {
  const pool = require('../src/db')
  await pool.end()
})