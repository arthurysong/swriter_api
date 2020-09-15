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
    describe("put /notes/:id", () => {
        let response;
        let n;
        let findN;

        beforeAll(async done => {
            n = await Note.create({ title: "Test Note", content: "Test Content" });
            response = await request.put(`/notes/${n._id}`).send({ title: "New Edited Title", content: "New Edited Content" })
            findN = await Note.findOne({ _id: n._id })
            done();
        })

        afterAll(async () => {
            await Note.deleteMany();
        })

        it("Should update the existing note with new content", () => {
            expect(findN.content).toBe("New Edited Content");
            expect(findN.title).toBe("New Edited Title")
        })

        it("Should render success message and return new note with updated info", () => {
            expect(response.body.note.content).toBe("New Edited Content");
            expect(response.body.note.title).toBe("New Edited Title");
            expect(response.body.message).toBe("Note successfully saved");
            expect(response.status).toBe(200);
        })

        describe("If only title is provided in request", () => {
            let response;
            let n;
            let findN;

            beforeAll(async done => {
                n = await Note.create({ title: "Test Note", content: "Test Content" });
                response = await request.put(`/notes/${n._id}`).send({ title: "New Edited Title" })
                findN = await Note.findOne({ _id: n._id })
                done();
            })

            afterAll(async () => {
                await Note.deleteMany();
            })

            it("The title should be changed to new title", () => {
                expect(findN.title).toBe("New Edited Title");
            })

            it("The content should not be changed", () => {
                expect(findN.content).toBe("Test Content");
            })

            it("Should render successful response", () => {
                expect(response.status).toBe(200);
                expect(response.body.note.content).toBe("Test Content");
                expect(response.body.note.title).toBe("New Edited Title");
                expect(response.body.message).toBe("Note successfully saved");
            })
        })

        describe("If only content is provided in request", () => {
            let response;
            let n;
            let findN;

            beforeAll(async done => {
                n = await Note.create({ title: "Test Note", content: "Test Content" });
                response = await request.put(`/notes/${n._id}`).send({ content: "New Edited Content" })
                findN = await Note.findOne({ _id: n._id })
                done();
            })

            afterAll(async () => {
                await Note.deleteMany();
            })

            it("The content should be changed to new content", () => {
                expect(findN.content).toBe("New Edited Content");
            });

            it("The title should not be changed", () => {
                expect(findN.title).toBe("Test Note");
            })

            it("Should render successful response", () => {
                expect(response.status).toBe(200);
                expect(response.body.note.content).toBe("New Edited Content");
                expect(response.body.note.title).toBe("Test Note");
                expect(response.body.message).toBe("Note successfully saved");
            });
        })
    })

    describe("post /notes", () => {
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

            it("The associated notebook should have the new note's id", done => {
                // console.log(nb);
                Notebook.findOne({ _id: nb.id }, (err, nb) => {
                    expect(nb.notes[0].notebook).toBe(response.body.id)
                    done();
                })
            });
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