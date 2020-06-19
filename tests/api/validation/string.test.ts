import { string } from "../../../app/web/api/validation"
import { ValidationError } from "../../../app/web/api/validation/error"

describe("input type", () => {
    test("invalid string", () => {
        const schema = string({})
        expect(() => {
            // @ts-ignore
            schema.check(1)
        }).toThrow(ValidationError)
        expect(() => {
            // @ts-ignore
            schema.check([])
        }).toThrow(ValidationError)
        expect(() => {
            // @ts-ignore
            schema.check({})
        }).toThrow(ValidationError)
    })
})

describe("min_length", () => {
    test("not set", () => {
        const schema = string({})
        expect(schema.check("")).toBeUndefined()
        expect(schema.check("beluga")).toBeUndefined()
    })
    test("shorter than 10", () => {
        const schema = string({
            min_length: 10,
        })
        expect(() => {
            schema.check("")
        }).toThrow(ValidationError)
        expect(() => {
            schema.check("beluga")
        }).toThrow(ValidationError)
        expect(schema.check("belugabeluga")).toBeUndefined()
    })
})

describe("max_length", () => {
    test("longer than 10", () => {
        const schema = string({
            max_length: 10,
        })
        expect(() => {
            schema.check("belugabelugabelugabeluga")
        }).toThrow(ValidationError)
        expect(schema.check("beluga")).toBeUndefined()
        expect(schema.check("")).toBeUndefined()
    })
})

describe("max_length & min_length", () => {
    test("[5, 10]", () => {
        const schema = string({
            min_length: 5,
            max_length: 10,
        })
        expect(() => {
            schema.check("belugabelugabelugabeluga")
        }).toThrow(ValidationError)
        expect(() => {
            schema.check("belu")
        }).toThrow(ValidationError)
        expect(schema.check("beluga")).toBeUndefined()
    })
})

describe("regexp", () => {
    test("regexp", () => {
        const schema = string({
            regexp: new RegExp(/^[a-z]+$/),
        })
        expect(() => {
            schema.check("AAA")
        }).toThrow(ValidationError)
        expect(schema.check("beluga")).toBeUndefined()
    })
})
