const publishPost = require("../../routes/helpers/publishPost");
const nock = require('nock');
const Note = require("../../models/Note");
const mongoose = require('mongoose');
require('dotenv').config();

describe("publishPost", () => {
    // it("Should receive accessToken, user's Medium Id, and the note to post", () => {
    //     expect(publishPost.arguments.length).toBe(3);
    // })

    jest.setTimeout(10000);

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
        await mongoose.disconnect().then(() => console.log("MONGODB successfully disconnected"));
    });

    describe("If post is successful", () => {
        let n1;
        let resp; 
        beforeAll(async done => {
            n1 = await Note.create({ title: "Test Title", content: "Test Content" })
            nock('https://api.medium.com')
                .post('/v1/users/testmediumid123/posts')
                .reply(201, { data: {
                    id: "e6f36a",
                    title: "Test Title",
                    authorId: "testuser123",
                    tags: ["tag1", "tag2", "tag3"],
                    url: "https://medium.com/@testuser/test-title-e6f36a",
                    publishedStatus: "public"
                }})
            resp = await publishPost("testAccessToken", "testRefreshToken", "testmediumid123", n1)
            done();
        })
        
        afterAll(async done => {
            await Note.deleteMany();
            done();
        })

        it("Should update the published status of the note and the mediumURl of the note in the database", async done => {
            let n = await Note.findOne({ title: "Test Title" })
            expect(n.published).toBe(true);
            expect(n.mediumURL).toBe("https://medium.com/@testuser/test-title-e6f36a");
            done();
        });

        it("Should resolve with the updated note and success message", () => {
            expect(resp.success).toBe(true);
            expect(resp.note.title).toBe("Test Title");
            expect(resp.note.published).toBe(true);
            expect(resp.note.mediumURL).toBe("https://medium.com/@testuser/test-title-e6f36a");
        });
    });

    describe("If access Token is expired", () => {
        let tokenScope;
        let n1;
        let resp;

        beforeAll(async done => {
            n1 = await Note.create({ title: "Test Title", content: "Test Content" })
            nock('https://api.medium.com')
                .post('/v1/users/testmediumid123/posts')
                .once()
                .reply(401, { errors: "Acces Token is invalid or has been revoked" })
            nock('https://api.medium.com')
                .post('/v1/users/testmediumid123/posts')
                .once()
                .reply(201, { data: {
                    id: "e6f36a",
                    title: "Test Title",
                    authorId: "testuser123",
                    tags: ["tag1", "tag2", "tag3"],
                    url: "https://medium.com/@testuser/test-title-e6f36a",
                    publishedStatus: "public"
                }})
            tokenScope = nock('https://api.medium.com')
                .post('/v1/tokens')
                .reply(200, { access_token: "validAccessToken" });
            resp = await publishPost("badAccessToken", "testRefreshToken", "testmediumid123", n1);
            done();
        })
        
        afterAll(async done => {
            await Note.deleteMany();
            done();
        })

        it("Should make a call to Medium scope endpoint", () => {
            expect(tokenScope.isDone()).toBe(true);
        })

        it("Should update the published status of the note and the mediumURl of the note in the database", async done => {
            let n = await Note.findOne({ title: "Test Title" })
            expect(n.published).toBe(true);
            expect(n.mediumURL).toBe("https://medium.com/@testuser/test-title-e6f36a");
            done();
        });

        it("Should resolve with the updated note and success message", () => {
            expect(resp.success).toBe(true);
            expect(resp.note.title).toBe("Test Title");
            expect(resp.note.published).toBe(true);
            expect(resp.note.mediumURL).toBe("https://medium.com/@testuser/test-title-e6f36a");
        });
    })
})