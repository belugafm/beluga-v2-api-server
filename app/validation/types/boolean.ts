import { Schema } from "../schema"
import { CommonErrorMessages, ValueSchemaValidationError } from "../error"

export function boolean() {
    return new Schema<boolean>({}, [
        (value: any) => {
            if (typeof value !== "boolean") {
                throw new ValueSchemaValidationError(
                    CommonErrorMessages.InvalidType
                )
            }
        },
    ])
}
