import { Schema } from "../schema"
import { Options } from "./string"
import mongoose from "mongoose"
import { CommonErrorMessages, ValueSchemaValidationError } from "../error"

export function object_id() {
    const options: Options = {}
    return new Schema<mongoose.Types.ObjectId>(options, [
        (object_id: any) => {
            if (object_id instanceof mongoose.Types.ObjectId !== true) {
                throw new ValueSchemaValidationError(
                    CommonErrorMessages.InvalidType
                )
            }
        },
    ])
}
