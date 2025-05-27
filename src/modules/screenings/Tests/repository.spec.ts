import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor, selectAllFor } from '@tests/utils/records'
import buildRepository from '../repository'
import { fakeScreening, screeningMatcher, moreScreenings } from './utils'

const db = await createTestDatabase()
const repository = buildRepository(db)
const createScreening = createFor(db, 'Screening')
const selectScreening = selectAllFor(db, 'Screening')

const createMovie = createFor(db, 'movies')

beforeEach(async () => {
  await createMovie([
    {
      id: 1,
      title: 'Passage de Venus',
      year: 1874,
    },
    {
      id: 133093,
      title: 'The Matrix',
      year: 1999,
    },
    {
      id: 816692,
      title: 'Interstellar',
      year: 2014,
    },
  ])
})

afterEach(async () => {
  await db.deleteFrom('Screening').execute()
  await db.deleteFrom('movies').execute()
})

afterAll(async () => {
  await db.destroy()
})

describe('create screening', () => {
  it('should allow to create new screening with data', async () => {
    const screeningData = {
      movieId: 1,
      date: '2025-05-01',
      time: '16:00:00',
      capacity: 20,
    }

    const screening = await repository.createScreening(screeningData)

    expect(screening).toEqual([
      {
        id: expect.any(Number),
        movieId: 1,
        date: '2025-05-01',
        time: '16:00:00',
        capacity: 20,
      },
    ])
    const screeningsInDatabase = await selectScreening()
    expect(screeningsInDatabase).toEqual([screeningMatcher(screeningData)])
  })

  it('shall allow to create multiple screenings', async () => {
    const screenings = await repository.createScreening(moreScreenings)

    const matcher = [
      screeningMatcher(moreScreenings[0]),
      screeningMatcher(moreScreenings[1]),
    ]

    expect(screenings).toEqual(matcher)

    const screeningsInDatabase = await selectScreening()
    expect(screeningsInDatabase).toEqual(matcher)
  })
})

describe('select screening by id', () => {
  it('shall return screening by ID', async () => {
    const screeningData = {
      id: 234,
      movieId: 1,
      date: '2025-05-01',
      time: '16:00:00',
      capacity: 20,
    }
    createScreening(screeningData)

    const screening = await repository.getScreeningById(234)
    expect(screening).toEqual(screeningMatcher(screeningData))
  })
  it('shall return empty', async () => {
    const screening = await repository.getScreeningById(2)

    expect(screening).toBe(undefined)
  })
})

describe('get all screenings in the database', () => {
  it('shall return all screenings in the database', async () => {
    createScreening(moreScreenings)

    const screenings = await repository.getScreenings()

    const matcher = [
      screeningMatcher(moreScreenings[0]),
      screeningMatcher(moreScreenings[1]),
    ]

    expect(screenings).toHaveLength(2)
    expect(screenings).toEqual(matcher)
  })
})
describe('delete a screening by id', () => {
  it('shall delete screening with provided ID', async () => {
    const screeningData = {
      id: 234,
      movieId: 1,
      date: '2025-05-01',
      time: '16:00:00',
      capacity: 20,
    }
    createScreening(screeningData)
    createScreening(fakeScreening())

    let screenings = await selectScreening()

    expect(screenings).toHaveLength(2)
    expect(screenings).toEqual(
      expect.arrayContaining([screeningMatcher(screeningData)])
    )

    const deletedScreening = await repository.delete(234)

    expect(deletedScreening).toEqual(screeningMatcher(screeningData))

    screenings = await selectScreening()

    expect(screenings).toHaveLength(1)
  })
})