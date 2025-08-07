import { z } from 'zod'
import { Screenings } from '@/database'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  movieId: z.number().int().positive(),
  timestamp: z.string(),
  ticketAllocation: z.number().int().positive().max(100),
})

const insertable = schema.omit({
  id: true,
})

const updatable = insertable.partial()

export const parse = (record: unknown) => schema.parse(record)
export const parseId = (id: unknown) => schema.shape.id.parse(id)
export const parseInsertable = (record: unknown) => insertable.parse(record)
export const parseSelectable = (record: unknown) => schema.parse(record)
export const parseUpdatable = (record: unknown) => updatable.parse(record)

export const keys: (keyof Screenings)[] = Object.keys(
  schema.shape
) as (keyof z.infer<typeof schema>)[]
