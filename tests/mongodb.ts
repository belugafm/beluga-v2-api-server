import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import { User } from "../app/schema/user"
import { UserLoginCredential } from "../app/schema/user_login_credentials"
import { UserRegistration } from "../app/schema/user_registration"
import { FraudScore } from "../app/schema/fraud_score"
import { Channel } from "../app/schema/channel"
import { Status } from "../app/schema/status"
import { in_memory_cache } from "../app/lib/cache"
import config from "../app/config/app"

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
        is_active: false,
        is_dormant: false,
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
        is_public: true,
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

                        // 数秒待機する
                        sleep(3)

                        // change streamの登録
                        in_memory_cache.on()

                        resolve()
                    })
                })
            })
        })
    }
    async disconnect() {
        await in_memory_cache.off()
        await mongoose.disconnect()
        if (this.replSet) {
            await this.replSet.stop()
        }
    }
}

export const env = new MongoTestEnvironment()
