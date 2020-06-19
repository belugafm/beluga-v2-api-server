import { user_name } from "../../../app/web/api/validation"
import { ValidationError } from "../../../app/web/api/validation/error"

describe("user_name", () => {
    test("user_name", () => {
        const schema = user_name()
        expect(() => {
            schema.check("")
        }).toThrow(ValidationError)
        expect(() => {
            schema.check("*")
        }).toThrow(ValidationError)
        expect(() => {
            schema.check(
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            )
        }).toThrow(ValidationError)
        expect(schema.check("beluga")).toBeUndefined()
    })
})
