import supertest from 'supertest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor, selectAllFor } from '@tests/utils/records'
import { omit } from 'lodash/fp'
import createApp from '@/app'
import {
  screeningMatcher,
  fakeScreening,
  moreScreenings,
  today,
  pastDate,
} from './utils'

const db = await createTestDatabase()
const app = createApp(db)

const createScreening = createFor(db, 'screening')
const selectScreening = selectAllFor(db, 'screening')

const createMovie = createFor(db, 'movies')
const createUser = createFor(db, 'user')

const adminAuth = { Authorization: '2' }
const userAuth = { Authorization: '1' }

beforeEach(async () => {
  await createMovie([
    { id: 1, title: 'Passage de Venus', year: 1874 },
    { id: 133093, title: 'The Matrix', year: 1999 },
    { id: 816692, title: 'Interstellar', year: 2014 },
  ])
  await createUser([
    { id: 1, userName: 'Jim Carry', role: 'user' },
    { id: 2, userName: 'Jonas Zimermann', role: 'admin' },
  ])
})

afterEach(async () => {
  await db.deleteFrom('screening').execute()
  await db.deleteFrom('movies').execute()
  await db.deleteFrom('user').execute()
})

afterAll(async () => {
  await db.destroy()
})

describe('POST /screening (create screening)', () => {
  it('creates screening as admin', async () => {
    const data = fakeScreening({ movieId: 1 })
    const { body } = await supertest(app).post('/screening').send(data).set(adminAuth).expect(201)
    expect(body).toEqual([screeningMatcher(data)])
    expect(await selectScreening()).toEqual([screeningMatcher(data)])
  })

  it('rejects creation by non-admin', async () => {
    const { body } = await supertest(app).post('/screening').send(fakeScreening()).set(userAuth).expect(403)
    expect(body.error.message).toMatch(/User is not admin/i)
  })

  it('rejects array payloads', async () => {
    const { body } = await supertest(app).post('/screening').send(moreScreenings).set(adminAuth).expect(400)
    expect(body.error.message).toMatch(/object/i)
  })

  it.each([
    [{ movieId: 999 }, /movieId.*database/i],
    [omit(['movieId'], fakeScreening()), /movieId/i],
    [fakeScreening({ date: 'invalid' }), /date/i],
    [fakeScreening({ date: today }), /date/i],
    [fakeScreening({ date: pastDate }), /date/i],
    [omit(['date'], fakeScreening()), /date/i],
    [fakeScreening({ time: 'invalid' }), /time/i],
    [omit(['time'], fakeScreening()), /time/i],
    // @ts-ignore
    [fakeScreening({ capacity: 'invalid' }), /capacity/i],
    [fakeScreening({ capacity: 0 }), /capacity/i],
    [omit(['capacity'], fakeScreening()), /capacity/i],
  ])('rejects invalid input %p', async (input, errorRegex) => {
    const { body } = await supertest(app).post('/screening').send(input).set(adminAuth).expect(400)
    expect(body.error.message).toMatch(errorRegex)
  })
})

describe('GET /screening (list screenings)', () => {
  it('returns all screenings', async () => {
    await createScreening(moreScreenings)
    const { body } = await supertest(app).get('/screening').expect(200)
    const matcher = moreScreenings.map(screeningMatcher)
    expect(body).toEqual(matcher)
    expect(await selectScreening()).toEqual(matcher)
  })

  it('returns 404 if no screenings exist', async () => {
    const { body } = await supertest(app).get('/screening').expect(404)
    expect(body.error.message).toMatch(/not found/i)
  })
})

describe('GET /screening/:id (get by ID)', () => {
  it('returns screening by ID', async () => {
    const target = fakeScreening({ id: 255 })
    await createScreening([target, ...moreScreenings])
    const { body } = await supertest(app).get('/screening/255').expect(200)
    expect(body).toEqual(screeningMatcher(target))
    expect(await selectScreening((eb) => eb('id', '=', 255))).toEqual([screeningMatcher(target)])
  })

  it('returns 404 for missing screening', async () => {
    const { body } = await supertest(app).get('/screening/999').expect(404)
    expect(body.error.message).toMatch(/not found/i)
  })
})

describe('DELETE /screening/:id (delete screening)', () => {
  it('deletes screening as admin', async () => {
    const target = fakeScreening({ id: 321 })
    await createScreening([target, ...moreScreenings])
    const { body } = await supertest(app).delete('/screening/321').set(adminAuth).expect(200)
    expect(body).toEqual(screeningMatcher(target))
    expect(await selectScreening()).toHaveLength(2)
  })

  it('rejects deletion by non-admin', async () => {
    await createScreening([fakeScreening({ id: 321 }), ...moreScreenings])
    const { body } = await supertest(app).delete('/screening/321').set(userAuth).expect(403)
    expect(body.error.message).toMatch(/User is not admin/i)
    expect(await selectScreening()).toHaveLength(3)
  })

  it('returns 404 for non-existent screening', async () => {
    const { body } = await supertest(app).delete('/screening/999').set(adminAuth).expect(404)
    expect(body.error.message).toMatch(/not found/i)
  })
})
