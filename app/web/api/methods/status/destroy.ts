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
    destroy as destroy_status,
    ErrorCodes as ModelErrorCodes,
} from "../../../../model/status/destroy"
import { get as get_status } from "../../../../model/status/get"

export const argument_specs = define_arguments(["status_id"] as const, {
    status_id: {
        description: ["削除する投稿のID"],
        examples: [ExampleObjectId],
        required: true,
        schema: vs.object_id(),
    },
})

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_status_id",
        "status_not_found",
        "invalid_auth",
        "no_permission",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_status_id: {
            description: ["投稿IDが不正です"],
            code: "invalid_arg_status_id",
            argument: "status_id",
        },
        status_not_found: {
            description: ["投稿が見つかりません"],
            hint: ["`status_id`を見直してください"],
            code: "status_not_found",
        },
        no_permission: {
            description: ["権限がありません"],
            code: "no_permission",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.DestroyStatus,
    http_method: HttpMethods.POST,
    rate_limiting: {
        User: "WebTier3",
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
    description: ["チャンネルに投稿します"],
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
            const status = await get_status({ status_id: args.status_id })
            if (status == null) {
                throw new WebApiRuntimeError(errors.status_not_found)
            }
            if (status.user_id.equals(auth_user._id) !== true) {
                throw new WebApiRuntimeError(errors.no_permission)
            }
            return await destroy_status({
                status_id: status._id,
            })
        } catch (error) {
            if (error instanceof WebApiRuntimeError) {
                throw error
            } else if (error.code === ModelErrorCodes.InvalidArgStatusId) {
                raise(errors.invalid_arg_status_id, error)
            } else if (error instanceof ModelRuntimeError) {
                raise(errors.internal_error, error)
            } else {
                raise(errors.unexpected_error, error)
            }
        }
        return null
    }
)
