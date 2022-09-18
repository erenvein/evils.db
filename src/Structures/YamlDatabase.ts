import { existsSync, writeFileSync } from "fs";
import { get, set } from "lodash";
import { sep } from "path";
import { Database } from "./Database";
import { DatabaseError } from "./Error";
import type { YamlDatabaseOptions } from "./Interface";


export class YamlDatabase extends Database {
    private options: YamlDatabaseOptions;
    private yaml: any = undefined;
    public constructor(options: YamlDatabaseOptions) {
        super();
        
        
        this.options = options;

        try {
        this.yaml = require('yaml')
        } catch {
            throw new DatabaseError('The "yaml" module is not installed. Please install it with "npm install yaml"');
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
        writeFileSync(this.options.filePath, this.yaml.stringify(this.cache));
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
        writeFileSync(this.options.filePath, this.yaml.stringify(this.cache));
        return value;
    }

    public clear() {
        this.cache = {};
        writeFileSync(this.options.filePath, this.yaml.stringify(this.cache));
        return this.cache;
    }

    public has(key: string) {
        return this.cache[key] ? true : false;
    }

    public push(key: string, value: any) {
        const data = this.get(key);
        if (!data) throw new DatabaseError(`The key "${key}" does not exist in the database.`);
        if (!Array.isArray(data)) throw new DatabaseError(`The key "${key}" is not an array.`);
        data.push(value);
        this.set(key, data);
        return data;
    }

    public subtract(key: string, value: number) {
        const data = this.get(key);
        if (!data) throw new DatabaseError(`The key "${key}" does not exist in the database.`);
        if (typeof data !== 'number') throw new DatabaseError(`The key "${key}" is not a number.`);
        this.set(key, data - value);
        return data - value;
    }

    public add(key: string, value: number) {
        const data = this.get(key);
        if (!data) throw new DatabaseError(`The key "${key}" does not exist in the database.`);
        if (typeof data !== 'number') throw new DatabaseError(`The key "${key}" is not a number.`);
        this.set(key, data + value);
        return data + value;
    }

    public divide(key: string, value: number) {
        const data = this.get(key);
        if (!data) throw new DatabaseError(`The key "${key}" does not exist in the database.`);
        if (typeof data !== 'number') throw new DatabaseError(`The key "${key}" is not a number.`);
        this.set(key, data / value);
        return data / value;
    }

    public multiply(key: string, value: number) {

        const data = this.get(key);
        if (!data) throw new DatabaseError(`The key "${key}" does not exist in the database.`);
        if (typeof data !== 'number') throw new DatabaseError(`The key "${key}" is not a number.`);
        this.set(key, data * value);
        return data * value;
    }

    public includes(key: string, value: any) {
        const data = this.get(key);
        if (!data) throw new DatabaseError(`The key "${key}" does not exist in the database.`);
        if (!Array.isArray(data)) throw new DatabaseError(`The key "${key}" is not an array.`);
        return data.includes(value);
    }

    public pull(key: string, value: any) {
        const data = this.get(key);
        if (!data) throw new DatabaseError(`The key "${key}" does not exist in the database.`);
        if (!Array.isArray(data)) throw new DatabaseError(`The key "${key}" is not an array.`);
        const index = data.indexOf(value);
        if (index === -1) return data;
        data.splice(index, 1);
        this.set(key, data);
        return data;
    }

    public get size() {
        return Object.keys(this.cache).length;
    }

    public get yamlCache() {
        return this.yaml.parse(require('fs').readFileSync(this.options.filePath, 'utf8'));
    }

   


}