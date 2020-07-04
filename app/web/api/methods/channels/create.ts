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
} from "../../error"
import { ModelRuntimeError } from "../../../../model/error"
import {
    create as create_channel,
    ErrorCodes as ModelErrorCodes,
} from "../../../../model/channel/create"

export const argument_specs = define_arguments(
    ["name", "description", "is_public", "community_id"] as const,
    {
        name: {
            description: ["チャンネル名"],
            examples: ["雑談"],
            required: true,
            schema: vs.string(),
        },
        description: {
            description: ["チャンネルの説明文"],
            examples: null,
            required: false,
            schema: vs.string(),
        },
        is_public: {
            description: [
                "グローバルタイムラインやコミュニティタイムラインに投稿が表示されるかどうか",
            ],
            examples: null,
            required: true,
            schema: vs.boolean(),
        },
        community_id: {
            description: [
                "属するコミュニティのID",
                "指定しない場合はコミュニティに属さないチャンネルになる",
            ],
            examples: [ExampleObjectId, "null"],
            required: false,
            schema: vs.nullable_object_id(),
        },
    }
)

export const expected_error_specs = define_expected_errors(
    [
        "invalid_arg_name",
        "invalid_arg_description",
        "invalid_arg_is_public",
        "invalid_arg_community_id",
        "community_not_found",
        "invalid_auth",
        "internal_error",
        "unexpected_error",
    ] as const,
    argument_specs,
    {
        invalid_arg_name: {
            description: ["チャンネル名が不正です"],
            code: "invalid_arg_name",
            argument: "name",
        },
        invalid_arg_description: {
            description: ["チャンネルの説明文が不正です"],
            code: "invalid_arg_description",
            argument: "description",
        },
        invalid_arg_is_public: {
            description: ["`is_public`の値が不正です"],
            code: "invalid_arg_is_public",
            argument: "is_public",
        },
        invalid_arg_community_id: {
            description: ["コミュニティIDが不正です"],
            code: "invalid_arg_community_id",
            argument: "community_id",
        },
        community_not_found: {
            description: ["コミュニティが見つかりません"],
            hint: ["`community_id`を見直してください"],
            code: "community_not_found",
        },
        invalid_auth: new InvalidAuth(),
        internal_error: new InternalErrorSpec(),
        unexpected_error: new UnexpectedErrorSpec(),
    }
)

export const facts: MethodFacts = {
    url: MethodIdentifiers.CreateChannel,
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
        User: "channel:write",
        Bot: "channel:write",
        Admin: "channel:write",
    },
    description: ["チャンネルを新規作成します"],
}

export default define_method(
    facts,
    argument_specs,
    expected_error_specs,
    async (args, errors, auth_user) => {
        if (auth_user == null) {
            return raise(errors.invalid_auth)
        }
        // TODO: コミュニティに参加しているかどうかのチェック
        if (args.community_id) {
        }
        try {
            return await create_channel({
                name: args.name,
                description: args.description,
                creator_id: auth_user._id,
                is_public: args.is_public,
                community_id: args.community_id,
            })
        } catch (error) {
            if (error.code === ModelErrorCodes.InvalidArgName) {
                raise(errors.invalid_arg_name, error)
            } else if (error.code === ModelErrorCodes.InvalidArgDescription) {
                raise(errors.invalid_arg_description, error)
            } else if (error.code === ModelErrorCodes.InvalidArgCommunityId) {
                raise(errors.invalid_arg_community_id, error)
            } else if (error instanceof ModelRuntimeError) {
                raise(errors.internal_error, error)
            } else {
                raise(errors.unexpected_error, error)
            }
        }
        return null
    }
)
