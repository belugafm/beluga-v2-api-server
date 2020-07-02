import { Schema } from "../schema"
import { Options } from "./string"
import mongoose from "mongoose"

export function optional_object_id() {
    const options: Options = {}
    return new Schema<mongoose.Types.ObjectId | undefined>(options, [
        (object_id: any) => {
            if (object_id == null) {
                return true
            } else {
                object_id instanceof mongoose.Types.ObjectId
            }
        },
    ])
}
