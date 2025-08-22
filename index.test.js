const request = require('supertest');
// express app
const app = require('./index');

// db setup
const { sequelize, Dog } = require('./db');
const seed = require('./db/seedFn');
const {dogs} = require('./db/seedData');

describe('Endpoints', () => {
    // to be used in POST test
    const testDogData = {
        breed: 'Poodle',
        name: 'Sasha',
        color: 'black',
        description: 'Sasha is a beautiful black pooodle mix.  She is a great companion for her family.'
    };

    beforeAll(async () => {
        // rebuild db before the test suite runs
        await seed();
    });

    describe('GET /dogs', () => {
        it('should return list of dogs with correct data', async () => {
            // make a request
            const response = await request(app).get('/dogs');
            // assert a response code
            expect(response.status).toBe(200);
            // expect a response
            expect(response.body).toBeDefined();
            // toEqual checks deep equality in objects
            expect(response.body[0]).toEqual(expect.objectContaining(dogs[0]));
        });
    });

    describe('POST /dogs', () => {
        it('should return dog data that matches the data in testDogData', async () => {
            const response = await request(app)
                .post('/dogs')
                .send(testDogData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining(testDogData)) 
        })

        it('should create the dog in the database', async () => {
            const response = await request(app)
                .post('/dogs')
                .send(testDogData);

            const createdDog = await Dog.findByPk(response.body.id);
            expect(createdDog).toBeTruthy();
            expect(createdDog.name).toBe(testDogData.name);
        });

    })

    describe('DELETE /dogs/:id', () => {
        it('should delete dog with id 1', async () => {
            // delete dog
            const response = await request(app).delete('/dogs/1');
            expect(response.status).toBe(200);
            expect(response.text).toMatch(/deleted dog with id 1/);

            // query db to confirm
            const remainingDogs = await Dog.findAll({ where: { id: 1 } });
            expect(remainingDogs).toEqual([]);  // should be empty
        });
    });
});