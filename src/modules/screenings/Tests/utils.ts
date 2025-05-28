export interface Screening {
  id: number
  movie_id: number
  timestamp: string
  ticket_allocation: number
}

const DEFAULT_TIME = '16:00:00'
const DEFAULT_CAPACITY = 20

const timestampFromDateAndTime = (date: string, time: string): string => {
  const isoString = new Date(`${date}T${time}Z`).toISOString()
  return isoString
}

const daysFromNow = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const today = daysFromNow(0)
export const pastDate = daysFromNow(-2)
export const futureDate = daysFromNow(2)

export function screeningMatcher(input: Partial<Screening> = {}): Record<keyof Screening, any> {
  return {
    id: input.id ?? expect.any(Number),
    movie_id: input.movie_id ?? expect.any(Number),
    timestamp: input.timestamp ?? expect.any(String),
    ticket_allocation: input.ticket_allocation ?? expect.any(Number),
  }
}

export function fakeScreening(overrides: Partial<Screening> = {}): Screening {
  return {
    id: 123,
    movie_id: 1,
    timestamp: timestampFromDateAndTime(futureDate, DEFAULT_TIME),
    ticket_allocation: DEFAULT_CAPACITY,
    ...overrides,
  }
}

export const moreScreenings: Screening[] = [
  {
    id: 101,
    movie_id: 1,
    timestamp: timestampFromDateAndTime(futureDate, '14:00:00'),
    ticket_allocation: 25,
  },
  {
    id: 102,
    movie_id: 133093,
    timestamp: timestampFromDateAndTime(futureDate, '18:30:00'),
    ticket_allocation: 30,
  },
]
