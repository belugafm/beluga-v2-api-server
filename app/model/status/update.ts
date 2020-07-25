import {
    StatusSchema,
    Status,
    Entities,
    ChannelEntity,
    StatusEntity,
} from "../../schema/status"
import * as vs from "../../validation"
import { ModelRuntimeError } from "../error"
import { get as get_user } from "../user/get"
import { get as get_channel } from "../channel/get"
import config from "../../config/app"
import mongoose from "mongoose"
import * as mongo from "../../lib/mongoose"
import { Channel } from "../../schema/channel"

export const ErrorCodes = {
    InvalidArgText: "invalid_arg_text",
    InvalidArgUserId: "invalid_arg_user_id",
    InvalidArgChannelId: "invalid_arg_channel_id",
    UserNotFound: "user_not_found",
    ChannelNotFound: "channel_not_found",
}

type Argument = {
    text: StatusSchema["text"]
    user_id: StatusSchema["user_id"]
    channel_id: StatusSchema["channel_id"]
}

const extract_channels = async (text: string): Promise<ChannelEntity[]> => {
    const entities: ChannelEntity[] = []
    if (text.indexOf("http") === -1) {
        return entities
    }
    const base_url = config.server.get_base_url()
    const url_pattern = `${base_url}/channel/([0-9a-z]{24})`
    const pattern = new RegExp(
        `^${url_pattern}(?=\\s)|(?<=\\s)${url_pattern}(?=\\s)|(?<=\\s)${url_pattern}$|^${url_pattern}$`,
        "gm"
    )
    let m
    while ((m = pattern.exec(text))) {
        const url = m[0]
        const match = url.match(/\/channel\/([0-9a-z]{24})$/)
        if (match) {
            const channel_id = match[1]
            const start_index = m.index
            const end_index = start_index + url.length - 1
            const channel = await mongo.findOne(Channel, {
                _id: mongoose.Types.ObjectId(channel_id),
            })
            if (channel) {
                entities.push({
                    channel_id: channel._id,
                    indices: [start_index, end_index],
                })
            }
        }
    }
    return entities
}

const extract_statuses = async (text: string): Promise<StatusEntity[]> => {
    const entities: StatusEntity[] = []
    if (text.indexOf("http") === -1) {
        return entities
    }
    const base_url = config.server.get_base_url()
    const url_pattern = `${base_url}/(status|thread)/([0-9a-z]{24})`
    const pattern = new RegExp(
        `^${url_pattern}(?=\\s)|(?<=\\s)${url_pattern}(?=\\s)|(?<=\\s)${url_pattern}$|^${url_pattern}$`,
        "gm"
    )
    let m
    while ((m = pattern.exec(text))) {
        const url = m[0]
        const match = url.match(/\/(status|thread)\/([0-9a-z]{24})$/)
        if (match) {
            const status_id = match[2]
            const start_index = m.index
            const end_index = start_index + url.length - 1
            const status = await mongo.findOne(Status, {
                _id: mongoose.Types.ObjectId(status_id),
            })
            if (status) {
                entities.push({
                    status_id: status._id,
                    indices: [start_index, end_index],
                })
            }
        }
    }
    return entities
}

export const update = async ({
    text,
    user_id,
    channel_id,
}: Argument): Promise<StatusSchema> => {
    if (vs.status.text().ok(text) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgText)
    }
    if (vs.object_id().ok(user_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgUserId)
    }
    if (vs.object_id().ok(channel_id) !== true) {
        throw new ModelRuntimeError(ErrorCodes.InvalidArgChannelId)
    }
    const user = await get_user({ user_id })
    if (user == null) {
        throw new ModelRuntimeError(ErrorCodes.UserNotFound)
    }
    const channel = await get_channel({ channel_id })
    if (channel == null) {
        throw new ModelRuntimeError(ErrorCodes.ChannelNotFound)
    }

    const entities: Entities = {
        channels: await extract_channels(text),
        statuses: await extract_statuses(text),
    }

    return await Status.create({
        text: text,
        user_id: user_id,
        channel_id: channel_id,
        community_id: channel.community_id,
        public: channel.public,
        edited: false,
        created_at: new Date(),
        like_count: 0,
        favorite_count: 0,
        entities: entities,
    })
}
