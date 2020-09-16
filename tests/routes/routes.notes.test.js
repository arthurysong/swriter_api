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

    describe("post /:id/publish", () => {
        describe("If note has already been published", () => {
            let n; 
            let response;
            beforeAll(async done => {
                n = await Note.create({ title: "Test Title", content: "Test Content", published: true })
                response = await request.post(`/notes/${n._id}/publish`).send({ access_token: "testAccessToken", refresh_token: "testRefreshToken" })
                done();
            })

            afterAll(async done => {
                await Note.deleteMany();
            });

            it("Should render a error response", () => {
                expect(response.status).toBe(400)
                expect(response.body.errors).toBe("Note has already been published");
            });
        })

        describe("If note has not been published", () => {
            let n;
            let u;
            let mediumScope;
            let response;


            beforeAll(async done => {
                u = await User.create({ name: "Test User", username: "testusername", mediumId: "testmediumid123" })
                n = await Note.create({ title: "Test Title", content: "Test Content", owner: u._id })

                mediumScope = nock('https://api.medium.com')
                    .post('/v1/users/testmediumid123/posts')
                    .reply(201, { data: {
                        id: "e6f36a",
                        title: "Test Title",
                        authorId: "testuser123",
                        tags: ["tag1", "tag2", "tag3"],
                        url: "https://medium.com/@testuser/test-title-e6f36a",
                        publishedStatus: "public"
                    }})
                response = await request.post(`/notes/${n._id}/publish`).send({ access_token: "testAccessToken", refresh_token: "testRefreshToken" })
                done();
            })

            afterAll(async done => {
                await User.deleteMany();
                await Note.deleteMany();
            })

            it("Should publish the post on Medium", () => {
                expect(mediumScope.isDone()).toBe(true);
            })

            it("Should render a success message", () => {
                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(response.body.note.title).toBe("Test Title");
                expect(response.body.note.content).toBe("Test Content");
                expect(response.body.note.published).toBe(true);
                expect(response.body.note.mediumURL).toBe("https://medium.com/@testuser/test-title-e6f36a")
            })

            it("Should update the note in the database", async done => {
                let findN = await Note.findOne({ title: "Test Title" })
                expect(findN.title).toBe("Test Title");
                expect(findN.published).toBe(true);
                expect(findN.mediumURL).toBe("https://medium.com/@testuser/test-title-e6f36a");
                done();
            })
        })
    })
})