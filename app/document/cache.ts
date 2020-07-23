import config from "../config/app"
import { Channel } from "../schema/channel"
import { FraudScore } from "../schema/fraud_score"
import { Status } from "../schema/status"
import { User } from "../schema/user"
import { UserLoginCredential } from "../schema/user_login_credential"
import { UserLoginSession } from "../schema/user_login_session"
import { UserRegistration } from "../schema/user_registration"
import { InMemoryCache } from "../lib/cache"
import mongoose from "mongoose"
import { ChangeEvent } from "mongodb"

class DocumentCache extends InMemoryCache {
    handleChangeEvent(namespace: string, event: ChangeEvent<any>) {
        if (
            event.operationType == "delete" ||
            event.operationType == "update"
        ) {
            const { _id } = event.documentKey
            if (_id) {
                this.delete(
                    namespace,
                    (_id as mongoose.Types.ObjectId).toHexString()
                )
            }
        }
    }
    on() {
        this.change_streams.push(
            Channel.watch().on("change", (event) => {
                this.handleChangeEvent(Channel.modelName, event)
            })
        )
        this.change_streams.push(
            FraudScore.watch().on("change", (event) => {
                this.handleChangeEvent(FraudScore.modelName, event)
            })
        )
        this.change_streams.push(
            Status.watch().on("change", (event) => {
                this.handleChangeEvent(Status.modelName, event)
            })
        )
        this.change_streams.push(
            User.watch().on("change", (event) => {
                this.handleChangeEvent(User.modelName, event)
            })
        )
        this.change_streams.push(
            UserLoginSession.watch().on("change", (event) => {
                this.handleChangeEvent(UserLoginSession.modelName, event)
            })
        )
        this.change_streams.push(
            UserLoginCredential.watch().on("change", (event) => {
                this.handleChangeEvent(UserLoginCredential.modelName, event)
            })
        )
        this.change_streams.push(
            UserRegistration.watch().on("change", (event) => {
                this.handleChangeEvent(UserRegistration.modelName, event)
            })
        )
    }
}

export const document_cache = new DocumentCache(
    config.in_memory_cache.cache_limit,
    config.in_memory_cache.default_expire_seconds
)
