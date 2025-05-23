import { Kysely, sql } from 'kysely'
import { DB } from '../types'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createTable('screenings')
    .addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn('movie_id', 'integer', (c) =>
      c.notNull().references('movies.id')
    )
    .addColumn('timestamp', 'text', (c) => c.notNull())
    .addColumn('ticket_allocation', 'integer', (c) =>
      c.notNull().check(sql`ticket_allocation > 0`)
    )
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('screenings').ifExists().execute()
}
