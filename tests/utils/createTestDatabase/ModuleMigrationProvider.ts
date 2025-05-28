import type { MigrationProvider, Migration } from 'kysely';

export default class ModuleMigrationProvider implements MigrationProvider {
  private migrations: Record<string, Migration> | null = null;

  // Blank line added here to satisfy ESLint rule

  async getMigrations(): Promise<Record<string, Migration>> {
    if (!this.migrations) {
      // @ts-ignore
      this.migrations = import.meta.glob(
        '../../../src/database/migrations/**.ts',
        { eager: true }
      );
    }
    // migrations is definitely not null here
    return this.migrations!;
  }
}
