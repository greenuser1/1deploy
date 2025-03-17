const CareLog = require('../models/CareLog');
const Plant = require('../models/Plant');

exports.createCareLog = async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.body.plant,
      user: req.session.user.id
    });
    
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const careLog = new CareLog({
      ...req.body,
      user: req.session.user.id
    });
    
    await careLog.save();
    res.status(201).json(careLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCareLogs = async (req, res) => {
  try {
    const careLogs = await CareLog.find({ user: req.session.user.id })
      .populate('plant');
    res.json(careLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCareLog = async (req, res) => {
  try {
    const careLog = await CareLog.findOneAndUpdate(
      { _id: req.params.id, user: req.session.user.id },
      req.body,
      { new: true }
    );
    if (!careLog) return res.status(404).json({ error: 'Care log not found' });
    res.json(careLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCareLog = async (req, res) => {
  try {
    const careLog = await CareLog.findOneAndDelete({
      _id: req.params.id,
      user: req.session.user.id
    });
    if (!careLog) return res.status(404).json({ error: 'Care log not found' });
    res.json({ message: 'Care log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};