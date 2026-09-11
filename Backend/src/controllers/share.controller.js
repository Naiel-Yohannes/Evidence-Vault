const pool = require('../db')
const { error } = require('../utils/logger')
const { randomBytes, createHash } = require('crypto')
const fs = require('fs/promises')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '../../uploads')

const shareFinding = async (req, res) => {
  const findingId = req.params.findingId
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const finding = await client.query(
      `
      SELECT * FROM findings WHERE id = $1 AND user_id = $2
      `, [findingId, req.user.id]
    )

    if (finding.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Finding not found' })
    }

    const hash_token = randomBytes(32).toString('hex')

    const share = await client.query(
      `
      INSERT INTO share_link (finding_id, shared_by_user, token, expires_at) 
      VALUES ($1, $2, $3, $4) RETURNING *
      `, [findingId, req.user.id, hash_token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    )

    if (share.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(500).json({ error: 'Failed to create share link' })
    }

    await client.query(
      'INSERT INTO audit_logs(actor_user_id, action, target_type, target_id) VALUES($1, $2, $3, $4)',
      [req.user.id, 'share.created', 'share', share.rows[0].id]
    )

    await client.query('COMMIT')

    return res.status(200).json(share.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    error('Failed to share finding', err.message)
    return res.status(500).json({ error: 'Failed to share finding' })
  } finally {
    client.release()
  }
}  

const getSharedFInding = async (req, res) => {
  const token = req.params.token
  try {
    const result = await pool.query(
      `
      SELECT s.*, f.title, f.severity, f.description, f.remediation, f.status, f.created_at, f.updated_at
      FROM share_link s
      JOIN findings f ON s.finding_id = f.id
      WHERE s.token = $1
      `, [token]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'link not found' })
    }

    if (new Date() > new Date(result.rows[0].expires_at)) {
      return res.status(410).json({ error: 'Share link expired' })
    }

    const evidence = await pool.query(
      `
      SELECT * FROM evidence_files WHERE finding_id = $1
      `, [result.rows[0].finding_id]
    )

    res.status(200).json({
      title: result.rows[0].title,
      severity: result.rows[0].severity,
      description: result.rows[0].description,
      remediation: result.rows[0].remediation,
      status: result.rows[0].status,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      evidence: evidence.rows
    })
    
  } catch (err) {
    error('Failed to fetch shared finding', err.message)
    return res.status(500).json({ error: 'Failed to fetch shared finding' })
  }
}

const downloadSharedEvidence = async (req, res) => {
  const { token, fileId } = req.params
  try {
    const result = await pool.query(
      `
      SELECT s.*, f.title, f.severity, f.description, f.remediation, f.status
      FROM share_link s
      JOIN findings f ON s.finding_id = f.id
      WHERE s.token = $1
      `, [token]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'link not found' })
    }

    if (new Date() > new Date(result.rows[0].expires_at)) {
      return res.status(410).json({ error: 'Share link expired' })
    }

    const file = await pool.query(
      `
      SELECT * FROM evidence_files WHERE id = $1 AND finding_id = $2
      `, [fileId, result.rows[0].finding_id]
    )

    if (file.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence not found' })
    }

    const filePath = path.join(UPLOAD_DIR, file.rows[0].stored_filename)
    const fileBuffer = await fs.readFile(filePath)

    const hashToCompare = createHash('sha256').update(fileBuffer).digest('hex')

    if (hashToCompare !== file.rows[0].sha256_hash) {
      return res.status(500).json({ error: 'File integrity check failed' })
    }

    res.download(filePath, file.rows[0].original_filename)
  } catch (err) {
    error('Error downloading evidence', err.message)
    res.status(500).json({ error: 'Failed to download file' })
  }
}

module.exports = {
  shareFinding,
  getSharedFInding,
  downloadSharedEvidence
}