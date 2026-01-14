const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB")
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    }).catch((error) => {
        console.error("MongoDB connection error:", error)
    })


app.get("/", (req, res) => {
    res.send("Welcome to PocketTune Server!")
})


// Auth routes
app.use("/api/auth", require("./routes/authRoutes"))

// User data routes
app.use("/api/user-data", require("./routes/userDataRoutes"))

// Account routes
app.use("/api/accounts", require("./routes/accountRoutes"))

// Transaction routes
app.use("/api/transactions", require("./routes/transactionRoutes"))

// Bill routes
app.use("/api/bills", require("./routes/billRoutes"))

// Goal routes
app.use("/api/goals", require("./routes/goalRoutes"))

// Lending routes
app.use("/api/lending", require("./routes/lendingRoutes"))

// Client routes
app.use("/api/clients", require("./routes/clientRoutes"))

// Analytics routes
app.use("/api/analytics", require("./routes/analyticsRoutes"))

