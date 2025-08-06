import type { Insertable, Selectable, Updateable } from 'kysely'
import type { Database } from '@/database'
import type { User } from '@/database/types'
import { keys } from './schema'

const TABLE = 'users'
type RowInsert = Insertable<User>
type RowSelectable = Selectable<User>
type RowUpdate = Updateable<User>

export default (db: Database) => ({
  async createUser(record: RowInsert | RowInsert[]): Promise<RowSelectable[]> {
    return db.insertInto(TABLE).values(record).returning(keys).execute()
  },

  async getUserById(id: number): Promise<RowSelectable | undefined> {
    return db
      .selectFrom(TABLE)
      .select(keys)
      .where('id', '=', id)
      .executeTakeFirst()
  },

  async getUsers(): Promise<RowSelectable[]> {
    return db.selectFrom(TABLE).select(keys).execute()
  },

  async updateUser(
    id: number,
    record: RowUpdate
  ): Promise<RowSelectable | undefined> {
    return db
      .updateTable(TABLE)
      .set(record)
      .where('id', '=', id)
      .returning(keys)
      .executeTakeFirst()
  },

  async deleteUser(id: number): Promise<RowSelectable | undefined> {
    return db
      .deleteFrom(TABLE)
      .where('id', '=', id)
      .returning(keys)
      .executeTakeFirst()
  },
})
