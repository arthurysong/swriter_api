const fetchAccessToken = require('../../routes/helpers/fetchAccessToken');
const nock = require('nock');

describe('fetchAccessToken', () => {
    describe("If code is valid", () => {
        let result
        beforeEach(() => {
            nock('https://api.medium.com/')
                .post('/v1/tokens')
                .reply(200, { access_token: "testAccessToken", refresh_token: "testRefreshToken" })
        })

        it("Should resolve to an object with access_token and refresh_token", async done => {
            result = await fetchAccessToken('validCode');
            expect(result.access_token).toBe("testAccessToken")
            expect(result.refresh_token).toBe("testRefreshToken")
            done();
        })
    })
    describe("If code is invalid", () => {
        beforeEach(() => {
            nock('https://api.medium.com/')
                .post('/v1/tokens')
                .reply(200, { errors: "Invalid Code" })
        })

        it("Should error with errors", async () => {
            await fetchAccessToken("invalidCode")
                .catch(e => {
                    expect(e).toBe("Invalid Code");
                });
        })
    })
})