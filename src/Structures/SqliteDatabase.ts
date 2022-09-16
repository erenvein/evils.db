import { Database } from "./Database";
import { DatabaseError } from "./Error";
import { SqliteDatabaseOptions } from "./Interface";
import { join, sep, extname } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { get, set, unset } from 'lodash';

export class SqliteDatabase extends Database {
    private SQLQuery: any;
    private options: SqliteDatabaseOptions;
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
        return this.cache;
    }

    public get(key: string) {
        return get(this.cache, key);
    }

    public set(key: string, value: any) {
        let dotKey = key.split('.')[0];
        let data = get(this.cache, dotKey);

        set(this.cache, key, value);

        if(data) {
            if(key.includes('.')) {
                set(this.cache, dotKey, data)
                set(this.cache, key, value)

                this.SQLQuery.prepare(`UPDATE ${this.options.table} SET value = ? WHERE key = ?`).run(JSON.stringify(data), dotKey);
            } else {
                this.SQLQuery.prepare(`UPDATE ${this.options.table} SET value = ? WHERE key = ?`).run(JSON.stringify(value), key);
            }
        } else {
            if(key.includes('.')) {
                this.SQLQuery.prepare(`INSERT INTO ${this.options.table} (key, value) VALUES (?, ?)`).run(dotKey, JSON.stringify(value));
            } else {
                this.SQLQuery.prepare(`INSERT INTO ${this.options.table} (key, value) VALUES (?, ?)`).run(key, JSON.stringify(value));
            }
        }

        return value;


    }

    public remove(key: string) {
        unset(this.cache, key);

        this.SQLQuery.prepare(`DELETE FROM ${this.options.table} WHERE key = ?`).run(key);
    }
}