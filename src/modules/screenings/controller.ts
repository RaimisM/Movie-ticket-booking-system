import { Router } from 'express'
import type { Database } from '@/database'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'
import buildRepository from './repository'
import {
  parseId,
  parseInsertable,
} from './schema'

export default (db: Database) => {
  const repo = buildRepository(db)
  const router = Router()

  router
    .route('/')
    .post(
      jsonRoute(async (req, res) => {
        if (Array.isArray(req.body)) {
          res.status(400).json({
            message: 'Expected a single screening object, not an array',
          })
          return
        }

        let data
        try {
          data = parseInsertable(req.body)
        } catch (err) {
          res.status(400).json({
            message: 'Invalid screening data',
            errors: (err as any).errors ?? err,
          })
          return
        }

        const date = new Date(data.timestamp)
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

        const movieExists = await db
          .selectFrom('movies')
          .selectAll()
          .where('id', '=', data.movieId)
          .executeTakeFirst()

        if (!movieExists) {
          res.status(400).json({ message: 'movieId not in the database' })
          return
        }

        const inserted = await repo.createScreening({
          ...data,
          timestamp: date.toISOString(),
        })
        res.status(201).json(inserted[0])
      })
    )

    .get(
      jsonRoute(async (_req, res) => {
        const screenings = await repo.getScreenings()

        if (screenings.length === 0) {
          res.status(404).json({ message: 'No screenings found' })
          return
        }
        res.status(200).json(screenings)
      })
    )
    .patch(unsupportedRoute)
    .put(unsupportedRoute)
    .delete(unsupportedRoute)

  router
    .route('/:id')
    .get(
      jsonRoute(async (req, res) => {
        let id
        try {
          id = parseId(req.params.id)
        } catch {
          res.status(400).json({ message: 'Invalid screening ID' })
          return
        }

        const screening = await repo.getScreeningById(id)
        if (!screening) {
          res.status(404).json({ message: 'Screening not found' })
          return
        }
        res.status(200).json(screening)
      })
    )
    .delete(
      jsonRoute(async (req, res) => {
        let id
        try {
          id = parseId(req.params.id)
        } catch {
          res.status(400).json({ message: 'Invalid screening ID' })
          return
        }

        const deleted = await repo.delete(id)
        if (!deleted) {
          res.status(404).json({ message: 'Screening not found' })
          return
        }
        res.status(200).json(deleted)
      })
    )

  return router
}
