// server.ts
import express from 'express'
import payload from 'payload'
import dotenv from 'dotenv'
import bookingRoutes from './routes/booking.ts'
import notificationRoutes from './routes/dashboard.ts'
import payloadConfig from './payload.config.js'

dotenv.config()

const app = express()
app.use(express.json())

await payload.init({
  config: payloadConfig,
  onInit: async () => {
    console.log('Payload Admin URL:', payload.getAdminURL())
  },
})

// Register custom routes on a **separate Express app**
// after Payload is initialized
bookingRoutes(app)
notificationRoutes(app)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
