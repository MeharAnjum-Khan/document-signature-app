const Audit = require('../models/Audit');

const auditLog = (action) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Log the audit entry after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const documentId = req.params.id || req.params.docId || req.params.fileId || data?.document?._id || data?._id;

        if (documentId) {
          Audit.create({
            document: documentId,
            action,
            performedBy: req.userId || null,
            performerEmail: req.user?.email || req.body?.signerEmail || null,
            performerName: req.user?.name || req.body?.signerName || null,
            ip: req.ip || req.connection?.remoteAddress || null,
            userAgent: req.headers['user-agent'] || null,
            metadata: data?.auditMetadata || {},
          }).catch((err) => console.error('Audit log error:', err.message));
        }
      }

      return originalJson(data);
    };

    next();
  };
};

module.exports = { auditLog };
