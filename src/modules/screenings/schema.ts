import { z } from 'zod'
import { Screening } from '@/database'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  movieId: z.number().int().positive(),
  date: z.string().date(),
  time: z.string().time(),
  capacity: z.number().int().positive().max(100),
})

const insertable = schema.omit({
  id: true,
})

const updateable = insertable.partial()

export const parse = (record: unknown) => schema.parse(record)
export const parseId = (id: unknown) => schema.shape.id.parse(id)
export const parseInsertable = (record: unknown) => insertable.parse(record)
export const parseSelectable = (record: unknown) => schema.parse(record)
export const parseUpdateable = (record: unknown) => updateable.parse(record)

export const keys: (keyof Screening)[] = Object.keys(
  schema.shape
) as (keyof z.infer<typeof schema>)[]