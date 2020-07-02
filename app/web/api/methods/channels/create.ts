import { ContentTypes } from "../../facts/content_type"
import { HttpMethods } from "../../facts/http_method"
import { MethodIdentifiers } from "../../identifier"
import {
    MethodFacts,
    define_method,
    define_arguments,
    define_expected_errors,
    ExampleObjectId,
} from "../../define"
import * as vs from "../../../../validation"
import { InternalErrorSpec, UnexpectedErrorSpec, raise } from "../../error"
import { ModelRuntimeError } from "../../../../model/error"

export const argument_specs = define_arguments(
    ["name", "community_id"] as const,
    {
        name: {
            description: ["チャンネル名"],
            examples: ["雑談"],
            required: true,
            schema: vs.user_name(),
        },
        community_id: {
            description: ["属するコミュニティのID"],
            examples: [ExampleObjectId],
            required: false,
            schema: vs.object_id(),
        },
    }
)

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_name",
        "invalid_arg_user_id",
        "user_not_found",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_name: {
            description: ["ユーザー名が不正です"],
            code: "invalid_arg_name",
        },
        invalid_arg_user_id: {
            description: ["ユーザーIDが不正です"],
            code: "invalid_arg_user_id",
        },
        user_not_found: {
            description: ["ユーザーが見つかりません"],
            code: "user_not_found",
        },
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ShowUser,
    http_method: HttpMethods.POST,
    rate_limiting: {
        User: "WebTier3",
        Bot: "WebTier4",
        Admin: "InternalSystem",
    },
    accepted_content_types: [ContentTypes.ApplicationJson],
    authentication_required: false,
    accepted_authentication_methods: ["AccessToken", "OAuth", "Cookie"],
    accepted_scopes: {
        User: "user:read",
        Bot: "user:read",
        Admin: "user:read",
    },
    description: ["ユーザーの情報を表示します"],
}

export default define_method(
    facts,
    argument_specs,
    expected_error_specs,
    async (args, errors) => {
        try {
        } catch (error) {
            if (error instanceof ModelRuntimeError) {
                raise(errors.internal_error, error)
            } else {
                raise(errors.unexpected_error, error)
            }
        }
    }
)
