import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import { User } from "../app/schema/user"
import { UserLoginCredential } from "../app/schema/user_login_credential"
import { UserRegistration } from "../app/schema/user_registration"
import { FraudScore } from "../app/schema/fraud_score"
import { Channel } from "../app/schema/channel"
import { Status } from "../app/schema/status"
import { document_cache } from "../app/document/cache"
import { status_object_cache } from "../app/object/types/status"
import { user_object_cache } from "../app/object/types/user"
import config from "../app/config/app"
import { StatusLikes } from "../app/schema/status_likes"
import { UserMutes } from "../app/schema/user_mutes"
import { UserBlocks } from "../app/schema/user_blocks"
import { StatusFavorites } from "../app/schema/status_favorites"

export async function create_user(name?: string) {
    if (name == null) {
        name = Math.random().toString(32).substring(2)
    }
    return await User.create({
        name: name,
        display_name: null,
        profile: {
            avatar_image_url: "",
            description: null,
            location: null,
            theme_color: null,
            background_image_url: null,
        },
        stats: {
            statuses_count: 0,
        },
        created_at: new Date(),
        active: false,
        dormant: false,
        last_activity_date: null,
        _terms_of_service_agreement_date: new Date(),
        _terms_of_service_agreement_version: config.terms_of_service.version,
    })
}

export async function create_channel(
    name: string,
    creator_id: mongoose.Types.ObjectId,
    community_id?: mongoose.Types.ObjectId
) {
    return await Channel.create({
        name: name,
        description: null,
        stats: {
            statuses_count: 0,
        },
        created_at: new Date(),
        creator_id: creator_id,
        community_id: community_id ? community_id : null,
        public: true,
    })
}

export async function sleep(sec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, sec * 1000)
    })
}

class MongoTestEnvironment {
    replSet?: MongoMemoryReplSet
    async connect() {
        const replSet = new MongoMemoryReplSet({
            replSet: { storageEngine: "wiredTiger" },
        })
        this.replSet = replSet
        return new Promise(async (resolve, reject) => {
            replSet.waitUntilRunning().then(() => {
                replSet.getUri().then(async (uri) => {
                    mongoose.connect(uri, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        useCreateIndex: true,
                        poolSize: 100,
                    })
                    mongoose.connection.once("open", async () => {
                        // トランザクション中はcollectionの作成ができないので
                        // 最初に作っておく
                        try {
                            await User.createCollection()
                        } catch (error) {}
                        try {
                            await UserLoginCredential.createCollection()
                        } catch (error) {}
                        try {
                            await UserRegistration.createCollection()
                        } catch (error) {}
                        try {
                            await FraudScore.createCollection()
                        } catch (error) {}
                        try {
                            await Channel.createCollection()
                        } catch (error) {}
                        try {
                            await Status.createCollection()
                        } catch (error) {}
                        try {
                            await StatusFavorites.createCollection()
                        } catch (error) {}
                        try {
                            await StatusLikes.createCollection()
                        } catch (error) {}
                        try {
                            await UserMutes.createCollection()
                        } catch (error) {}
                        try {
                            await UserBlocks.createCollection()
                        } catch (error) {}

                        // 数秒待機する
                        sleep(3)

                        // change streamの登録
                        document_cache.on()
                        status_object_cache.on()
                        user_object_cache.on()

                        resolve()
                    })
                })
            })
        })
    }
    async disconnect() {
        await document_cache.off()
        await status_object_cache.off()
        await user_object_cache.off()
        await mongoose.disconnect()
        if (this.replSet) {
            await this.replSet.stop()
        }
    }
}

export const env = new MongoTestEnvironment()
