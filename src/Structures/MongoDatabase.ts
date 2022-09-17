import { get, set } from "lodash";
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
            },
            
            value: {
                type: mongoClient.Schema.Types.Mixed
            }
        });

        this.options = options;
        this.collectionName = options.collectionName;
        this.connection = mongoClient.createConnection(
            this.options.url,
            this.options.clientOptions
        );

        this.collection = this.connection.model(this.options.collectionName, schema);
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
}