
# evils.db

## Versions
![Image](https://img.shields.io/npm/v/evils.db)
![Image](https://img.shields.io/npm/dt/evils.db)
![Image](https://nodei.co/npm/evils.db.png)

## Features

- Mongodb support
- Sqlite support

## Examples

# ES6
```javascript
import { MongoDatabase } from 'evils.db';

const db = new MongoDatabase({
    url: '',
    collection: 'evilsdb',
    collectionName: 'evilsdb',
    
})

const main = async () => {
    
    await db.set('test', 'test')

}

main();
```

# Javascript

```javascript
const { MongoDatabase } = require('evils.db');

const db = new MongoDatabase({
    url: '',
    collection: 'evilsdb',
    collectionName: 'evilsdb',
    
})

const main = async () => {
    
    await db.set('test', 'test')

}

main();
```
