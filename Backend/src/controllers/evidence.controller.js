const pool = require('../db')
const { fileTypeFromBuffer } = require('file-type')
const sharp = require('sharp')
const { randomUUID } = require('crypto')
const path = require('path')
const fs = require('fs/promises')
const { error } = require('../utils/logger')

const ALLOWED_TYPE = ['image/jpeg', 'image/png', 'image/webp']
const UPLOAD_DIR = path.join(__dirname, '../../uploads')

const downloadEvidence = async (req, res) => {
  const findingId = req.params.findingId
  const fileId = req.params.fileId

  if (!/^\d+$/.test(findingId) || !/^\d+$/.test(fileId)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  try{
    const finding = await pool.query(
      `
      SELECT * FROM findings WHERE id = $1 AND user_id = $2
      `, [findingId, req.user.id]
    )

    if(finding.rows.length === 0) {
      return res.status(404).json({error: 'Finding not found'})
    }

    const file = await pool.query(
      `
      SELECT * FROM evidence_files WHERE id = $1 AND finding_id = $2
      `, [fileId, finding.rows[0].id]
    )

    if(file.rows.length === 0) {
      return res.status(404).json({error: 'Evidence not found'})
    }

    const evidence = file.rows[0]
    const filePath = path.join(UPLOAD_DIR, evidence.stored_filename)

    res.download(filePath, evidence.original_filename)
  } catch (err){
    error('Error downloading evidence', err.message)
    res.status(500).json({error: 'Failed to download file'})
  }
}

const uploadEvidence = async (req, res) => {
  const findingId = req.params.findingId

  if (!/^\d+$/.test(findingId)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const file = req.file

    if (!file) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const result = await client.query(
      `
      SELECT * FROM findings WHERE id = $1 AND user_id = $2
      `, [findingId, req.user.id]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Finding not found' })
    }

    const detect = await fileTypeFromBuffer(file.buffer)
    if (!detect || !ALLOWED_TYPE.includes(detect.mime)) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Invalid file type' })
    }

    const clearBuffer = await sharp(file.buffer).resize({ width: 1920, withoutEnlargement: true }).png().toBuffer()

    const storageFilename = `${randomUUID()}.png`
    await fs.writeFile(path.join(UPLOAD_DIR, storageFilename), clearBuffer)

    const evidence = await client.query(
      `
      INSERT INTO evidence_files (finding_id, user_id, original_filename, stored_filename, mime_type, size_bytes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `, [findingId, req.user.id, file.originalname, storageFilename, 'image/png', clearBuffer.length]
    )

    await client.query(
      'INSERT INTO audit_logs(actor_user_id, action, target_type, target_id) VALUES($1, $2, $3, $4)',
      [req.user.id, 'evidence.uploaded', 'evidence', evidence.rows[0].id]
    )

    await client.query('COMMIT')

    return res.status(201).json(evidence.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    error('Error uploading evidence', err.message)
    return res.status(500).json({ error: 'Upload failed' })
  } finally {
    client.release()
  }
}

const listEvidence = async (req, res) => {
  const findingId = req.params.findingId

  if (!/^\d+$/.test(findingId)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  try {
    const result = await pool.query(
      `
      SELECT * FROM findings WHERE id = $1 AND user_id = $2
      `, [findingId, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finding not found' })
    }

    const evidence = await pool.query(
      `
      SELECT * FROM evidence_files WHERE finding_id = $1
      `, [findingId]
    )

    res.json(evidence.rows)
  } catch (err) {
    error('Error fetching evidence', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const deleteEvidence = async (req, res) => {
  const evidenceId = req.params.evidenceId

  if (!/^\d+$/.test(evidenceId)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `SELECT * FROM evidence_files WHERE id = $1 AND user_id = $2`,
      [evidenceId, req.user.id]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Evidence not found' })
    }

    const filePath = path.join(UPLOAD_DIR, result.rows[0].stored_filename)
    await fs.unlink(filePath).catch((err) => {
      error('Failed to delete evidence file from disk', err.message)
    })

    await client.query(
      `
      DELETE FROM evidence_files WHERE id = $1
      `, [evidenceId]
    )

    await client.query(
      'INSERT INTO audit_logs(actor_user_id, action, target_type, target_id) VALUES($1, $2, $3, $4)',
      [req.user.id, 'evidence.deleted', 'evidence', evidenceId]
    )

    await client.query('COMMIT')

    res.json({ message: 'Evidence deleted successfully' })
  } catch (err) {
    await client.query('ROLLBACK')
    error('Error deleting evidence', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  } finally {
    client.release()
  }
}

module.exports = { uploadEvidence, listEvidence, deleteEvidence, downloadEvidence }