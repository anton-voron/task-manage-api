//CRUD mongodb
const { MongoClient } = require('mongodb');

// define url to conect to db
const connectionURL = process.env.MONGODB_URL;
const databaseName = 'task-manager';

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connectto database!');
    }

    const db = client.db(databaseName);


    db.collection('users').deleteMany({ age: 26 })
        .then(result => console.log(result))
        .catch(error => console.log(error));

    db.collection('users')
        .deleteOne({ name: 'Gunther' })
        .then(result => console.log(result))
        .catch(error => console.log(error));

});