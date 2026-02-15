const router = require('express').Router();
const auditController = require('../controllers/auditController');
const { auth } = require('../middleware/auth');

router.get('/:fileId', auth, auditController.getByDocument);

module.exports = router;
