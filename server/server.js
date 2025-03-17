const express = require("express")
const session = require("express-session")
const cors = require("cors")
const connectDB = require("./config/db")
const CareLog = require("./models/CareLog")
const Plant = require("./models/Plant")
const path = require("path")


const app = express()

// Configure middleware
app.use(
  cors({
    origin: true, // Allow any origin for deployment
    credentials: true,
  }),
)

app.use(express.json())
app.use(
  session({
    secret: "greentrack-super-secret-key-123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  }),
)

// Database connection
connectDB()

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  next()
}

app.get("/api/plants/:id/care-logs", authMiddleware, async (req, res) => {
  try {
    const plantId = req.params.id
    const userId = req.session.user.id

    console.log(`[DIRECT HANDLER] Getting care logs for plant: ${plantId} and user: ${userId}`)

    const plant = await Plant.findOne({
      _id: plantId,
      user: userId,
    })

    if (!plant) {
      console.log(`Plant ${plantId} not found for user ${userId}`)
      return res.status(404).json({ error: "Plant not found" })
    }

    const careLogs = await CareLog.find({
      plant: plantId,
      user: userId,
    }).sort({ createdAt: -1 })

    console.log(`Found ${careLogs.length} care logs for plant ${plantId}`)
    res.json(careLogs)
  } catch (err) {
    console.error(`Error in direct GET /api/plants/:id/care-logs:`, err)
    res.status(500).json({ error: err.message })
  }
})

const authRoutes = require("./routes/authRoutes")
const plantRoutes = require("./routes/plantRoutes")
const careLogRoutes = require("./routes/careLogRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/plants", plantRoutes)
app.use("/api/care-logs", careLogRoutes)

// Serve static files from the client build directory in production
app.use(express.static(path.join(__dirname, '../client/dist')))

// Handle SPA routing - this must be after API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})