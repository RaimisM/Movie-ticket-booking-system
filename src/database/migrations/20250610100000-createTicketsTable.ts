import { Kysely, SqliteDatabase } from 'kysely'

export async function up(db: Kysely<SqliteDatabase>) {
  await db.schema
    .createTable('tickets')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().autoIncrement().notNull()
    )
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('screening_id', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo('CURRENT_TIMESTAMP')
    )
    .addForeignKeyConstraint('tickets_user_fk', ['user_id'], 'users', ['id'])
    .addForeignKeyConstraint(
      'tickets_screening_fk',
      ['screening_id'],
      'screenings',
      ['id']
    )
    .execute()
}

export async function down(db: Kysely<SqliteDatabase>) {
  await db.schema.dropTable('tickets').execute()
}
