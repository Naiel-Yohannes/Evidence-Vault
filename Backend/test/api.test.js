const supertest = require('supertest')
const app = require('../src/server')
const pool = require('../src/db')
const path = require('path')

const api = supertest(app)

afterAll(async () => {
  await pool.end()
})

describe('User registration and login', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM users')
  })

  test('Registration', async () => {
    const newUser = {
      username: 'testuser',
      name: 'tester',
      password: 'Password123?'
    }

    await api
      .post('/api/auth/register')
      .send(newUser)
      .expect(201)
  })

  test('Login', async () => {
    await api
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        name: 'tester',
        password: 'Password123?'
      })

    const loginCredentials = {
      username: 'testuser',
      password: 'Password123?'
    }

    const result = await api
      .post('/api/auth/login')
      .send(loginCredentials)
      .expect(200)

    expect(result.body.token).toBeDefined()
    expect(result.body.name).toBe('tester')
  })
})

describe('Creating, updating and deleting findings', () => {
  let token = null
  beforeEach(async () => {
    await pool.query('DELETE FROM findings')
    await pool.query('DELETE FROM users')
    await api.post('/api/auth/register').send({
      username: 'testuser',
      name: 'tester',
      password: 'Password123?'
    })

    const loginCredentials = {
      username: 'testuser',
      password: 'Password123?'
    }

    const user = await api.post('/api/auth/login')
      .send(loginCredentials)
      .expect(200)

    token = user.body.token
  })

  test('Add new finding', async () => {
    const finding = {
      title: 'Test finding',
      description: 'This is a test finding',
      severity: 'High',
      remediation: 'Fix this issue',
      status: 'Open'
    }

    const result = await api
      .post('/api/findings')
      .set('Authorization', `Bearer ${token}`)
      .send(finding)
      .expect(200)

    expect(result.body.title).toBe(finding.title)
  })

  test('Update finding', async () => {
    const finding = {
      title: 'Test finding',
      description: 'This is a test finding',
      severity: 'High',
      remediation: 'Fix this issue',
      status: 'Open'
    }

    const newFinding = await api
      .post('/api/findings')
      .set('Authorization', `Bearer ${token}`)
      .send(finding)
      .expect(200)

    const updatedFinding = {
      title: 'Test finding',
      description: 'This is a test finding',
      severity: 'High',
      remediation: 'Fix this issue',
      status: 'Resolved'
    }

    const result = await api
      .patch(`/api/findings/${newFinding.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedFinding)
      .expect(200)

    expect(result.body.title).toBe(finding.title)
    expect(result.body.status).toBe(updatedFinding.status)
  })

  test('Delete finding', async () => {
    const finding = {
      title: 'Test finding',
      description: 'This is a test finding',
      severity: 'High',
      remediation: 'Fix this issue',
      status: 'Open'
    }

    const newFinding = await api
      .post('/api/findings')
      .set('Authorization', `Bearer ${token}`)
      .send(finding)
      .expect(200)

    await api
      .delete(`/api/findings/${newFinding.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})

describe('Uplading and downloads test', () => {
  let token = null
  let findingId = null
  beforeEach(async () => {
    await pool.query('DELETE FROM evidence_files')
    await pool.query('DELETE FROM findings')
    await pool.query('DELETE FROM users')

    await api.post('/api/auth/register').send({
      username: 'testuser',
      name: 'tester',
      password: 'Password123?'
    })

    const loginCredentials = {
      username: 'testuser',
      password: 'Password123?'
    }

    const user = await api.post('/api/auth/login')
      .send(loginCredentials)
      .expect(200)

    token = user.body.token

    const finding = await api
      .post('/api/findings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test finding',
        description: 'This is a test finding',
        severity: 'High',
        remediation: 'Fix this issue',
        status: 'Open'
      })
      .expect(200)

      findingId = finding.body.id
  })


  test('Upload file', async () => {
    await api
    .post(`/api/findings/${findingId}/evidence`)
    .set('Authorization', `Bearer ${token}`)
    .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
    .expect(201)
  })

  test('Unauthorized upload', async () => {
    await api
    .post(`/api/findings/${findingId}/evidence`)
    .set('Authorization', `Bearer WrongToken`)
    .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
    .expect(401)
  })

  test('Upload not found', async () => {
    await api
    .post(`/api/findings/99999/evidence`)
    .set('Authorization', `Bearer ${token}`)
    .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
    .expect(404)
  })

  test('Download file', async () => {
    const upload = await api
    .post(`/api/findings/${findingId}/evidence`)
    .set('Authorization', `Bearer ${token}`)
    .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
    .expect(201)

    const fileId = upload.body.id

    await api
    .get(`/api/findings/${findingId}/evidence/${fileId}/download`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  })

  test('Download unauthorized', async () => {
    const upload = await api
    .post(`/api/findings/${findingId}/evidence`)
    .set('Authorization', `Bearer ${token}`)
    .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
    .expect(201)

    const fileId = upload.body.id

    await api
    .get(`/api/findings/${findingId}/evidence/${fileId}/download`)
    .set('Authorization', `Bearer WrongToken`)
    .expect(401)
  })

  test('Download not found', async () => {
    await api
    .get(`/api/findings/${findingId}/evidence/99999/download`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
  })

  test('delete file', async () => {
    const upload = await api
    .post(`/api/findings/${findingId}/evidence`)
    .set('Authorization', `Bearer ${token}`)
    .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
    .expect(201)

    const fileId = upload.body.id

    await api
    .delete(`/api/evidence/${fileId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  })
})

describe('Sharering finding', () => {
  let token = null
  let findingId = null
  let otherToken = null
  let otherFindingId = null

  beforeEach(async () => {
    await pool.query('DELETE FROM share_link')
    await pool.query('DELETE FROM findings')
    await pool.query('DELETE FROM users')

    await api.post('/api/auth/register').send({
      username: 'testuser',
      name: 'tester',
      password: 'Password123?'
    })

    const user = await api.post('/api/auth/login')
      .send({ username: 'testuser', password: 'Password123?' })
      .expect(200)

    token = user.body.token

    const finding = await api
      .post('/api/findings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test finding',
        description: 'This is a test finding',
        severity: 'High',
        remediation: 'Fix this issue',
        status: 'Open'
      })
      .expect(200)

    findingId = finding.body.id

    await api.post('/api/auth/register').send({
      username: 'otheruser',
      name: 'other',
      password: 'Password123?'
    })

    const otherUser = await api.post('/api/auth/login')
      .send({ username: 'otheruser', password: 'Password123?' })
      .expect(200)

    otherToken = otherUser.body.token

    const otherFinding = await api
      .post('/api/findings')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        title: 'Other finding',
        description: 'Another test finding',
        severity: 'Medium',
        remediation: 'Fix other issue',
        status: 'Open'
      })
      .expect(200)

    otherFindingId = otherFinding.body.id
  })

  test('Create share link', async () => {
    const result = await api
      .post(`/api/finding/share/${findingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(result.body.token).toBeDefined()
  })

  test('Share link unauthorized', async () => {
    await api
      .post(`/api/finding/share/${otherFindingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('Access shared finding without auth', async () => {
    const share = await api
      .post(`/api/finding/share/${findingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    await api
      .get(`/api/shared/${share.body.token}`)
      .expect(200)
  })

  test('Expired share link', async () => {
    const share = await api
      .post(`/api/finding/share/${findingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    await pool.query(
      'UPDATE share_link SET expires_at = NOW() - INTERVAL \'1 day\' WHERE token = $1',
      [share.body.token]
    )

    await api
      .get(`/api/shared/${share.body.token}`)
      .expect(410)
  })

  test('Download evidence via share', async () => {
    const upload = await api
      .post(`/api/findings/${findingId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
      .expect(201)

    const share = await api
      .post(`/api/finding/share/${findingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    await api
      .get(`/api/finding/evidence/download/${share.body.token}/${upload.body.id}`)
      .expect(200)
  })

  test('Download evidence from wrong finding', async () => {
    const upload = await api
      .post(`/api/findings/${findingId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
      .expect(201)

    const otherUpload = await api
      .post(`/api/findings/${otherFindingId}/evidence`)
      .set('Authorization', `Bearer ${otherToken}`)
      .attach('evidence', path.join(__dirname, 'fixtures', 'Screenshot_20260912_193004.png'))
      .expect(201)

    const share = await api
      .post(`/api/finding/share/${findingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    await api
      .get(`/api/finding/evidence/download/${share.body.token}/${otherUpload.body.id}`)
      .expect(404)
  })
})
