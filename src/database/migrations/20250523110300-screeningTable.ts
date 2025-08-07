import { Kysely, SqliteDatabase } from 'kysely'

export async function up(db: Kysely<SqliteDatabase>): Promise<void> {
  await db.schema
    .createTable('screenings')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().notNull().autoIncrement()
    )
    .addColumn('movieId', 'integer', (col) =>
      col.references('movies.id').notNull()
    )
    .addColumn('timestamp', 'text', (col) => col.notNull())
    .addColumn('ticketAllocation', 'integer', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<SqliteDatabase>): Promise<void> {
  await db.schema.dropTable('screenings').execute()
}
