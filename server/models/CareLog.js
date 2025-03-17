const mongoose = require('mongoose');

const careLogSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['watering', 'fertilizing', 'pruning', 'other']
  },
  notes: String,
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CareLog', careLogSchema);