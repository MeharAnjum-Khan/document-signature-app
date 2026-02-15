const { v4: uuidv4 } = require('uuid');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const Signature = require('../models/Signature');
const Document = require('../models/Document');
const Audit = require('../models/Audit');
const config = require('../config');

// Create a signature request (place signature field on document)
exports.createSignature = async (req, res) => {
  try {
    const { documentId, signerEmail, signerName, page, x, y, width, height } = req.body;

    if (!documentId || !signerEmail || !page || x === undefined || y === undefined) {
      return res.status(400).json({ message: 'documentId, signerEmail, page, x, and y are required.' });
    }

    const document = await Document.findOne({ _id: documentId, owner: req.userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Generate unique signing token
    const token = uuidv4();
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const signature = await Signature.create({
      document: documentId,
      signerEmail,
      signerName: signerName || '',
      page,
      x,
      y,
      width: width || 200,
      height: height || 50,
      token,
      tokenExpiry,
    });

    // Update document status to pending
    document.status = 'pending';
    await document.save();

    await Audit.create({
      document: documentId,
      action: 'signature_requested',
      performedBy: req.userId,
      performerEmail: req.user.email,
      performerName: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { signerEmail, page, x, y },
    });

    const signingLink = `${config.clientUrl}/sign/${token}`;

    res.status(201).json({
      message: 'Signature request created.',
      signature,
      signingLink,
    });
  } catch (error) {
    console.error('Create signature error:', error);
    res.status(500).json({ message: 'Error creating signature request.' });
  }
};

// Get all signatures for a document
exports.getByDocument = async (req, res) => {
  try {
    const signatures = await Signature.find({ document: req.params.docId })
      .populate('signer', 'name email')
      .sort({ createdAt: 1 });

    res.json({ signatures });
  } catch (error) {
    console.error('Get signatures error:', error);
    res.status(500).json({ message: 'Error fetching signatures.' });
  }
};

// Get signing info by token (public)
exports.getByToken = async (req, res) => {
  try {
    const signature = await Signature.findOne({ token: req.params.token }).populate({
      path: 'document',
      select: 'title fileName status',
    });

    if (!signature) {
      return res.status(404).json({ message: 'Signing link not found or expired.' });
    }

    if (signature.tokenExpiry && new Date() > signature.tokenExpiry) {
      return res.status(410).json({ message: 'Signing link has expired.' });
    }

    if (signature.status !== 'pending') {
      return res.status(400).json({ message: `This signature has already been ${signature.status}.` });
    }

    await Audit.create({
      document: signature.document._id,
      action: 'signing_link_accessed',
      performerEmail: signature.signerEmail,
      performerName: signature.signerName,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ signature });
  } catch (error) {
    console.error('Get by token error:', error);
    res.status(500).json({ message: 'Error fetching signing info.' });
  }
};

// Sign a document (public, via token)
exports.sign = async (req, res) => {
  try {
    const { signatureData, signatureType } = req.body;
    const { token } = req.params;

    if (!signatureData) {
      return res.status(400).json({ message: 'Signature data is required.' });
    }

    const signature = await Signature.findOne({ token });

    if (!signature) {
      return res.status(404).json({ message: 'Signing link not found.' });
    }

    if (signature.tokenExpiry && new Date() > signature.tokenExpiry) {
      return res.status(410).json({ message: 'Signing link has expired.' });
    }

    if (signature.status !== 'pending') {
      return res.status(400).json({ message: `This signature has already been ${signature.status}.` });
    }

    signature.signatureData = signatureData;
    signature.signatureType = signatureType || 'text';
    signature.status = 'signed';
    signature.signedAt = new Date();
    signature.ip = req.ip || req.connection?.remoteAddress;
    await signature.save();

    // Check if all signatures for this document are complete
    const allSignatures = await Signature.find({ document: signature.document });
    const allSigned = allSignatures.every((s) => s.status === 'signed');

    if (allSigned) {
      // Generate signed PDF
      await generateSignedPDF(signature.document);
    }

    await Audit.create({
      document: signature.document,
      action: 'signature_signed',
      performerEmail: signature.signerEmail,
      performerName: signature.signerName,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { signatureType: signature.signatureType },
    });

    res.json({ message: 'Document signed successfully.', signature });
  } catch (error) {
    console.error('Sign error:', error);
    res.status(500).json({ message: 'Error signing document.' });
  }
};

// Reject signing
exports.reject = async (req, res) => {
  try {
    const { reason } = req.body;
    const { token } = req.params;

    const signature = await Signature.findOne({ token });

    if (!signature) {
      return res.status(404).json({ message: 'Signing link not found.' });
    }

    if (signature.status !== 'pending') {
      return res.status(400).json({ message: `This signature has already been ${signature.status}.` });
    }

    signature.status = 'rejected';
    signature.rejectionReason = reason || 'No reason provided';
    await signature.save();

    // Update document status
    const doc = await Document.findById(signature.document);
    if (doc) {
      doc.status = 'rejected';
      await doc.save();
    }

    await Audit.create({
      document: signature.document,
      action: 'signature_rejected',
      performerEmail: signature.signerEmail,
      performerName: signature.signerName,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { reason: signature.rejectionReason },
    });

    res.json({ message: 'Signature rejected.', signature });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Error rejecting signature.' });
  }
};

// Delete signature
exports.deleteSignature = async (req, res) => {
  try {
    const signature = await Signature.findById(req.params.id).populate('document');

    if (!signature) {
      return res.status(404).json({ message: 'Signature not found.' });
    }

    // Check ownership via document
    if (signature.document.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await Signature.findByIdAndDelete(req.params.id);

    res.json({ message: 'Signature request deleted.' });
  } catch (error) {
    console.error('Delete signature error:', error);
    res.status(500).json({ message: 'Error deleting signature.' });
  }
};

// Generate final signed PDF
async function generateSignedPDF(documentId) {
  try {
    const document = await Document.findById(documentId);
    if (!document) return;

    const signatures = await Signature.find({ document: documentId, status: 'signed' });
    if (signatures.length === 0) return;

    const existingPdfBytes = fs.readFileSync(document.filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const sig of signatures) {
      const pageIndex = sig.page - 1;
      const pages = pdfDoc.getPages();
      if (pageIndex >= pages.length) continue;

      const page = pages[pageIndex];
      const pageHeight = page.getHeight();

      if (sig.signatureType === 'text' && sig.signatureData) {
        page.drawText(sig.signatureData, {
          x: sig.x,
          y: pageHeight - sig.y - 20,
          size: 14,
          font,
          color: rgb(0, 0, 0.6),
        });

        // Draw date below signature
        const dateStr = new Date(sig.signedAt).toLocaleDateString();
        page.drawText(`Signed: ${dateStr}`, {
          x: sig.x,
          y: pageHeight - sig.y - 36,
          size: 8,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      } else if (sig.signatureType === 'draw' && sig.signatureData) {
        // signatureData is a base64 PNG
        try {
          const base64Data = sig.signatureData.replace(/^data:image\/png;base64,/, '');
          const imageBytes = Buffer.from(base64Data, 'base64');
          const pngImage = await pdfDoc.embedPng(imageBytes);

          page.drawImage(pngImage, {
            x: sig.x,
            y: pageHeight - sig.y - sig.height,
            width: sig.width,
            height: sig.height,
          });
        } catch (imgErr) {
          console.error('Error embedding signature image:', imgErr.message);
          // Fallback to text
          page.drawText(sig.signerName || sig.signerEmail, {
            x: sig.x,
            y: pageHeight - sig.y - 20,
            size: 14,
            font,
            color: rgb(0, 0, 0.6),
          });
        }
      }
    }

    const signedPdfBytes = await pdfDoc.save();
    const signedFileName = `signed-${path.basename(document.filePath)}`;
    const signedFilePath = path.join(path.dirname(document.filePath), signedFileName);

    fs.writeFileSync(signedFilePath, signedPdfBytes);

    document.signedFilePath = signedFilePath;
    document.status = 'completed';
    await document.save();

    await Audit.create({
      document: documentId,
      action: 'document_signed_pdf_generated',
      metadata: { signedFilePath: signedFileName },
    });
  } catch (error) {
    console.error('Generate signed PDF error:', error);
  }
}
