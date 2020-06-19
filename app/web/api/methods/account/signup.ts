import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import {
    MethodFacts,
    define_method,
    define_arguments,
    define_expected_errors,
} from "../../define"
import * as vs from "../../validation"

export const argument_specs = define_arguments(
    ["name", "password", "confirmed_password"] as const,
    {
        name: {
            description: ["ユーザー名"],
            examples: ["beluga"],
            required: true,
            schema: vs.string({
                min_length: 1,
                max_length: 32,
            }),
        },
        password: {
            description: ["パスワード"],
            examples: null,
            required: true,
            schema: vs.string({}),
        },
        confirmed_password: {
            description: ["確認用のパスワード"],
            examples: null,
            required: true,
            schema: vs.string({}),
        },
    }
)

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_name",
        "invalid_arg_password",
        "invalid_arg_confirmed_password",
        "name_taken",
        "internal_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_name: {
            description: ["ユーザー名が基準を満たしていません"],
            argument: "name",
        },
        invalid_arg_password: {
            description: ["パスワードが基準を満たしていません"],
            argument: "password",
        },
        invalid_arg_confirmed_password: {
            description: ["確認用のパスワードが一致しません"],
            hint: ["パスワードと確認用パスワードは同じものを入力してください"],
            argument: "confirmed_password",
        },
        name_taken: {
            description: [
                "このユーザー名はすでに取得されているため、新規作成できません",
            ],
            hint: ["別のユーザー名でアカウントを作成してください"],
        },
        internal_error: {
            description: [
                "サーバー内で問題が発生したため、リクエストを完了できません",
            ],
            hint: ["サイトの管理者に問い合わせてください"],
        },
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateAccount,
    http_method: HttpMethods.POST,
    rate_limiting: {},
    accepted_content_types: [
        ContentTypes.ApplicationFormUrlEncoded,
        ContentTypes.ApplicationJson,
    ],
    authentication_required: false,
    accepted_authentication_methods: [],
    accepted_scopes: [],
    description: ["新規アカウントを作成します"],
}

export default define_method(
    facts,
    argument_specs,
    expected_error_specs,
    async (args, errors) => {
        console.log(args.name, args.confirmed_password, args.password)
        throw new Error(errors.name_taken.description[0])
    }
)
