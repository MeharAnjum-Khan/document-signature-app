const Document = require('../models/Document');
const Audit = require('../models/Audit');
const path = require('path');
const fs = require('fs');

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    const title = req.body.title || req.file.originalname.replace('.pdf', '');

    const document = await Document.create({
      title,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      owner: req.userId,
    });

    // Create audit log
    await Audit.create({
      document: document._id,
      action: 'document_uploaded',
      performedBy: req.userId,
      performerEmail: req.user.email,
      performerName: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { fileName: document.fileName, fileSize: document.fileSize },
    });

    res.status(201).json({ message: 'Document uploaded successfully.', document });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading document.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = { owner: req.userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [documents, total] = await Promise.all([
      Document.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Document.countDocuments(query),
    ]);

    res.json({
      documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Error fetching documents.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, owner: req.userId });

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Error fetching document.' });
  }
};

exports.download = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, owner: req.userId });

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const filePath = document.signedFilePath || document.filePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk.' });
    }

    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading document.' });
  }
};

exports.getFile = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const filePath = document.filePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Error getting file.' });
  }
};

exports.deleteDoc = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, owner: req.userId });

    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Delete the actual file
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    if (document.signedFilePath && fs.existsSync(document.signedFilePath)) {
      fs.unlinkSync(document.signedFilePath);
    }

    await Audit.create({
      document: document._id,
      action: 'document_deleted',
      performedBy: req.userId,
      performerEmail: req.user.email,
      performerName: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting document.' });
  }
};
