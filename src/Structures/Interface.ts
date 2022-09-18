export interface SqliteDatabaseOptions {
    filePath: string;
    table: string;
}

export interface MongoDatabaseOptions {
    url?: string;
    collection: string;
    collectionName: string;
    clientOptions?: any;
}

export interface YamlDatabaseOptions {
    filePath: string;
}

export interface JsonDatabaseOptions {
    filePath: string;
}

export interface BsonDatabaseOptions {
    filePath: string;
}