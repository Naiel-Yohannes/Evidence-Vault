const router = require('express').Router()
const upload = require('../middleware/upload')
const { userExtractor } = require('../middleware/auth.middleware')
const { uploadEvidence, listEvidence, deleteEvidence, downloadEvidence } = require('../controllers/evidence.controller')

router.post('/findings/:findingId/evidence', userExtractor, upload.single('evidence'), uploadEvidence)
router.get('/findings/:findingId/evidence', userExtractor, listEvidence)
router.delete('/evidence/:evidenceId', userExtractor, deleteEvidence)
router.get('/findings/:findingId/evidence/:fileId/download', userExtractor, downloadEvidence)

module.exports = router