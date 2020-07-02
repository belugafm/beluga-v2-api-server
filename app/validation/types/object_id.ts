import { Schema } from "../schema"
import { Options } from "./string"
import mongoose from "mongoose"

export function object_id() {
    const options: Options = {}
    return new Schema<mongoose.Types.ObjectId>(options, [
        (object_id: any) => {
            object_id instanceof mongoose.Types.ObjectId
        },
    ])
}
