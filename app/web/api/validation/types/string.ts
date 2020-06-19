import { Schema } from "../schema"

export type Option = {
    min_length?: number
    max_length?: number
    regex_pattern?: object
}
export function string(option: Option) {
    return new Schema<string>()
}
