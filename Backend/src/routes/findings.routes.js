const router = require('express').Router();
const {userExtractor} = require('../middleware/auth.middleware');
const {getFindings, getFinding, createFinding, updateFinding, deleteFinding} = require('../controllers/findings.controller')

router.get('/', userExtractor, getFindings)
router.get('/:id', userExtractor, getFinding)
router.post('/', userExtractor, createFinding)
router.patch('/:id', userExtractor, updateFinding)
router.delete('/:id', userExtractor, deleteFinding)

module.exports = router