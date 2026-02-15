const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'document_uploaded',
        'document_viewed',
        'document_deleted',
        'signature_requested',
        'signature_placed',
        'signature_signed',
        'signature_rejected',
        'document_signed_pdf_generated',
        'signing_link_created',
        'signing_link_accessed',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performerEmail: {
      type: String,
      default: null,
    },
    performerName: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

auditSchema.index({ document: 1, createdAt: -1 });

module.exports = mongoose.model('Audit', auditSchema);
