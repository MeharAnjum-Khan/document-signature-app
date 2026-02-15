const router = require('express').Router();
const signatureController = require('../controllers/signatureController');
const { auth } = require('../middleware/auth');

router.post('/', auth, signatureController.createSignature);
router.get('/document/:docId', auth, signatureController.getByDocument);
router.get('/token/:token', signatureController.getByToken);
router.post('/sign/:token', signatureController.sign);
router.post('/reject/:token', signatureController.reject);
router.delete('/:id', auth, signatureController.deleteSignature);

module.exports = router;
