const router = require('express').Router();
const documentController = require('../controllers/documentController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', auth, upload.single('file'), documentController.upload);
router.get('/', auth, documentController.getAll);
router.get('/:id', auth, documentController.getById);
router.get('/:id/file', documentController.getFile);
router.get('/:id/download', auth, documentController.download);
router.delete('/:id', auth, documentController.deleteDoc);

module.exports = router;
