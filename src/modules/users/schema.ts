import { z } from 'zod'
import { User } from '@/database/types'

export const schema = z.object({
  id: z.coerce.number().int().positive(),
  userName: z.string().min(1, 'Username is required'),
  role: z.enum(['admin', 'user']),
})

export const insertable = schema.omit({ id: true })
export const updateable = insertable.partial()

export const parse = (record: unknown) => schema.parse(record)
export const parseId = (id: unknown) => schema.shape.id.parse(id)
export const parseInsertable = (record: unknown) => insertable.parse(record)
export const parseSelectable = (record: unknown) => schema.parse(record)
export const parseUpdateable = (record: unknown) => updateable.parse(record)

export const keys: (keyof User)[] = Object.keys(schema.shape) as (keyof z.infer<
  typeof schema
>)[]
