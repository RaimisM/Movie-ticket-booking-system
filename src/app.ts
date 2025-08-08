import express from 'express'
import jsonErrorHandler from './middleware/jsonErrors'
import { type Database } from './database'
import movies from '@/modules/movies/controller'
import screenings from '@/modules/screenings/controller'
import tickets from '@/modules/tickets/controller'
import users from '@/modules/users/controller'

export default function createApp(db: Database) {
  const app = express()

  app.use(express.json())

  app.use('/movies', movies(db))
  app.use('/screenings', screenings(db))
  app.use('/tickets', tickets(db))
  app.use('/users', users(db))

  app.use(jsonErrorHandler)

  return app
}
