const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');


// Delete all userrs from DB before each test request
beforeEach(setupDatabase)

// afterEach(() => {
//     console.log("after each");
// })

test('Should sign a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Andrew',
            email: 'andrew@example.com',
            password: 'MyPass777!'
        }).expect(201);

    // Assert that the database was cahnged correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Asserstion about the response name
    expect(response.body.user.name).toBe('Andrew');

    // Asserstion about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'andrew@example.com',
        },
        token: user.tokens[0].token
    });

    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        }).expect(200)

    const user = await User.findById(response.body.user._id);

    // Assert the token in response matches users token
    expect(response.body.token).toBe(user.tokens[1].token);
    expect(response.body.user.email).toBe(user.email);
    expect(response.body.user.name).toBe(user.name);
})

test('Should not login nonexisting user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: 'blaBla#24'
        }).expect(403)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`) //header
        .send() // body
        .expect(200);
})


test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', null) //header
        .send() // body
        .expect(401);
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer not.aaaaa.token`)
        .send()
        .expect(401);
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
})


test('Should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jess',
            password: 'updatePass777!',
            email: 'update@example.com',
            age: 24,
        })
        .expect(200);


    expect(response.body.name).toBe('Jess');
    expect(response.body.email).toBe('update@example.com');
    expect(response.body.age).toBe(24);
})

test('Should not update unvalid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Philadelphia'
        })
        .expect(400);

}) 
