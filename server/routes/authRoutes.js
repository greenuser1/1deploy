const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

// Use the controller functions directly
router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.post("/logout", authController.logoutUser)
router.get("/me", authMiddleware, authController.getCurrentUser)

module.exports = router

