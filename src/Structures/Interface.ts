export interface SqliteDatabaseOptions {
    filePath: string;
    table: string;
}

export interface MongoDatabaseOptions {
    url: string;
    collection: string;
    collectionName: string;
    clientOptions: string;
}