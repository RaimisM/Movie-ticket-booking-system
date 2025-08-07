import { z } from 'zod'

export const CreateTicketSchema = z.object({
  userId: z.number().int().positive({
    message: 'userId must be a positive integer',
  }),
  screeningId: z.number().int().positive({
    message: 'screeningId must be a positive integer',
  }),
})

export const GetUserTicketsQuerySchema = z.object({
  userId: z.coerce.number().int().positive({
    message: 'userId must be a positive integer',
  }),
})

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>
export type GetUserTicketsQuery = z.infer<typeof GetUserTicketsQuerySchema>
