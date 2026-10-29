import { app } from './app'
import { env } from './lib/env'

app.listen(env.port, () => {
  console.log(`API Abarrotes+ en http://localhost:${env.port}`)
})
