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
    const usersCollection = db.collection('users');

    // insert
    usersCollection.insertOne({
        name: "Tom",
        age: 23
    })
        .then(result => console.log(result.ops))
        .catch(error => console.error(error))


    // insert many
    let insertUsers = [{ name: "Bob", age: 34 }, { name: "Alice", age: 21 }, { name: "Tom", age: 45 }];

    usersCollection.insertMany(insertUsers)
        .then(result => console.log(result))
        .catch(error => console.error(error))

    // find All
    //Метод find возвращает специальный объект - Cursor, и чтобы получить все данные у этого объекта вызывается метод toArray()
    usersCollection.find()
        .toArray()
        .then(result => console.log(result))
        .catch(error => console.error(error))

    // find({name: Tom}) найти всех с именем Tom
    usersCollection.find({ name: 'Tom' })
        .toArray()
        .then(result => console.log(result))
        .catch(error => console.error(error))

    // findOne({name: Tome}) - method find the first element with selected option
    usersCollection.findOne({ name: 'Tom' })
        .then(result => console.log(result))
        .catch(error => console.error(error))

    // delete many. В ответе удаления будет представлять сложный объект, содержащий информацию о количестве удаленных моделей
    db.collection('users').deleteMany({ age: 26 })
        .then(result => console.log(result))
        .catch(error => console.log(error));

    // delete one
    db.collection('users')
        .deleteOne({ name: 'Gunther' })
        .then(result => console.log(result))
        .catch(error => console.log(error));

    //  findOneAndDelete() удаляет один документ по определенному критерию, 
    // но по сравнению с методом deleteOne() он возвращает удаленный документ:
    usersCollection.
        findOneAndDelete({ name: 'Tom' })
        .then(result => console.log(result))
        .catch(error => console.log(error));

    //Метод drop() удаляет всю коллекцию: 
    usersCollection
        .drop()
        .then(result => console.log(result))
        .catch(error => console.log(error));

    //updateOne: обновляет один документ, который соответствует критерию фильтрации, и возвращает информацию об операции обновления

    //updateMany: обновляет все документы, которые соответствуют критерию фильтрации, и возвращает информацию об операции обновления

    //findOneAndUpdate: обновляет один документ, который соответствует критерию фильтрации, и возвращает обновленный документ

    usersCollection
        .findOneAndUpdate(
            { age: 21 }, // критерий выборки
            { $set: { age: 25 } }, // параметр обновления
            {                       // доп опция обновления
                returnOriginal: false // возвращает старое значение, а не новое обновленное
            }
        )
        .then(result => console.log(result))
        .catch(error => console.log(error));


    usersCollection
        .updateMany(
            { name: "Sam" },
            { $set: { name: "Bob" } },
        )
        .then(result => console.log(result))
        .catch(error => console.log(error));

    usersCollection
        .updateOne(
            { name: "Sam" },
            { $set: { name: "Tom Junior", age: 33 } },
        )
        .then(result => console.log(result))
        .catch(error => console.log(error));
});

