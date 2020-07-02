import { Schema } from "../schema"

export function boolean() {
    return new Schema<boolean>({}, [
        (value: any) => {
            return typeof value === "boolean"
        },
    ])
}
