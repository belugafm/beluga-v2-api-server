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
import { channel as get_channel_statuses } from "../../../../model/timeline/channel"
import { ModelRuntimeError } from "../../../../model/error"
import { get as get_channel } from "../../../../model/channel/get"

export const argument_specs = define_arguments(["channel_id"] as const, {
    channel_id: {
        description: ["チャンネルID"],
        examples: [ExampleObjectId],
        required: true,
        schema: vs.object_id(),
    },
})

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_channel_id",
        "channel_not_found",
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_channel_id: {
            description: ["チャンネルIDが不正です"],
            code: "invalid_arg_channel_id",
        },
        channel_not_found: {
            description: ["チャンネルが見つかりません"],
            code: "channel_not_found",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.ChannelTimeline,
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
    description: ["チャンネルの投稿を取得します"],
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
            const channel = await get_channel({
                channel_id: args.channel_id,
            })
            if (channel == null) {
                throw new WebApiRuntimeError(errors.channel_not_found)
            }
            return await get_channel_statuses({
                channel_id: args.channel_id,
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
