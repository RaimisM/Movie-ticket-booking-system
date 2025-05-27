import { Router, Request, Response } from 'express'
import { z } from 'zod'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import { type Database } from '@/database'

export default function screenings(db: Database) {
  const router = Router()

  const screeningSchema = z.object({
    movieId: z.number(),
    date: z.string().refine(date => !Number.isNaN(Date.parse(date)), { message: 'Invalid date' }),
    time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format'),
    capacity: z.number().int().positive(),
  })

  const isFutureDate = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateStr)
    return date > today
  }

  // POST
  router.post('/', async (req: Request, res: Response) => {
    if (Array.isArray(req.body)) {
      throw new BadRequest('Expected a single screening object, not an array')
    }

    const parsed = screeningSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequest(parsed.error.message)
    }

    const { movieId, date, time, capacity } = parsed.data

    if (!isFutureDate(date)) {
      throw new BadRequest('Screening date must be in the future')
    }

    const movieExists = await db.selectFrom('movies')
      .select('id')
      .where('id', '=', movieId)
      .executeTakeFirst()

    if (!movieExists) {
      throw new BadRequest('MovieId not in the database')
    }

    const screening = await db.insertInto('screening')
      .values({ movieId, date, time, capacity })
      .returningAll()
      .execute()

    res.status(201).json(screening)
  })

  // GET
  router.get('/', async (_req: Request, res: Response) => {
    const now = new Date().toISOString()

    const futureScreenings = await db.selectFrom('screening')
      .selectAll()
      .where('date', '>', now.slice(0, 10))
      .execute()

    if (futureScreenings.length === 0) {
      throw new NotFound('No screenings found')
    }

    res.json(screenings)
  })

  router.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const screening = await db.selectFrom('screening')
      .selectAll()
      .where('id', '=', id)
      .execute()

    if (screening.length === 0) {
      throw new NotFound('Screening not found')
    }

    res.json(screening[0])
  })

  // DELETE 
  router.delete('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const deleted = await db.deleteFrom('screening')
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
