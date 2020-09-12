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

describe("Note Routes", () => {
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

    // afterEach(async () => {
    //     await Note.
    // })

    describe("/post", () => {
        describe("If all four body parameters are provided", () => {
            let response;
            let u;
            let nb;
            beforeAll(async done => {
                u = await User.create({ name: "Test User", username: "testusername123" })
                nb = await Notebook.create({ name: "Test Notebook" })
                response = await request.post('/notes').send({ title: 'Test Note', content: 'Test Content 123123123',  owner: u._id, notebook: nb._id })
                done();
                // const n = Note.create({ title: "Test Note", content: "Test Content 123123123", owner: u._id, notebook: nb._id })
            })

            afterAll(async () => {
                await User.deleteMany();
                await Notebook.deleteMany();
                await Note.deleteMany();
            })

            it("Should render new note", () => {
                expect(response.status).toBe(201)
                expect(response.body.title).toBe("Test Note");
                expect(response.body.content).toBe("Test Content 123123123");
                expect(response.body.owner).toEqual(u.id);
                expect(response.body.notebook).toEqual(nb.id);
            })

            it("Should save the new note to the database", () => {
                Note.find({}, (err, notes) => {
                    expect(notes.length).toBe(1);
                })
            })
        })

        describe("If bad request", () => {
            let u;
            let nb;

            beforeEach(async done => {
                u = await User.create({ name: "Test User", username: "testusername123" })
                nb = await Notebook.create({ name: "Test Notebook" })
                done();
            })

            afterEach(async () => {
                await User.deleteMany();
                await Notebook.deleteMany();
                await Note.deleteMany();
            })

            it("If request is missing owner params it should fail", async done => {
                const response = await request.post('/notes').send({ title: 'Test Note', content: 'Test Content 123123123',  notebook: nb._id })
                expect(response.status).toBe(400)
                expect(response.body.errors).toBe("Must provide owner id")
                done();
            })

            it("If request is missing notebook params it should fail", async done => {
                const response = await request.post('/notes').send({ title: 'Test Note', content: 'Test Content 123123123', owner: u._id })
                expect(response.status).toBe(400)
                expect(response.body.errors).toBe("Must provide notebook id")
                done();
            })
        })
    })
})