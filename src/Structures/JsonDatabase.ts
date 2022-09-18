import { existsSync, writeFileSync } from "fs";
import { set, get, has } from "lodash";
import { sep } from "path";
import { Database } from "./Database";
import { DatabaseError } from "./Error";
import type { JsonDatabaseOptions } from "./Interface";


export class JsonDatabase extends Database {
    private options: JsonDatabaseOptions;
    private json: any = undefined;
    public constructor(options: JsonDatabaseOptions) {
        super();
        
        
        this.options = options;

        try {
        this.json = require('json')
        } catch {
            throw new DatabaseError('The "json" module is not installed. Please install it with "npm install json"');
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
        writeFileSync(this.options.filePath, this.json.stringify(this.cache));
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
        writeFileSync(this.options.filePath, this.json.stringify(this.cache));
        return value;
    }

    public clear() {
        this.cache = {};
        writeFileSync(this.options.filePath, this.json.stringify(this.cache));
        return this.cache;
    }

    public has(key: string) {
        return has(this.cache, key);
    }

    public add(key: string, value: number) {
        if (!this.has(key)) {
            this.set(key, value);
            return value;
        }

        const data = this.get(key);
        const added = data + value;
        this.set(key, added);
        return added;
    }

    public subtract(key: string, value: number) {

        if (!this.has(key)) {
            this.set(key, value);
            return value;
        }

        const data = this.get(key);
        const subtracted = data - value;
        this.set(key, subtracted);
        return subtracted;
    }

    public push(key: string, value: any) {
        if (!this.has(key)) {
            this.set(key, [value]);
            return [value];
        }

        const data = this.get(key);
        data.push(value);
        this.set(key, data);
        return data;
    }

    public pull(key: string, value: any) {
        if (!this.has(key)) {
            this.set(key, [value]);
            return [value];
        }

        const data = this.get(key);
        const index = data.indexOf(value);
        if (index > -1) {
            data.splice(index, 1);
        }
        this.set(key, data);
        return data;
    }

    public includes(key: string, value: any) {
        if (!this.has(key)) {
            this.set(key, [value]);
            return false;
        }

        const data = this.get(key);
        return data.includes(value);
    }

    public get size() {
        return Object.keys(this.cache).length;
    }

    
}