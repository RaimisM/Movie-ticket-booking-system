import { Router } from 'express'
import type { Database } from '@/database'
import { jsonRoute } from '@/utils/middleware'
import buildRepository from './repository'
import { CreateTicketSchema, GetUserTicketsQuerySchema } from './schema'

export default (
  db: Database,
  repoOverride?: ReturnType<typeof buildRepository>
) => {
  const ticketsRepo = repoOverride ?? buildRepository(db)
  const router = Router()

  router.get(
    '/',
    jsonRoute(async (req, res) => {
      const parsedQuery = GetUserTicketsQuerySchema.safeParse(req.query)

      if (!parsedQuery.success) {
        res.status(400).json({
          message: 'Invalid userId',
          errors: parsedQuery.error.flatten(),
        })
        return
      }

      const { userId } = parsedQuery.data
      const tickets = await ticketsRepo.getTicketsByUserId(userId)
      res.status(200).json(tickets)
    })
  )

  router.post(
    '/',
    jsonRoute(async (req, res) => {
      const parsedBody = CreateTicketSchema.safeParse(req.body)

      if (!parsedBody.success) {
        res.status(400).json({
          message: 'Invalid request body',
          errors: parsedBody.error.flatten(),
        })
        return
      }

      const { userId, screeningId } = parsedBody.data

      const screening = await db
        .selectFrom('screenings')
        .selectAll()
        .where('id', '=', screeningId)
        .executeTakeFirst()

      if (!screening) {
        res.status(404).json({ message: 'Screening not found' })
        return
      }

      const bookedCount =
        await ticketsRepo.countTicketsByScreeningId(screeningId)
      const ticketsLeft = screening.ticketAllocation - bookedCount

      if (ticketsLeft <= 0) {
        res.status(400).json({ message: 'No tickets left for this screening' })
        return
      }

      const ticket = await ticketsRepo.createTicket({ userId, screeningId })

      res.status(201).json(ticket)
    })
  )

  return router
}
