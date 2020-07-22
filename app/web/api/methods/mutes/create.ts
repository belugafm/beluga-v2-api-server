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
import {
    InternalErrorSpec,
    UnexpectedErrorSpec,
    raise,
    InvalidAuth,
    WebApiRuntimeError,
} from "../../error"
import { ModelRuntimeError } from "../../../../model/error"
import {
    create,
    ErrorCodes as ModelErrorCodes,
} from "../../../../model/user/mutes/create"

export const argument_specs = define_arguments(["user_id"] as const, {
    user_id: {
        description: ["ミュートするユーザーのID"],
        examples: [ExampleObjectId],
        required: true,
        schema: vs.object_id(),
    },
})

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_user_id",
        "user_not_found",
        "already_muted",
        "invalid_auth",
        "cannot_mute_self",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_user_id: {
            description: ["`user_id`が不正です"],
            code: "invalid_arg_user_id",
            argument: "user_id",
        },
        user_not_found: {
            description: ["ユーザーが見つかりません"],
            code: "user_not_found",
        },
        cannot_mute_self: {
            description: ["自分をミュートすることはできません"],
            code: "cannot_mute_self",
        },
        already_muted: {
            description: ["すでにミュートしています"],
            code: "already_muted",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateMute,
    http_method: HttpMethods.POST,
    rate_limiting: {
        User: "WebTier2",
        Bot: "WebTier2",
        Admin: "InternalSystem",
    },
    accepted_content_types: [ContentTypes.ApplicationJson],
    authentication_required: true,
    accepted_authentication_methods: ["AccessToken", "OAuth", "Cookie"],
    accepted_scopes: {
        User: "user:write",
        Bot: "user:write",
        Admin: "user:write",
    },
    description: ["ユーザーをミュートします"],
}

export default define_method(
    facts,
    argument_specs,
    expected_error_specs,
    async (args, errors, auth_user) => {
        try {
            if (auth_user == null) {
                throw new WebApiRuntimeError(errors.invalid_auth)
            }
            await create({
                target_user_id: args.user_id,
                auth_user_id: auth_user._id,
            })
        } catch (error) {
            if (error instanceof WebApiRuntimeError) {
                throw error
            } else if (error instanceof ModelRuntimeError) {
                if (error.code === ModelErrorCodes.TargetUserNotFound) {
                    raise(errors.user_not_found, error)
                } else if (error.code === ModelErrorCodes.CannotMuteSelf) {
                    raise(errors.cannot_mute_self, error)
                } else if (error.code === ModelErrorCodes.AlreadyMuted) {
                    raise(errors.already_muted, error)
                } else {
                    raise(errors.internal_error, error)
                }
            } else {
                raise(errors.unexpected_error, error)
            }
        }
        return null
    }
)
