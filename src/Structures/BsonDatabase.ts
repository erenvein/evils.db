import { existsSync, writeFileSync } from "fs";
import { set, get, has } from "lodash";
import { sep } from "path";
import { Database } from "./Database";
import { DatabaseError } from "./Error";
import type { BsonDatabaseOptions } from "./Interface";


export class BsonDatabase extends Database {
    private options: BsonDatabaseOptions;
    private bson: any = undefined;
    public constructor(options: BsonDatabaseOptions) {
        super();
        
        
        this.options = options;

        try {
        this.bson = require('bson')
        } catch {
            throw new DatabaseError('The "bson" module is not installed. Please install it with "npm install bson"');
        }

        const resolvedFilePath = process.cwd();
        const filePath = resolvedFilePath + sep + this.options.filePath;

        const paths = this.options.filePath.split(sep);

        for (const path of paths) {
            const resolvedPath = resolvedFilePath + sep + path;

            if (!existsSync(resolvedPath)) {
                writeFileSync(resolvedPath, '');
            }
        }

    }   

    public set(key: string, value: any) {
        set(this.cache, key, value);
        writeFileSync(this.options.filePath, this.bson.serialize(this.cache));
        return value;
    }

    public get(key: string) {
        return get(this.cache, key);
    }

    public getAll() {
        return this.cache;
    }

    public delete(key: string) {
        const value = get(this.cache, key);
        delete this.cache[key];
        writeFileSync(this.options.filePath, this.bson.serialize(this.cache));
        return value;
    }

    public clear() {
        this.cache = {};
        writeFileSync(this.options.filePath, this.bson.serialize(this.cache));
        return this.cache;
    }

    public has(key: string) {
        return has(this.cache, key);
    }

    public get size() {
        return Object.keys(this.cache).length;
    }

    public get filePath() {
        return this.options.filePath;
    }

}