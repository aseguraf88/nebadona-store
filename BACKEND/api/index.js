import '../src/config/env.js'
import { connectDB } from '../src/config/configdb.js'
import app from '../src/app.js'

await connectDB()

export default app
