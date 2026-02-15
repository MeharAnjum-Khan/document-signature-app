const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'completed', 'rejected'],
      default: 'draft',
    },
    signedFilePath: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

documentSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
