import { Router, Request, Response } from 'express'
import { z } from 'zod'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import { type Database } from '@/database'

export default function screenings(db: Database) {
  const router = Router()

  // Validate input keys as snake_case, transform to camelCase for internal use
  const screeningSchema = z.object({
    movie_id: z.number(),
    timestamp: z.string().refine(date => !Number.isNaN(Date.parse(date)), { message: 'Invalid timestamp' }),
    ticket_allocation: z.number().int().positive(),
  }).transform(({ movie_id, timestamp, ticket_allocation }) => ({
    movieId: movie_id,
    timestamp,
    ticketAllocation: ticket_allocation,
  }))

  const isFutureDate = (dateStr: string) => {
    const now = new Date()
    return new Date(dateStr) > now
  }

  // POST /screenings
  router.post('/', async (req: Request, res: Response) => {
    if (Array.isArray(req.body)) {
      throw new BadRequest('Expected a single screening object, not an array')
    }

    const parsed = screeningSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequest(parsed.error.message)
    }

    const { movieId, timestamp, ticketAllocation } = parsed.data

    if (!isFutureDate(timestamp)) {
      throw new BadRequest('Screening timestamp must be in the future')
    }

    // Check movie exists
    const movieExists = await db.selectFrom('movies')
      .select('id')
      .where('id', '=', movieId)
      .executeTakeFirst()

    if (!movieExists) {
      throw new BadRequest('MovieId not in the database')
    }

    const screening = await db.insertInto('screenings')
      .values({ movieId, timestamp, ticketAllocation })
      .returningAll()
      .execute()

    res.status(201).json(screening)
  })

  // GET /screenings
  router.get('/', async (_req: Request, res: Response) => {
    const screeningsList = await db.selectFrom('screenings')
      .selectAll()
      .where('timestamp', '>', new Date().toISOString())
      .execute()

    if (screeningsList.length === 0) {
      throw new NotFound('No screenings found')
    }

    res.json(screeningsList)
  })

  // GET /screenings/:id
  router.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const screening = await db.selectFrom('screenings')
      .selectAll()
      .where('id', '=', id)
      .execute()

    if (screening.length === 0) {
      throw new NotFound('Screening not found')
    }

    res.json(screening[0])
  })

  // DELETE /screenings/:id
  router.delete('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const deleted = await db.deleteFrom('screenings')
      .where('id', '=', id)
      .returningAll()
      .execute()

    if (deleted.length === 0) {
      throw new NotFound('Screening not found')
    }

    res.json(deleted[0])
  })

  return router
}
