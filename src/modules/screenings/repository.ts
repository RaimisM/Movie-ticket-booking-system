import type { Insertable, Selectable } from 'kysely'
import { Database } from '@/database'
import { keys } from './schema'
import { Screening } from '../../database/types'

const TABLE = 'Screening'
type RowInsert = Insertable<Screening>
type RowSelectable = Selectable<Screening>

export default (db: Database) => ({
  // create screening
  async createScreening(record: RowInsert | RowInsert[]) {
    const screening = await db
      .insertInto(TABLE)
      .values(record)
      .returning(keys)
      .execute()

    return screening
  },
  // get screening by Id
  async getScreeningById(id: number): Promise<RowSelectable | undefined> {
    const screening = db
      .selectFrom(TABLE)
      .select(keys)
      .where('id', '=', id)
      .executeTakeFirst()

    return screening
  },
  // get all screenings
  async getScreenings(): Promise<RowSelectable[] | undefined> {
    return db.selectFrom(TABLE).select(keys).execute()
  },
  // delete screening
  async delete(id: number): Promise<RowSelectable | undefined> {
    return db
      .deleteFrom(TABLE)
      .where('id', '=', id)
      .returning(keys)
      .executeTakeFirst()
  },
})