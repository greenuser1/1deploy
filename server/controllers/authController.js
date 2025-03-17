const User = require("../models/User")
const bcrypt = require("bcrypt")


exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with that email or username",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      username,
      email,
      passwordHash,
    })

    await user.save()

    // Set session
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
    }

    res.status(201).json({
      message: "User registered successfully",
      user: req.session.user,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
    }

    res.json({
      message: "Logged in successfully",
      user: req.session.user,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.logoutUser = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" })
    }
    res.clearCookie("connect.sid")
    res.json({ message: "Logged out successfully" })
  })
}

exports.getCurrentUser = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" })
  }

  try {
    const user = await User.findById(req.session.user.id).select("-passwordHash")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

