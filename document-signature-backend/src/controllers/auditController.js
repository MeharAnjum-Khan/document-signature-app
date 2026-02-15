const Audit = require('../models/Audit');

exports.getByDocument = async (req, res) => {
  try {
    const audits = await Audit.find({ document: req.params.fileId })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ audits });
  } catch (error) {
    console.error('Get audit error:', error);
    res.status(500).json({ message: 'Error fetching audit trail.' });
  }
};
