import { Kysely, SqliteDatabase } from 'kysely'

export async function up(db: Kysely<SqliteDatabase>) {
  await db.schema
    .createTable('tickets')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().autoIncrement().notNull()
    )
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('screeningId', 'integer', (col) => col.notNull())
    .addColumn('createdAt', 'text', (col) =>
      col.notNull().defaultTo('CURRENT_TIMESTAMP')
    )
    .addForeignKeyConstraint('tickets_user_fk', ['userId'], 'users', ['id'])
    .addForeignKeyConstraint('tickets_screening_fk', ['screeningId'], 'screenings', ['id'])
    .execute()
}

export async function down(db: Kysely<SqliteDatabase>) {
  await db.schema.dropTable('tickets').execute()
}
