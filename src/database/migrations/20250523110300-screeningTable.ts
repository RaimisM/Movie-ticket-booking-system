import { Kysely, SqliteDatabase } from 'kysely'

export async function up(db: Kysely<SqliteDatabase>): Promise<void> {
  await db.schema
    .createTable('Screening')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().notNull().autoIncrement()
    )
    .addColumn('movie_id', 'integer', (col) =>
      col.references('movies.id').notNull()
    )
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('time', 'time', (col) => col.notNull())
    .addColumn('capacity', 'integer', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<SqliteDatabase>): Promise<void> {
  await db.schema.dropTable('Screening').execute()
}
