const pool = require('../db')

async function logAction (actor_user_id, action, target_type, target_id) {
  await pool.query(
    `
    INSERT INTO audit_logs(actor_user_id, action, target_type, target_id) 
    VALUES($1, $2, $3, $4)
    `, [actor_user_id, action, target_type, target_id])
}

module.exports = {logAction}