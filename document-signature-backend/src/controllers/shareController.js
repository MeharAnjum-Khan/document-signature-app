const nodemailer = require('nodemailer');
const config = require('../config');
const Signature = require('../models/Signature');
const Document = require('../models/Document');
const Audit = require('../models/Audit');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

exports.sendSigningRequest = async (req, res) => {
  try {
    const { docId } = req.params;
    const { signerEmail, signerName } = req.body;

    const document = await Document.findOne({ _id: docId, owner: req.userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Find the pending signature for this signer
    const signature = await Signature.findOne({
      document: docId,
      signerEmail,
      status: 'pending',
    });

    if (!signature) {
      return res.status(404).json({ message: 'No pending signature for this signer.' });
    }

    const signingLink = `${config.clientUrl}/sign/${signature.token}`;

    // Send email
    try {
      await transporter.sendMail({
        from: `"Document Signature" <${config.email.user}>`,
        to: signerEmail,
        subject: `Signature requested: ${document.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Signature Request</h2>
            <p>Hi ${signerName || 'there'},</p>
            <p><strong>${req.user.name}</strong> has requested your signature on the document:</p>
            <p style="font-size: 18px; font-weight: bold; color: #1e3a5f;">${document.title}</p>
            <a href="${signingLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Sign Document
            </a>
            <p style="color: #666; font-size: 14px;">This link will expire in 7 days.</p>
            <hr style="border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">Document Signature App</p>
          </div>
        `,
      });

      await Audit.create({
        document: docId,
        action: 'signing_link_created',
        performedBy: req.userId,
        performerEmail: req.user.email,
        performerName: req.user.name,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { signerEmail, signingLink },
      });

      res.json({ message: 'Signing request sent successfully.', signingLink });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Still return the link even if email fails
      res.json({
        message: 'Email delivery failed, but signing link was generated.',
        signingLink,
        emailError: true,
      });
    }
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ message: 'Error sending signing request.' });
  }
};
