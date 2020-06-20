import mongoose, { Schema, Document } from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import signup from "../../app/web/api/methods/account/signup"

const mongod = new MongoMemoryServer()
mongod.getUri().then(async (uri) => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    mongoose.connection.on("error", (e) => {
        console.error(e)
    })
    mongoose.connection.once("open", async () => {
        try {
            await signup({
                name: "beluga",
                password: "password",
                confirmed_password: "password",
            })
        } catch (error) {
            console.log(error)
        }
        try {
            await signup({
                name: "beluga",
                password: "password",
                confirmed_password: "password",
            })
        } catch (error) {
            console.log(error)
        }
        await mongod.stop()
    })
})
