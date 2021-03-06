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
} from "../../../../model/status/likes/create"
import config from "../../../../config/app"

export const argument_specs = define_arguments(["status_id"] as const, {
    status_id: {
        description: ["投稿ID"],
        examples: [ExampleObjectId],
        required: true,
        schema: vs.object_id(),
    },
})

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_status_id",
        "status_not_found",
        "limit_reached",
        "cannot_create_like",
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_status_id: {
            description: ["`status_id`が不正です"],
            code: "invalid_arg_status_id",
            argument: "status_id",
        },
        status_not_found: {
            description: ["投稿が見つかりません"],
            code: "status_not_found",
        },
        cannot_create_like: {
            description: ["この投稿にいいねすることはできません"],
            hint: [
                "自分の投稿にいいねすることはできません",
                "相手からブロックされている場合もいいねできません",
            ],
            code: "cannot_create_like",
        },
        limit_reached: {
            description: ["これ以上いいねすることはできません"],
            hint: [
                `一つの投稿につき、いいねは${config.status.like.max_count}回までできます`,
            ],
            code: "limit_reached",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateLike,
    http_method: HttpMethods.POST,
    rate_limiting: {
        User: "WebTier4",
        Bot: "WebTier4",
        Admin: "InternalSystem",
    },
    accepted_content_types: [ContentTypes.ApplicationJson],
    authentication_required: true,
    accepted_authentication_methods: ["AccessToken", "OAuth", "Cookie"],
    accepted_scopes: {
        User: "status:write",
        Bot: "status:write",
        Admin: "status:write",
    },
    description: ["投稿にいいねします"],
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
                user_id: auth_user._id,
                status_id: args.status_id,
            })
        } catch (error) {
            if (error instanceof WebApiRuntimeError) {
                throw error
            } else if (error instanceof ModelRuntimeError) {
                if (error.code === ModelErrorCodes.StatusNotFound) {
                    raise(errors.status_not_found, error)
                } else if (error.code === ModelErrorCodes.InvalidArgStatusId) {
                    raise(errors.invalid_arg_status_id, error)
                } else if (error.code === ModelErrorCodes.CannotCreateLike) {
                    raise(errors.cannot_create_like, error)
                } else if (error.code === ModelErrorCodes.LimitReached) {
                    raise(errors.limit_reached, error)
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
