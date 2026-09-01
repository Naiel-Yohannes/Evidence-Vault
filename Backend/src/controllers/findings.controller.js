const pool = require('../db')
const {error} = require('../utils/logger')
const {logAction} = require('../utils/logAction')

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

  try{
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

    if(remediation.length > 50){
      return res.status(400).json({error: 'Remediation too long'})
    }

    const newFinding = await pool.query(
      `
      INSERT INTO findings(title, description, severity, remediation, status, user_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
      `, [title, description, severity, remediation, status, req.user.id]
    )

    await logAction(req.user.id, 'finding.created', 'finding', newFinding.rows[0].id)
   
    res.json(newFinding.rows[0])
  }catch(err){
    error('Error creating finding', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const updateFinding = async(req, res) => {
  const {title, description, severity, remediation, status} = req.body
  const id = req.params.id

  try{
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

    if(remediation.length > 50){
      return res.status(400).json({error: 'Remediation too long'})
    }

    const result = await pool.query(
      `
      UPDATE findings SET title=$1, description=$2, severity=$3, remediation=$4, status=$5, updated_at=CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *
      `, [title, description, severity, remediation, status, id, req.user.id]
    )

    if(result.rows.length === 0){
      return res.status(404).json({error: 'Finding not found'})
    }

    await logAction(req.user.id, 'finding.updated', 'finding', result.rows[0].id)

    res.json(result.rows[0])
  }catch(err){
    error('Error updating finding', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const deleteFinding = async(req, res) => {
  const id = req.params.id
  
  try{
    const result = await pool.query(
      `
      DELETE FROM findings WHERE id = $1 AND user_id = $2
      `, [id, req.user.id]
    )

    if(result.rowCount === 0){
      return res.status(404).json({error: 'Finding not found'})
    }

    await logAction(req.user.id, 'finding.deleted', 'finding', id)

    res.json({message: 'Finding deleted successfully'})
  }catch(err){
    error('Error deleting finding', err.message)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

module.exports = {
  getFindings,
  getFinding,
  createFinding,
  updateFinding,
  deleteFinding
}