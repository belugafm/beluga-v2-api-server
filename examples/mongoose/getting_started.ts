import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import signup from "../../app/web/api/methods/account/signup"

const mongodb = new MongoMemoryServer()
mongodb.getUri().then(async (uri) => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    mongoose.connection.on("error", (e) => {
        console.error(e)
    })
    mongoose.connection.once("open", async () => {
        await signup({
            name: "beluga",
            password: "password",
            confirmed_password: "password",
        })
        try {
            await signup({
                name: "Beluga",
                password: "password",
                confirmed_password: "password",
            })
        } catch (error) {
            console.log(error)
        }
        await mongodb.stop()
    })
})
