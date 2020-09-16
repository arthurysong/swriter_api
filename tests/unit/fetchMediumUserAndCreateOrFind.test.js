const fetchMediumUserAndCreateOrFind = require('../../routes/helpers/fetchMediumUserAndCreateOrFind');
const nock = require('nock');
const User = require('../../models/User');
const mongoose = require('mongoose');
const Notebook = require('../../models/Notebook');
const Note = require('../../models/Note');
require('dotenv').config();

describe("fetchMediumUserAndCreateOrFind", () => {
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

    afterEach(async done => {
        await User.deleteMany();
        await Notebook.deleteMany();
        done();
    })

    describe("If access token is valid", () => {
        beforeEach(() => {
            nock('https://api.medium.com')
                .get('/v1/me')
                .reply(200, { data: { name: "Test User", username: "testUsername1", id: "testmediumid123" }})
        })

        describe("If user is not already created", () => {
            let result;
            beforeEach(async done => {
                fetchMediumUserAndCreateOrFind("testAccessToken", "testRefreshToken")
                    .then(res => {
                        result = res
                        // console.log(res);
                        done();
                    })
                    .catch(err => { 
                        // console.log("fetch error", err);
                        done();
                    });
            })

            it("Should pass", () => {
                expect(2).toBe(2);
            })

            it("Should resolve to an object that contains user, new_access_token, and refresh_token", () => {
                expect(result.new_access_token).toBe("testAccessToken")
                expect(result.refresh_token).toBe("testRefreshToken")
                expect(result.user.name).toBe("Test User");
                expect(result.user.username).toBe("testUsername1");
            })
            
            it("Should resolve with a populated notebooks", () => {
                // const users = await User.find({ name: "Test User", username: "testUsername1"});
                // expect(users.notebooks).toHaveProperty("name");
                expect(result.user.notebooks[0]).toHaveProperty("name");
            })

            

            it("Should save the new user to the database", async done => {
                const users = await User.find({ name: "Test User", username: "testUsername1"});
                // console.log("Users", users);
                expect(users.length).toBe(1);
                done();
            })

            it("Should create the user's first notebook", async done => {
                User.findOne({ name: "Test User", username: "testUsername1"})
                    .populate('notebooks')
                    .exec((err, user) => {
                        // console.log('PopulatedUser', user);
                        expect(user.notebooks.length).toBe(1);
                        expect(user.notebooks[0].name).toBe("First Notebook");
                        done();
                    });
            })

            it("Should save the medium profile id to the user's document", async done => {
                const users = await User.find({ name: "Test User", username: "testUsername1" });
                // console.log("users", users);
                expect(users[0].mediumId).toBe("testmediumid123");
                done();
            })
        })

        describe("If user does already exist", () => {
            // beforeEach create new User. with the same username
            let result; 
            beforeEach(async done => {
                const user = await User.create({ name: "Test User", username: "testUsername1" })
                const notebook = await Notebook.create({ name: "First Notebook", owner: user })
                user.notebooks.push(notebook._id);
                await user.save();

                const note = await Note.create({ title: "Test Note", content: "Test Content", owner: user._id, notebook: notebook._id })
                notebook.notes.push(note._id);
                await notebook.save();

                fetchMediumUserAndCreateOrFind("testAccessToken", "testRefreshToken")
                    .then(res => {
                        result = res
                        done();
                    })
                    .catch(err => { 
                        console.log("fetch error", err);
                        done();
                    });
            })

            it("Should resolve to an object that contains user, new_access_token, and refresh_token", () => {
                expect(result.new_access_token).toBe("testAccessToken")
                expect(result.refresh_token).toBe("testRefreshToken")
                expect(result.user.name).toBe("Test User");
                expect(result.user.username).toBe("testUsername1");
            })

            it("Should resolve with a populated Notebooks", () => {
                // console.log(result);
                expect(result.user.notebooks[0]).toHaveProperty("name");
            })

            it("Should resolve with a notebook that's populated with notes", () => {
                // console.log("result", result.user.notebooks[0]);
                expect(result.user.notebooks[0].notes[0]).toHaveProperty("title", "Test Note");
                expect(result.user.notebooks[0].notes[0]).toHaveProperty("content", "Test Content");
            })

            it("Should not create another user", async done => {
                const users = await User.find({ name: "Test User", username: "testUsername1" });
                expect(users.length).toBe(1);
                done();
            })

            // it("Should save the medium profile id to the user's document", async done => {
            //     const users = await User.find({ name: "Test User", username: "testUsername1" });
            //     expect(users[0].mediumId).toBe("testmediumid123");
            //     done();
            // })
        })
    })

    describe("If access token is not valid", () => {
        let result;

        beforeEach(async done => {
            nock('https://api.medium.com')
                .get('/v1/me')
                .once()
                .reply(200, { errors: "Access Token is invalid" });
            nock('https://api.medium.com')
                .get('/v1/me')
                .once()
                .reply(200, { data: { name: "Test User", username: "testUsername1" }});
            nock('https://api.medium.com')
                .post('/v1/tokens')
                .reply(200, { access_token: "validAccessToken" });
            fetchMediumUserAndCreateOrFind("invalidAccessToken", "testRefreshToken")
                .then(res => {
                    result = res
                    // console.log(res);
                    done();
                })
                .catch(err => { 
                    // console.log("fetch error", err);
                    done();
                });
        })

        it("Should resolve with new valid token", () => {
            expect(result.new_access_token).toBe("validAccessToken");
        })

        it("Should resolve with newly created user", () => {
            expect(result.user.name).toBe("Test User")
            expect(result.user.username).toBe("testUsername1")
        })

        it("Should resolve with a populated Notebooks", () => {
            expect(result.user.notebooks[0]).toHaveProperty("name");
        })

        it("Should save the new user to database", async done => {
            const users = await User.find({})
            expect(users.length).toBe(1);
            done();
        })
    })
})