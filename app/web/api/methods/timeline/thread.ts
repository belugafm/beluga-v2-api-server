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
import { thread as get_thread_statuses } from "../../../../model/timeline/thread"
import { ModelRuntimeError } from "../../../../model/error"
import { get as get_status } from "../../../../model/status/get"

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
        "thread_not_found",
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_status_id: {
            description: ["`status_id`が不正です"],
            code: "invalid_arg_status_id",
        },
        thread_not_found: {
            description: ["スレッドが見つかりません"],
            code: "thread_not_found",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ThreadTimeline,
    http_method: HttpMethods.GET,
    rate_limiting: {
        User: "WebTier3",
        Bot: "WebTier4",
        Admin: "InternalSystem",
    },
    accepted_content_types: [ContentTypes.ApplicationJson],
    authentication_required: true,
    accepted_authentication_methods: ["AccessToken", "OAuth", "Cookie"],
    accepted_scopes: {
        User: "timeline:read",
        Bot: "timeline:read",
        Admin: "timeline:read",
    },
    description: ["スレッドの投稿を取得します"],
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
            const status = await get_status({
                status_id: args.status_id,
            })
            if (status == null) {
                throw new WebApiRuntimeError(errors.thread_not_found)
            }
            return await get_thread_statuses({
                thread_status_id: args.status_id,
            })
        } catch (error) {
            if (error instanceof WebApiRuntimeError) {
                throw error
            } else if (error instanceof ModelRuntimeError) {
                raise(errors.internal_error, error)
            } else {
                raise(errors.unexpected_error, error)
            }
        }
        return []
    }
)
