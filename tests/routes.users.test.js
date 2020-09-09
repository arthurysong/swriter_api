// const mongoose = require('mongoose');
// const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const app = require('../server');
// app.listen(6000);
const supertest = require('supertest');
const request = supertest(app);
const nock = require('nock');
const User = require('../models/User');
const Notebook = require('../models/Notebook');
const functions = require('../routes/helpers/fetchMediumUserAndRenderJSON');



require('dotenv').config();

describe("Users Routes", () => {
    let connection;

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
                let tokenScope;
                let testScope;
                let mediumProfileScope;

                beforeEach(() => {
                    tokenScope = nock('https://api.medium.com')
                        .post('/v1/tokens')
                        .reply(200, { access_token: "test12345", refresh_token: "test54321"})
                    testScope = nock('https://shouldnotbecalled.com')
                        .get('/')
                        .reply(200);
                    mediumProfileScope = nock('https://api.medium.com')
                        .get('/v1/me')
                        .reply(200, { data: { name: "Bob", username: "Boy" }})
                })

                it("Should call fetchMediumUserAndRenderJSON", async done => {
                    const spy = jest.spyOn(functions, 'fetchMediumUserAndRenderJSON');
                    const spy2 = jest.spyOn(functions, 'test');
                    response = await request.post('/users/medium-oauth').send({queryObject: { state: process.env.MEDIUM_STATE, code: 'test_code' }})
                    functions.test();
                    // functions.fetchMediumUserAndRenderJSON();
                    expect(spy2).toHaveBeenCalled();
                    done();
                })
            })

            // describe("If POST request to Oauth server unsuccessful", () => {
            //     it("Should render an error", test.todo)
            // });
        })
    })

    // describe("fetchMediumUserAndRenderJSON", () => {
    //     it("Should send GET request to Medium API for profile info", () => {
    //         expect(2).toBe(2);
    //     })

    //     describe("If GET request successful", () => {
    //         describe("If user exists", () => {
    //             it("Should find user and return user, access_token, and refresh_token", test.todo)
    //         })

    //         describe("If user doesn't exist", () => {
    //             it("Should create new user AND a new 'first notebook' for that user", test.todo)

    //             it("Should render JSON with user, access_token, and refresh_token", test.todo)
    //         })
    //     })

    //     describe("If GET request to Medium API not successful", () => {
    //         it("Should send POST request to Medium oauth server for new access_token", test.todo)
    //     })
    // })
})