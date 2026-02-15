const router = require('express').Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/profile', auth, authController.getProfile);
router.post('/logout', auth, authController.logout);

module.exports = router;
