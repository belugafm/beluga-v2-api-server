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
    update as update_status,
    ErrorCodes as ModelErrorCodes,
} from "../../../../model/status/update"

export const argument_specs = define_arguments(
    ["text", "channel_id", "thread_status_id"] as const,
    {
        text: {
            description: ["本文"],
            examples: ["Hell Word"],
            required: true,
            schema: vs.status.text(),
        },
        channel_id: {
            description: ["投稿先のチャンネルID"],
            examples: [ExampleObjectId],
            required: false,
            schema: vs.object_id(),
        },
        thread_status_id: {
            description: ["スレッドの投稿ID"],
            examples: [ExampleObjectId],
            required: false,
            schema: vs.object_id(),
        },
    }
)

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_text",
        "invalid_arg_channel_id",
        "invalid_arg_thread_status_id",
        "channel_not_found",
        "status_not_found",
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_text: {
            description: ["本文を入力してください"],
            code: "invalid_arg_text",
            argument: "text",
        },
        invalid_arg_channel_id: {
            description: ["`channel_id`が不正です"],
            code: "invalid_arg_channel_id",
            argument: "channel_id",
        },
        invalid_arg_thread_status_id: {
            description: ["`thread_status_id`が不正です"],
            code: "invalid_arg_thread_status_id",
            argument: "thread_status_id",
        },
        channel_not_found: {
            description: ["チャンネルが見つかりません"],
            hint: ["`channel_id`を見直してください"],
            code: "channel_not_found",
        },
        status_not_found: {
            description: ["投稿が見つかりません"],
            hint: ["`thread_status_id`を見直してください"],
            code: "status_not_found",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.UpdateStatus,
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
            return await update_status({
                text: args.text,
                user_id: auth_user._id,
                channel_id: args.channel_id,
                thread_status_id: args.thread_status_id,
            })
        } catch (error) {
            if (error instanceof WebApiRuntimeError) {
                throw error
            } else if (error instanceof ModelRuntimeError) {
                if (error.code === ModelErrorCodes.InvalidArgText) {
                    raise(errors.invalid_arg_text, error)
                } else if (error.code === ModelErrorCodes.InvalidArgChannelId) {
                    raise(errors.invalid_arg_channel_id, error)
                } else if (
                    error.code === ModelErrorCodes.InvalidArgThreadStatusId
                ) {
                    raise(errors.invalid_arg_thread_status_id, error)
                } else if (error.code === ModelErrorCodes.ChannelNotFound) {
                    raise(errors.channel_not_found, error)
                } else if (error.code === ModelErrorCodes.StatusNotFound) {
                    raise(errors.status_not_found, error)
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
