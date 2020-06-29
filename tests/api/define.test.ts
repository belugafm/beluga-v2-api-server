import {
    define_arguments,
    define_expected_errors,
    define_method,
    MethodFacts,
} from "../../app/web/api/define"
import * as vs from "../../app/validation"
import { HttpMethods } from "../../app/web/api/facts/http_method"
import { ContentTypes } from "../../app/web/api/facts/content_type"
import { WebApiRuntimeError } from "../../app/web/api/error"

describe("api", () => {
    const facts: MethodFacts = {
        url: "",
        http_method: HttpMethods.POST,
        rate_limiting: {},
        accepted_content_types: [
            ContentTypes.ApplicationFormUrlEncoded,
            ContentTypes.ApplicationJson,
        ],
        authentication_required: false,
        accepted_authentication_methods: [],
        accepted_scopes: [],
        description: [],
    }
    const argument_specs = define_arguments(
        ["optional_arg", "required_arg"] as const,
        {
            optional_arg: {
                description: [],
                examples: [],
                required: false,
                schema: vs.string({}),
            },
            required_arg: {
                description: [],
                examples: [],
                required: true,
                schema: vs.string({}),
            },
        }
    )
    const expected_error_specs = define_expected_errors(
        ["optional_arg_error", "required_arg_error"] as const,
        argument_specs,
        {
            optional_arg_error: {
                description: ["ユーザー名が基準を満たしていません"],
                argument: "optional_arg",
                code: "optional_arg_error",
            },
            required_arg_error: {
                description: ["パスワードが基準を満たしていません"],
                argument: "required_arg",
                code: "required_arg_error",
            },
        }
    )

    test("define", async () => {
        const method = define_method(
            facts,
            argument_specs,
            expected_error_specs,
            async (args, errors) => {}
        )

        expect.assertions(2)
        try {
            await method({})
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toMatch("required_arg_error")
            }
        }
    })

    test("define", async () => {
        const method = define_method(
            facts,
            argument_specs,
            expected_error_specs,
            async (args, errors) => {}
        )

        expect.assertions(2)
        try {
            await method({
                required_arg: 2,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toMatch("required_arg_error")
            }
        }
    })

    test("define", async () => {
        const method = define_method(
            facts,
            argument_specs,
            expected_error_specs,
            async (args, errors) => {}
        )

        expect.assertions(2)
        try {
            await method({
                optional_arg: "",
            })
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toMatch("required_arg_error")
            }
        }
    })

    test("define", async () => {
        const method = define_method(
            facts,
            argument_specs,
            expected_error_specs,
            async (args, errors) => {}
        )
        expect.assertions(0)
        await method({
            required_arg: "",
        })
    })

    test("define", async () => {
        const method = define_method(
            facts,
            argument_specs,
            expected_error_specs,
            async (args, errors) => {}
        )
        expect.assertions(2)
        try {
            await method({
                required_arg: "",
                optional_arg: 1,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(WebApiRuntimeError)
            if (error instanceof WebApiRuntimeError) {
                expect(error.code).toMatch("optional_arg_error")
            }
        }
    })
})
