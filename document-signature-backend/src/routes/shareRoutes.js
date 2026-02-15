const router = require('express').Router();
const shareController = require('../controllers/shareController');
const { auth } = require('../middleware/auth');

router.post('/:docId', auth, shareController.sendSigningRequest);

module.exports = router;
