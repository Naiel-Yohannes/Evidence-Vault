const pool = require('../db')
const {error} = require('../utils/logger')
const path = require('path')
const fs = require('fs/promises')

const UPLOAD_DIR = path.join(__dirname, '../../uploads')

const SEVERITY = ["Low", "Medium", "High", "Critical"]
const STATUS = ["Open", "Resolved"]

const getFindings = async (req, res) => {
  try{
    const findings = await pool.query(
      `
      SELECT * FROM findings WHERE user_id = $1
      `, [req.user.id]
    )

    res.json(findings.rows)
  }catch(err){
    error('Error fetching findings', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const getFinding = async(req, res) => {
  const id = req.params.id

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  try{
    const finding = await pool.query(
      `
      SELECT * FROM findings WHERE id = $1 AND user_id = $2
      `, [id, req.user.id]
    )

    if(finding.rows.length === 0){
      return res.status(404).json({error: 'Finding not found'})
    }

    res.json(finding.rows[0])
  }catch(err){
    error('Error fetching finding', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const createFinding = async(req, res) => {
  const {title, description, severity, remediation, status} = req.body
  const client = await pool.connect()

  try{
    await client.query('BEGIN')

    if(!title || !description || !severity || !remediation || !status){
      return res.status(400).json({error: 'Title, description and severity are required'})
    }

    if(!SEVERITY.includes(severity)){
      return res.status(400).json({error: 'Invalid severity level'})
    }

    if(!STATUS.includes(status)){
      return res.status(400).json({error: 'Invalid status'})
    }

    if(title.length > 50){
      return res.status(400).json({error: 'Title too long'})
    }

    if(description.length > 255){
      return res.status(400).json({error: 'Description too long'})
    }

    if(remediation.length > 5000){
      return res.status(400).json({error: 'Remediation too long'})
    }

    const newFinding = await client.query(
      `
      INSERT INTO findings(title, description, severity, remediation, status, user_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
      `, [title, description, severity, remediation, status, req.user.id]
    )

    await client.query(
      'INSERT INTO audit_logs(actor_user_id, action, target_type, target_id) VALUES($1, $2, $3, $4)',
      [req.user.id, 'finding.created', 'finding', newFinding.rows[0].id]
    )

    await client.query('COMMIT')
   
    res.json(newFinding.rows[0])
  }catch(err){
    await client.query('ROLLBACK')
    error('Error creating finding', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  } finally {
    client.release()
  }
}

const updateFinding = async(req, res) => {
  const {title, description, severity, remediation, status} = req.body
  const id = req.params.id

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  const client = await pool.connect()

  try{
    await client.query('BEGIN')

    if(!title || !description || !severity || !remediation || !status){
      return res.status(400).json({error: 'Title, description and severity are required'})
    }

    if(!SEVERITY.includes(severity)){
      return res.status(400).json({error: 'Invalid severity level'})
    }

    if(!STATUS.includes(status)){
      return res.status(400).json({error: 'Invalid status'})
    }

    if(title.length > 50){
      return res.status(400).json({error: 'Title too long'})
    }

    if(description.length > 255){
      return res.status(400).json({error: 'Description too long'})
    }

    if(remediation.length > 5000){
      return res.status(400).json({error: 'Remediation too long'})
    }

    const result = await client.query(
      `
      UPDATE findings SET title=$1, description=$2, severity=$3, remediation=$4, status=$5, updated_at=CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *
      `, [title, description, severity, remediation, status, id, req.user.id]
    )

    if(result.rows.length === 0){
      return res.status(404).json({error: 'Finding not found'})
    }

    await client.query(
      'INSERT INTO audit_logs(actor_user_id, action, target_type, target_id) VALUES($1, $2, $3, $4)',
      [req.user.id, 'finding.updated', 'finding', result.rows[0].id]
    )

    await client.query('COMMIT')

    res.json(result.rows[0])
  }catch(err){
    await client.query('ROLLBACK')
    error('Error updating finding', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  } finally {
    client.release()
  }
}

const deleteFinding = async(req, res) => {
  const id = req.params.id

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  const client = await pool.connect()

  try{
    await client.query('BEGIN')

    const result = await client.query(
      `
      DELETE FROM findings WHERE id = $1 AND user_id = $2
      `, [id, req.user.id]
    )

    if(result.rowCount === 0){
      await client.query('ROLLBACK')
      return res.status(404).json({error: 'Finding not found'})
    }

    const evidenceFiles = await client.query(
      `
      SELECT stored_filename FROM evidence_files WHERE finding_id = $1
      `, [id]
    )

    for (const file of evidenceFiles.rows) {
      const filePath = path.join(UPLOAD_DIR, file.stored_filename)
      await fs.unlink(filePath).catch((err) => {
        error('Failed to delete evidence file from disk', err.message)
      })
    }

    await client.query(
      'INSERT INTO audit_logs(actor_user_id, action, target_type, target_id) VALUES($1, $2, $3, $4)',
      [req.user.id, 'finding.deleted', 'finding', id]
    )

    await client.query('COMMIT')

    res.json({message: 'Finding deleted successfully'})
  }catch(err){
    await client.query('ROLLBACK')
    error('Error deleting finding', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  } finally {
    client.release()
  }
}

module.exports = {
  getFindings,
  getFinding,
  createFinding,
  updateFinding,
  deleteFinding
}