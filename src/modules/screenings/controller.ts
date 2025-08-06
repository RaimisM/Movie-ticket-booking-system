import { Router } from 'express'
import type { Database } from '@/database'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()

  // --- Utility: Validate numeric ID ---
  function parseId(id: string) {
    const parsed = Number(id)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }

  // --- POST /screenings ---
  router
    .route('/')
    .post(
      jsonRoute(async (req, res) => {
        const { body } = req

        // Test expects 400 if array body
        if (Array.isArray(body)) {
          res
            .status(400)
            .json({
              message: 'Expected a single screening object, not an array',
            })
          return
        }

        // Destructure and alias to camelCase for TS/ESLint
        const {
          movie_id: movieId,
          timestamp,
          ticket_allocation: ticketAllocation,
        } = body

        // Validate timestamp
        const date = new Date(timestamp)
        if (Number.isNaN(date.getTime())) {
          res.status(400).json({ message: 'Invalid timestamp' })
          return
        }

        if (date <= new Date()) {
          res
            .status(400)
            .json({ message: 'Screening timestamp must be in the future' })
          return
        }

        // Validate that movie exists
        const movieExists = await db
          .selectFrom('movies')
          .selectAll()
          .where('id', '=', movieId)
          .executeTakeFirst()

        if (!movieExists) {
          res.status(400).json({ message: 'MovieId not in the database' })
          return
        }

        // Insert new screening
        const inserted = await db
          .insertInto('screenings')
          .values({
            movieId,
            timestamp: date.toISOString(),
            ticketAllocation,
          })
          .returningAll()
          .execute()

        res.status(201).json(inserted)
      })
    )

    // --- GET /screenings ---
    .get(
      jsonRoute(async (_req, res) => {
        const screenings = await db
          .selectFrom('screenings')
          .selectAll()
          .execute()

        if (!screenings || screenings.length === 0) {
          res.status(404).json({ message: 'No screenings found' })
          return
        }

        res.status(200).json(screenings)
      })
    )
    .patch(unsupportedRoute)
    .put(unsupportedRoute)
    .delete(unsupportedRoute)

  // --- /screenings/:id routes ---
  router
    .route('/:id')
    .get(
      jsonRoute(async (req, res) => {
        const id = parseId(req.params.id)
        if (!id) {
          res.status(400).json({ message: 'Invalid screening ID' })
          return
        }

        const screening = await db
          .selectFrom('screenings')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst()

        if (!screening) {
          res.status(404).json({ message: 'Screening not found' })
          return
        }

        res.status(200).json(screening)
      })
    )
    .delete(
      jsonRoute(async (req, res) => {
        const id = parseId(req.params.id)
        if (!id) {
          res.status(400).json({ message: 'Invalid screening ID' })
          return
        }

        const deleted = await db
          .deleteFrom('screenings')
          .where('id', '=', id)
          .returningAll()
          .execute()

        if (!deleted || deleted.length === 0) {
          res.status(404).json({ message: 'Screening not found' })
          return
        }

        // Tests expect the deleted record directly, not in an array
        res.status(200).json(deleted[0])
      })
    )

  return router
}
