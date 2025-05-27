export interface Screening {
  id: number
  movieId: number
  date: string
  time: string
  capacity: number
}

const DEFAULT_TIME = '16:00:00'
const DEFAULT_CAPACITY = 20

const daysFromNow = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const today = daysFromNow(0)
export const pastDate = daysFromNow(-2)
export const futureDate = daysFromNow(2)

export function screeningMatcher(input: Partial<Screening> = {}): Record<keyof Screening, any> {
  return {
    id: input.id ?? expect.any(Number),
    movieId: input.movieId ?? expect.any(Number),
    date: input.date ?? expect.any(String),
    time: input.time ?? expect.any(String),
    capacity: input.capacity ?? expect.any(Number),
  }
}

export function fakeScreening(overrides: Partial<Screening> = {}): Screening {
  return {
    id: 123,
    movieId: 1,
    date: futureDate,
    time: DEFAULT_TIME,
    capacity: DEFAULT_CAPACITY,
    ...overrides,
  }
}

export const moreScreenings: Screening[] = [
  {
    id: 101,
    movieId: 1,
    date: futureDate,
    time: '14:00:00',
    capacity: 25,
  },
  {
    id: 102,
    movieId: 133093,
    date: futureDate,
    time: '18:30:00',
    capacity: 30,
  },
]
