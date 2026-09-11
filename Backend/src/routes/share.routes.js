const router = require('express').Router()
const {shareFinding, getSharedFInding, downloadSharedEvidence} = require('../controllers/share.controller')
const {userExtractor} = require('../middleware/auth.middleware')

router.post('/finding/share/:findingId', userExtractor, shareFinding)
router.get('/shared/:token', getSharedFInding)
router.get('/finding/evidence/download/:token/:fileId', downloadSharedEvidence)

module.exports = router