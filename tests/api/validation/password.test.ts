import { password } from "../../../app/web/api/validation"
import { ValidationError } from "../../../app/web/api/validation/error"

describe("password", () => {
    test("password", () => {
        const schema = password()
        expect(() => {
            schema.check("")
        }).toThrow(ValidationError)
        expect(() => {
            schema.check("aaaa")
        }).toThrow(ValidationError)
        expect(schema.check("password")).toBeUndefined()
    })
})
