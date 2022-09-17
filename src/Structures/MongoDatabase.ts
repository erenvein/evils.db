import { get, set, unset } from "lodash";
import { Database } from "./Database";
import { DatabaseError } from "./Error";
import type { MongoDatabaseOptions } from "./Interface";


export class MongoDatabase extends Database {
    private options: MongoDatabaseOptions;
    private collection: any;
    private connection: any;
    private collectionName: string;
    public constructor(options: MongoDatabaseOptions) {
        super();
        

        let mongoClient: any = undefined;
        
        try {
        mongoClient = require("mongoose");
        } catch {
            throw new DatabaseError('The "mongoose" module is not installed. Please install it with "npm install mongoose"');
        }

        let schema = new mongoClient.Schema({
            key: {
                type: mongoClient.Schema.Types.String,
                unique: true,
                required: true
            },
            
            value: {
                type: mongoClient.Schema.Types.Mixed,
                unique: true,
                required: true
            }
        });

        this.options = options;
        this.collectionName = options.collectionName;
        this.connection = mongoClient.createConnection(this.options.url, this.options.clientOptions)
        this.collection = this.connection.model(this.options.collectionName, schema);

        async() => {
            await this.setAll();
        }
    }

    public async set(key: string, value: any) {
        let dotKey = key.split('.')[0];
        let data = get(this.cache, dotKey);
        set(this.cache, key, value);

        if(data) {
            if(key.includes('.')) {
                set(this.cache, dotKey, data)
                set(this.cache, key, value)

                await this.collection.updateOne(
                    { key: dotKey },
                    { value: get(this.cache, dotKey) }
                )
            } else {
                await this.collection.updateOne({ key }, { value })
            }
        } else {
            if(key.includes('.')) {
               await this.collection.create({ key: dotKey, value: get(this.cache, dotKey) }) 
            } else {
                await this.collection.create({ key, value })
            }
        }

        return value;


    }

    public get(key: string) {
        return get(this.cache, key);
    }

    public async remove(key: string) {
        unset(this.cache, key);

        if(key.includes('.')) {
            let dotKey = key.split('.')[0];
            await this.set(dotKey, get(this.cache, dotKey))
        } else {
            await this.collection.deleteOne({ key })
        }
    }

    public async getAll() {
        return this.cache;
    }

    
    public async setAll() {
        let data = await this.collection.find();
        for (const item of data) {
            set(this.cache, item.key, item.value)
        }
        return this.cache;
    }

    public async push(key: string, value: any) {
        let data = get(this.cache, key);
        if(!data) data = [];
        data.push(value);
        await this.set(key, data);
        return data;
    }

    public async pull(key: string, value: any) {
        let data = get(this.cache, key);
        if(!data) data = [];
        data = data.filter((x: any) => x !== value);
        await this.set(key, data);
        return data;
    }

    public async add(key: string, value: any) {
        let data = get(this.cache, key);
        if(!data) data = 0;
        data += value;
        await this.set(key, data);
        return data;
    }

}