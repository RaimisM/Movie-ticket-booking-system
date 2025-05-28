import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import { type Database } from '@/database'

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}

export default function screenings(db: Database) {
  const router = Router()

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

  router.post('/', asyncHandler(async (req: Request, res: Response) => {
    if (Array.isArray(req.body)) {
      throw new BadRequest('Expected a single screening object, not an array')
    }

    const parsed = screeningSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequest(parsed.error.errors[0].message)
    }

    const { movieId, timestamp, ticketAllocation } = parsed.data

    if (!isFutureDate(timestamp)) {
      throw new BadRequest('Screening timestamp must be in the future')
    }

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
  }))

  // GET /screenings - get all future screenings
  router.get('/', asyncHandler(async (_req: Request, res: Response) => {
    const screeningsList = await db.selectFrom('screenings')
      .selectAll()
      .where('timestamp', '>', new Date().toISOString())
      .execute()

    if (screeningsList.length === 0) {
      throw new NotFound('No screenings found')
    }

    res.json(screeningsList)
  }))

  // GET /screenings/:id - get single screening by id
  router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const idSchema = z.coerce.number().int().positive()
    const parsedId = idSchema.safeParse(req.params.id)

    if (!parsedId.success) {
      throw new BadRequest('Invalid screening ID')
    }

    const screening = await db.selectFrom('screenings')
      .selectAll()
      .where('id', '=', parsedId.data)
      .executeTakeFirst()

    if (!screening) {
      throw new NotFound('Screening not found')
    }

    res.json(screening)
  }))

  // DELETE /screenings/:id - delete screening by id
  router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const idSchema = z.coerce.number().int().positive()
    const parsedId = idSchema.safeParse(req.params.id)

    if (!parsedId.success) {
      throw new BadRequest('Invalid screening ID')
    }

    const deleted = await db.deleteFrom('screenings')
      .where('id', '=', parsedId.data)
      .returningAll()
      .execute()

    if (deleted.length === 0) {
      throw new NotFound('Screening not found')
    }

    res.json(deleted[0])
  }))

  return router
}
