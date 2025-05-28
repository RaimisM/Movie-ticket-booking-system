import { CamelCasePlugin, Kysely, SqliteDialect } from 'kysely';
import SQLite from 'better-sqlite3';
import { migrateToLatest } from '@/database/migrate';
import { type DB } from '@/database';
import ModuleMigrationProvider from './ModuleMigrationProvider';

const DATABASE_FILE = ':memory:';

const logError = (message: string, error?: unknown) => {
  process.stderr.write(`ERROR: ${message}\n`);
  if (error) {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  }
};

const logWarn = (message: string) => {
  process.stderr.write(`WARN: ${message}\n`);
};

export default async () => {
  const provider = new ModuleMigrationProvider();

  const db = new Kysely<DB>({
    dialect: new SqliteDialect({ database: new SQLite(DATABASE_FILE) }),
    plugins: [new CamelCasePlugin()],
  });

  const latest = async () => {
    const { results, error } = await migrateToLatest(provider, db);

    results
      ?.filter((result) => result.status === 'Error')
      .forEach((result) => {
        logError(`failed to execute migration "${result.migrationName}"`);
      });

    if (error) {
      logError('failed to migrate', error);
      throw error;
    }
  };

  // Stub rollback because provider doesn't support it yet
  const rollback = async () => {
    logWarn('Rollback is not implemented for ModuleMigrationProvider');
  };

  await latest(); // initial migration

  return {
    db,
    migrate: {
      latest,
      rollback,
    },
    destroy: () => db.destroy(),
  };
};
