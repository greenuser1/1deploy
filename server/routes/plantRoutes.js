const express = require("express")
const router = express.Router()
const {
  createPlant,
  getPlants,
  getPlantById,
  updatePlant,
  deletePlant,
  getPlantCareLogs,
} = require("../controllers/plantController")
const authMiddleware = require("../middleware/authMiddleware")
const CareLog = require("../models/CareLog") 

router.use(authMiddleware)



router.get("/:id/care-logs", async (req, res) => {
  try {
    const plantId = req.params.id
    const userId = req.session.user.id

    console.log(`Directly handling GET /plants/${plantId}/care-logs for user ${userId}`)

    // First check if the plant exists and belongs to the user
    const Plant = require("../models/Plant")
    const plant = await Plant.findOne({
      _id: plantId,
      user: userId,
    })

    if (!plant) {
      console.log(`Plant ${plantId} not found for user ${userId}`)
      return res.status(404).json({ error: "Plant not found" })
    }

    // Get care logs for this plant
    const careLogs = await CareLog.find({
      plant: plantId,
      user: userId,
    }).sort({ createdAt: -1 }) 

    console.log(`Found ${careLogs.length} care logs for plant ${plantId}`)
    res.json(careLogs)
  } catch (err) {
    console.error(`Error in GET /:id/care-logs:`, err)
    res.status(500).json({ error: err.message })
  }
})

// Other routes
router.post("/", createPlant)
router.get("/", getPlants)
router.get("/:id", getPlantById)
router.put("/:id", updatePlant)
router.delete("/:id", deletePlant)

module.exports = router

