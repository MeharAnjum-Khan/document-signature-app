const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    signer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    signerEmail: {
      type: String,
      required: [true, 'Signer email is required'],
      trim: true,
      lowercase: true,
    },
    signerName: {
      type: String,
      trim: true,
      default: '',
    },
    page: {
      type: Number,
      required: true,
      min: 1,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      default: 200,
    },
    height: {
      type: Number,
      default: 50,
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'rejected'],
      default: 'pending',
    },
    signatureData: {
      type: String,
      default: null,
    },
    signatureType: {
      type: String,
      enum: ['text', 'draw', 'image'],
      default: 'text',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    token: {
      type: String,
      unique: true,
      sparse: true,
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

signatureSchema.index({ document: 1 });

module.exports = mongoose.model('Signature', signatureSchema);
