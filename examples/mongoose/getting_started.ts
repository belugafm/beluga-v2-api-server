import mongoose, { Schema, Document } from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { exit } from "process"

interface IUser extends Document {
    name: string
}
const User = mongoose.model<IUser>(
    "User",
    new Schema({
        name: String,
    })
)

const mongod = new MongoMemoryServer()
mongod.getUri().then(async (uri) => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    mongoose.connection.on("error", (e) => {
        console.error(e)
    })
    mongoose.connection.once("open", () => {
        const user = new User({ name: "beluga" })
        console.log("user_name: ", user.name)
    })
})
