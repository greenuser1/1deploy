const express = require("express")
const router = express.Router()
const { createCareLog, getCareLogs, updateCareLog, deleteCareLog } = require("../controllers/careLogController")
const authMiddleware = require("../middleware/authMiddleware")
const CareLog = require("../models/CareLog")

router.use(authMiddleware)
router.post("/", createCareLog)
router.get("/", getCareLogs)
router.put("/:id", updateCareLog)
router.delete("/:id", deleteCareLog)

// Add a new route to get care logs by ID of the plant
router.get("/plant/:plantId", async (req, res) => {
  try {
    const plantId = req.params.plantId
    console.log(`Getting care logs for plant: ${plantId} and user: ${req.session.user.id}`)

    const careLogs = await CareLog.find({
      plant: plantId,
      user: req.session.user.id,
    }).sort({ createdAt: -1 })

    console.log(`Found ${careLogs.length} care logs for plant ${plantId}`)
    res.json(careLogs)
  } catch (err) {
    console.error(`Error getting care logs for plant ${req.params.plantId}:`, err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

