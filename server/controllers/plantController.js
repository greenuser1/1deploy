const Plant = require("../models/Plant")
const CareLog = require("../models/CareLog")

exports.createPlant = async (req, res) => {
  try {
    const plant = new Plant({
      ...req.body,
      user: req.session.user.id,
    })
    await plant.save()
    res.status(201).json(plant)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find({ user: req.session.user.id })
    res.json(plants)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.params.id,
      user: req.session.user.id,
    })

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" })
    }

    res.json(plant)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findOneAndUpdate({ _id: req.params.id, user: req.session.user.id }, req.body, {
      new: true,
    })
    if (!plant) return res.status(404).json({ error: "Plant not found" })
    res.json(plant)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findOneAndDelete({
      _id: req.params.id,
      user: req.session.user.id,
    })
    if (!plant) return res.status(404).json({ error: "Plant not found" })
    res.json({ message: "Plant deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get care logs for a specific plant
exports.getPlantCareLogs = async (req, res) => {
  try {
    // First check if the plant exists and belongs to the user
    const plant = await Plant.findOne({
      _id: req.params.id,
      user: req.session.user.id,
    })

    if (!plant) return res.status(404).json({ error: "Plant not found" })

    // Get care logs for this plant
    const careLogs = await CareLog.find({
      plant: req.params.id,
      user: req.session.user.id,
    }).sort({ createdAt: -1 }) // Sort by newest first

    res.json(careLogs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

