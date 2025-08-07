import type { Insertable, Selectable } from 'kysely'
import { z } from 'zod'
import type { Database } from '@/database'
import type { Tickets } from '../../database/types'
import {
  CreateTicketSchema,
  GetUserTicketsQuerySchema,
} from './schema'

const TABLE = 'tickets'
type RowInsert = Insertable<Tickets>
type RowSelectable = Selectable<Tickets>

const IdSchema = z.number().int().positive()

export default (db: Database) => ({
  async createTicket(record: RowInsert | RowInsert[]): Promise<RowSelectable[]> {
    const records = Array.isArray(record) ? record : [record]

    const validated = records.map((r) => {
      const result = CreateTicketSchema.safeParse(r)
      if (!result.success) {
        throw new Error(`Invalid ticket data: ${JSON.stringify(result.error.flatten())}`)
      }
      return result.data
    })

    return db.insertInto(TABLE).values(validated).returningAll().execute()
  },

  async getTicketById(id: number): Promise<RowSelectable | undefined> {
    const parsed = IdSchema.safeParse(id)
    if (!parsed.success) {
      throw new Error(`Invalid ticket ID: ${JSON.stringify(parsed.error.flatten())}`)
    }

    return db
      .selectFrom(TABLE)
      .selectAll()
      .where('id', '=', parsed.data)
      .executeTakeFirst()
  },

  async getTicketsByUserId(userId: number): Promise<RowSelectable[]> {
    const parsed = GetUserTicketsQuerySchema.safeParse({ userId })
    if (!parsed.success) {
      throw new Error(`Invalid user ID: ${JSON.stringify(parsed.error.flatten())}`)
    }

    return db
      .selectFrom(TABLE)
      .selectAll()
      .where('userId', '=', parsed.data.userId)
      .execute()
  },

  async getTickets(): Promise<RowSelectable[]> {
    return db.selectFrom(TABLE).selectAll().execute()
  },

  async deleteTicket(id: number): Promise<RowSelectable | undefined> {
    const parsed = IdSchema.safeParse(id)
    if (!parsed.success) {
      throw new Error(`Invalid ticket ID: ${JSON.stringify(parsed.error.flatten())}`)
    }

    return db
      .deleteFrom(TABLE)
      .where('id', '=', parsed.data)
      .returningAll()
      .executeTakeFirst()
  },

  async countTicketsByScreeningId(screeningId: number): Promise<number> {
    const parsed = IdSchema.safeParse(screeningId)
    if (!parsed.success) {
      throw new Error(`Invalid screening ID: ${JSON.stringify(parsed.error.flatten())}`)
    }

    const result = await db
      .selectFrom(TABLE)
      .select(({ fn }) => fn.countAll().as('count'))
      .where('screeningId', '=', parsed.data)
      .executeTakeFirst()

    return Number(result?.count ?? 0)
  },
})
