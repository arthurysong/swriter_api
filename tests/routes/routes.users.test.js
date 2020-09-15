// const mongoose = require('mongoose');
// const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const app = require('../../server');
// app.listen(6000);
const supertest = require('supertest');
const request = supertest(app);
const nock = require('nock');
const User = require('../../models/User');
const Notebook = require('../../models/Notebook');
const Note = require('../../models/Note');
// const functions = require('../routes/helpers/fetchMediumUserAndRenderJSON');

require('dotenv').config();

describe("Users Routes", () => {
    jest.setTimeout(30000);

    beforeAll(done => {
        mongoose.connect(process.env.TEST_DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log("MongoDB successfully connected")
                done();
            })
            .catch(err => {
                console.log(err)
                done("error", err);
            });
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('/users/:id', () => {
        describe("If user is found", () => {
            let u;
            let response;
            let nb;
            let n;

            beforeAll(async done => {
                u = await User.create({ name: "Test User", username: "testusername123" })

                nb = await Notebook.create({ name: "Test Notebook", owner: u.id })
                u.notebooks.push(nb._id);
                await u.save();

                n = await Note.create({ title: "Test Note", content: "Test Note Content", owner: u.id, notebook: nb.id })
                nb.notes.push(n._id);
                await nb.save();

                response = await request.get(`/users/${u.id}`)
                done();
            })

            afterAll(async () => {
                await User.deleteMany();
                await Notebook.deleteMany();
                await Note.deleteMany();
            })

            it("Should return status 200", () => {
                expect(response.status).toBe(200)
            });

            it("Should render a user with correct id", () => {
                expect(response.body._id).toBe(u.id);
            });

            it("Should render a user with populated notebooks", () => {
                expect(response.body.notebooks[0]).toHaveProperty('name', 'Test Notebook');
                expect(response.body.notebooks[0]).toHaveProperty('owner', u.id);
                expect(response.body.notebooks[0]).toHaveProperty('_id', nb.id);
            });

            it("Should render a user with notebooks that are populated with notes", () => {
                expect(response.body.notebooks[0].notes[0]).toHaveProperty('title', 'Test Note');
                expect(response.body.notebooks[0].notes[0]).toHaveProperty('content', 'Test Note Content');
                expect(response.body.notebooks[0].notes[0]).toHaveProperty('_id', n.id);
            });
        })

        describe("If no users with id exists", () => {
            let response;
            beforeAll(async done => {
                response = await request.get(`/users/12341234`)
                done();
            })

            it("Should return status 404", () => {
                expect(response.status).toBe(404);
            });

            it("Should render error message: User with given id not found", () => {
                expect(response.body.errors).toBe("User with given id not found");
            })
        })
    })

    describe('/medium-oauth', () => {
        describe("If the request STATE is invalid", () => {
            it("Should render an error", async done => {
                const response = await request.post('/users/medium-oauth').send({queryObject: { state: 'INVALID_STATE', code: 'test_code' }})
                expect(response.status).toBe(403);
                expect(response.body.errors).toBe("Provided State is invalid");
                done();
            });
        })

        describe("If the request STATE is valid", () => {
            let response;
            let tokenScope;
            let testScope;
            let mediumProfileScope;

            beforeEach(async done => {

                tokenScope = nock('https://api.medium.com')
                    .post('/v1/tokens')
                    .reply(200, { access_token: "test12345", refresh_token: "test54321"})
                testScope = nock('https://shouldnotbecalled.com')
                    .get('/')
                    .reply(200);
                mediumProfileScope = nock('https://api.medium.com')
                    .get('/v1/me')
                    .reply(200, { data: { name: "Bob", username: "Boy" }})
                response = await request.post('/users/medium-oauth').send({queryObject: { state: process.env.MEDIUM_STATE, code: 'test_code' }})
                done();
            })

            afterEach(async () => {
                await User.deleteMany();
                await Notebook.deleteMany();
            });

            it("Should send POST request to Medium Oauth for access token", async done => {
                expect(tokenScope.isDone()).toBe(true);
                expect(testScope.isDone()).toBe(false);
                done();
            })

            describe("If POST request to Oauth server successful", () => {
            //     let tokenScope;
            //     let testScope;
            //     let mediumProfileScope;

                beforeEach(() => {
                    // nock('https://api.medium.com')
                    //     .post('/v1/tokens')
                    //     .reply(200, { access_token: "test12345", refresh_token: "test54321"})
            //         tokenScope = nock('https://api.medium.com')
            //             .post('/v1/tokens')
            //             .reply(200, { access_token: "test12345", refresh_token: "test54321"})
            //         testScope = nock('https://shouldnotbecalled.com')
            //             .get('/')
            //             .reply(200);
            //         mediumProfileScope = nock('https://api.medium.com')
            //             .get('/v1/me')
            //             .reply(200, { data: { name: "Bob", username: "Boy" }})
            //     })

            //     it("Should call fetchMediumUserAndRenderJSON", async done => {

            //     })
                });
            })

            // describe("If POST request to Oauth server unsuccessful", () => {
            //     it("Should render an error", test.todo)
            // });
        })
    })
})