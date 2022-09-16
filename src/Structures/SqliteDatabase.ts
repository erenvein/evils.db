import { Database } from "./Database";
import { DatabaseError } from "./Error";
import { SqliteDatabaseOptions } from "./Interface";
import { join, sep, extname } from 'path';
import { mkdirSync, existsSync } from 'fs';

export class SqliteDatabase extends Database {
    public SQLQuery: any;
    public options: SqliteDatabaseOptions;
    public constructor(options: SqliteDatabaseOptions) {
        super();

        let notSQLQuery: any = undefined;
        this.options = options;
        try {
        notSQLQuery = require("better-sqlite3");
        } catch {
            throw new DatabaseError('The "better-sqlite3" module is not installed. Please install it with "npm install better-sqlite3"');
        }

        let paths = this.options.filePath.split(sep);
        let resolvedFilePath = process.cwd();

        for (const path of paths) {
            resolvedFilePath += `${sep}${path}`;

            if (!existsSync(resolvedFilePath) && extname(resolvedFilePath) !== '.db')
                mkdirSync(resolvedFilePath);
            else if (!existsSync(resolvedFilePath) && extname(resolvedFilePath) === '.db') {
                this.SQLQuery = notSQLQuery(resolvedFilePath);
                break;
            } else if (existsSync(resolvedFilePath) && extname(resolvedFilePath) === '.db') {
                this.SQLQuery = notSQLQuery(resolvedFilePath);
                break;
            }
        }

        this.SQLQuery.prepare(`CREATE TABLE IF NOT EXISTS ${options.table} (key TEXT, value TEXT)`).run();
    }

    public getAll() {
        return this.SQLQuery.prepare(`SELECT * FROM ${this.options.table}`).all();
    }

    public get(key: string) {
        return this.SQLQuery.prepare(`SELECT * FROM ${this.options.table} WHERE key = ?`).get(key);
    }

    public set(key: string, value: any) {
        this.SQLQuery.prepare(`INSERT OR REPLACE INTO ${this.options.table} (key, value) VALUES (?, ?)`).run(key, value);
    }
}