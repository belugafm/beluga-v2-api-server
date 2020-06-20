import { password } from "../../../app/validation"
import { ValueSchemaValidationError } from "../../../app/validation/error"

describe("password", () => {
    test("password", () => {
        const schema = password()
        expect(() => {
            schema.check("")
        }).toThrow(ValueSchemaValidationError)
        expect(() => {
            schema.check("aaaa")
        }).toThrow(ValueSchemaValidationError)
        expect(schema.check("password")).toBeUndefined()
    })
})
