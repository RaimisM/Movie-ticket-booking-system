import * as controller from '../controller'
import * as repo from '../repository'
import { BadRequest, NotFound } from '@/utils/errors'

describe('Screenings Controller', () => {
  test('deleteScreening succeeds if no bookings', async () => {
    const id = await insertTestScreening()
    await expect(controller.deleteScreening(id)).resolves.toEqual({ message: 'Screening deleted' })
  })

  test('deleteScreening throws if screening not found', async () => {
    await expect(controller.deleteScreening(999)).rejects.toThrow(NotFound)
  })

  test('deleteScreening throws if bookings exist', async () => {
    const id = await insertScreeningWithBooking()
    await expect(controller.deleteScreening(id)).rejects.toThrow(BadRequest)
  })

  test('updateTicketAllocation succeeds with valid number', async () => {
    const id = await insertTestScreening()
    await expect(controller.updateTicketAllocation(id, 100)).resolves.toBeTruthy()
  })

  test('updateTicketAllocation throws if number is non-positive', async () => {
    const id = await insertTestScreening()
    await expect(controller.updateTicketAllocation(id, 0)).rejects.toThrow(BadRequest)
  })

  test('updateTicketAllocation throws if lower than booked', async () => {
    const id = await insertScreeningWithBooking(5)
    await expect(controller.updateTicketAllocation(id, 3)).rejects.toThrow(BadRequest)
  })

  test('updateTicketAllocation throws if screening not found', async () => {
    await expect(controller.updateTicketAllocation(999, 50)).rejects.toThrow(NotFound)
  })
})
