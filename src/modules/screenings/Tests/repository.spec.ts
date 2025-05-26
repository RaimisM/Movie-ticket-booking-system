// screenings/Tests/repository.spec.ts
import { db } from '@/database'
import * as repo from '../repository'

describe('Screenings Repository', () => {
  beforeEach(async () => {
    // reset test DB or use transaction rollback
  })

  test('deleteScreening deletes a screening by ID', async () => {
    const id = await insertTestScreening()
    const deleted = await repo.deleteScreening(id)
    expect(deleted).toBe(true)
  })

  test('deleteScreening returns false for non-existent ID', async () => {
    const deleted = await repo.deleteScreening(999)
    expect(deleted).toBe(false)
  })

  test('hasBookings returns true if bookings exist', async () => {
    const id = await insertScreeningWithBooking()
    const result = await repo.hasBookings(id)
    expect(result).toBe(true)
  })

  test('getBookedTickets returns correct count', async () => {
    const id = await insertScreeningWithMultipleBookings()
    const count = await repo.getBookedTickets(id)
    expect(count).toBe(5) // assuming 2 + 3 booked
  })

  test('updateTicketAllocation returns true on success', async () => {
    const id = await insertTestScreening()
    const updated = await repo.updateTicketAllocation(id, 100)
    expect(updated).toBe(true)
  })

  test('updateTicketAllocation returns false for non-existent screening', async () => {
    const updated = await repo.updateTicketAllocation(999, 100)
    expect(updated).toBe(false)
  })
})
