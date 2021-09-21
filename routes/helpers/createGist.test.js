const createGist = require("./createGist")
// @ponicode
describe("createGist", () => {
    test("0", () => {
        let callFunction = () => {
            createGist("(no description available)", { gistName: "v4.0.0-rc.4", gistContent: "v1.2.4" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            createGist("Organize files in your directory instantly, ", { gistName: "4.0.0-beta1\t", gistContent: "^5.0.0" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            createGist("policy_abc", { gistName: "v1.2.4", gistContent: "4.0.0-beta1\t" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            createGist("(no description available)", { gistName: "4.0.0-beta1\t", gistContent: "4.0.0-beta1\t" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            createGist("Organize files in your directory instantly, ", { gistName: "v4.0.0-rc.4", gistContent: "^5.0.0" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            createGist(undefined, { gistName: undefined, gistContent: undefined })
        }
    
        expect(callFunction).not.toThrow()
    })
})
