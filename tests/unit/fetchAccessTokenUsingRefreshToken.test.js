const fetchAccessTokenUsingRefreshToken = require("../../routes/helpers/fetchAccessTokenUsingRefreshToken");
const nock = require('nock');
require('dotenv').config();

describe("fetchAccessTokenUsingRefreshToken", () => {
    describe("If refresh token is valid", () => {
        beforeEach(() => {
            nock('https://api.medium.com')
                .post('/v1/tokens')
                .reply(200, { access_token: "testAccessToken" })
        })
        // beforeAll(() => {
            
        // })
        it("Should resolve to the new access_token", async done => {
            let accessToken = await fetchAccessTokenUsingRefreshToken("testRefreshToken")
            console.log(accessToken);
            expect(accessToken).toBe("testAccessToken");
            done();
        })
    })
})