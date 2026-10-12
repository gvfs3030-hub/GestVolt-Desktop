import initSqlJs, { type Database as SqlJsDatabase, type SqlJsStatic, type SqlValue } from 'sql.js';

let SQL_PROMISE: Promise<SqlJsStatic> | null = null;
let DATABASE_PROMISE: Promise<DesktopSQLiteDatabase> | null = null;

function loadSql(): Promise<SqlJsStatic> {
  if (!SQL_PROMISE) {
    SQL_PROMISE = window.gestvolt.loadSqlWasm().then((bytes) => initSqlJs({ wasmBinary: new Uint8Array(bytes) }));
  }
  return SQL_PROMISE;
}

class DesktopSQLiteDatabase {
  private raw: SqlJsDatabase;
  private transactionDepth = 0;
  private saveQueue: Promise<void> = Promise.resolve();
  readonly name: string;

  constructor(raw: SqlJsDatabase, name: string) { this.raw = raw; this.name = name; }

  private async persist() {
    if (this.transactionDepth > 0) return;
    const bytes = this.raw.export();
    this.saveQueue = this.saveQueue.then(() => window.gestvolt.saveDatabase(bytes)).then(() => undefined);
    await this.saveQueue;
  }

  async execAsync(source: string): Promise<void> {
    this.raw.exec(source);
    if (this.transactionDepth === 0 && /\b(CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|REPLACE|VACUUM)\b/i.test(source)) await this.persist();
  }

  async runAsync(source: string, ...params: any[]): Promise<{ lastInsertRowId: number; changes: number }> {
    this.raw.run(source, params as SqlValue[]);
    const changes = this.raw.getRowsModified();
    const row = this.raw.exec('SELECT last_insert_rowid() AS id');
    const lastInsertRowId = Number(row[0]?.values?.[0]?.[0] ?? 0);
    if (this.transactionDepth === 0) await this.persist();
    return { lastInsertRowId, changes };
  }

  async getFirstAsync<T = any>(source: string, ...params: any[]): Promise<T | null> {
    const statement = this.raw.prepare(source);
    try {
      statement.bind(params as SqlValue[]);
      return statement.step() ? statement.getAsObject() as T : null;
    } finally { statement.free(); }
  }

  async getAllAsync<T = any>(source: string, ...params: any[]): Promise<T[]> {
    const statement = this.raw.prepare(source);
    const rows: T[] = [];
    try {
      statement.bind(params as SqlValue[]);
      while (statement.step()) rows.push(statement.getAsObject() as T);
      return rows;
    } finally { statement.free(); }
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    const outer = this.transactionDepth === 0;
    if (outer) this.raw.run('BEGIN TRANSACTION');
    this.transactionDepth += 1;
    try {
      await task();
      this.transactionDepth -= 1;
      if (outer) { this.raw.run('COMMIT'); await this.persist(); }
    } catch (error) {
      this.transactionDepth -= 1;
      if (outer) { try { this.raw.run('ROLLBACK'); } catch { /* transaction already ended */ } }
      throw error;
    }
  }
}

export async function openDatabaseAsync(name: string): Promise<DesktopSQLiteDatabase> {
  if (!DATABASE_PROMISE) {
    DATABASE_PROMISE = (async () => {
      const SQL = await loadSql();
      const stored = await window.gestvolt.loadDatabase();
      const raw = new SQL.Database(stored.bytes ? new Uint8Array(stored.bytes) : undefined);
      const db = new DesktopSQLiteDatabase(raw, name);
      return db;
    })();
  }
  return DATABASE_PROMISE;
}
