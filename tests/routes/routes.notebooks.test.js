const mongoose = require('mongoose');
const app = require('../../server');
const supertest = require('supertest');
const request = supertest(app);
const nock = require('nock');
const User = require('../../models/User');
const Notebook = require('../../models/Notebook');
const Note = require('../../models/Note');

require('dotenv').config();

describe("/notebooks", () => {
    jest.setTimeout(30000);

    let u;
    beforeAll(done => {
        mongoose.connect(process.env.TEST_DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(async () => {
                console.log("MongoDB successfully connected")
                u = await User.create({ name: "Test User", username: "testusername" })
                done();
            })
            .catch(err => {
                console.log(err)
                done("error", err);
            });
    });
    
    afterAll(async () => {
        await User.deleteMany();
        await mongoose.disconnect();
    });

    describe("post /notebooks", () => {
        describe("If provided a name and owner id", () => {
            let response;
            // let nb;
            let findNb;
            let findU;

            beforeAll(async done => {
                // nb = await Notebook.create({ name: "Test Note", owner: testownerid });
                response = await request.post(`/notebooks`).send({ name: "Test Notebook", owner: u.id })
                findNb = await Notebook.find({})
                findU = await User.find({})
                done();
            })

            afterAll(async () => {
                await Notebook.deleteMany();
            })

            it("Should create a new notebook with provided name and owner", () => {
                expect(findNb[0].name).toBe("Test Notebook");
                expect(toString(findNb[0].owner)).toBe(toString(u._id))
            })

            it("Should render successful message", () => {
                expect(response.status).toBe(201);
            })

            it("Should return notebook with correct attributes", () => {
                // console.log(response.body);
                expect(response.body.name).toBe("Test Notebook");
                expect(response.body.owner).toEqual(u.id);
            })

            it("Owner's notebooks should have the notebook", () => {
                // console.log("notebooks", findU[0]);
                expect(findU[0].notebooks.length).toBe(1);
                expect(toString(findU[0].notebooks[0])).toBe(toString(findNb[0].id));
            })
        })

        describe("If name is not provided", () => {
            let response;
            // let nb;
            let findNb;

            beforeAll(async done => {
                // nb = await Notebook.create({ name: "Test Note", owner: testownerid });
                response = await request.post(`/notebooks`).send({ owner: u.id })
                findNb = await Notebook.find({})
                done();
            })

            afterAll(async () => {
                await Notebook.deleteMany();
            })

            it("Should return a 400 error and error message", () => {
                expect(response.status).toBe(400)
                expect(response.body.errors).toBe("Notebook's name must be provided")
            })

            it("Should not create a new notebook", () => {
                expect(findNb.length).toBe(0);
            })
        })

        describe("If owner is not provided", () => {
            let response;
            let findNb;

            beforeAll(async done => {
                response = await request.post(`/notebooks`).send({ name: "Test Notebook" })
                findNb = await Notebook.find({})
                done();
            })

            afterAll(async () => {
                await Notebook.deleteMany();
            })

            it("Should return a 400 error and error message", () => {
                expect(response.status).toBe(400);
                expect(response.body.errors).toBe("Notebook's owner id must be provided")
            });

            it("Should not create a new notebook", () => {
                expect(findNb.length).toBe(0);
            })
        })
    })
})