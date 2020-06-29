import { Schema } from "../schema"
import { check_min_length } from "../validator/string/min_length"
import { check_max_length } from "../validator/string/max_length"
import { check_regex_pattern } from "../validator/string/regex"
import { check_is_string } from "../validator/string/is_string"

export type Options = {
    min_length?: number
    max_length?: number
    regexp?: object
}
export function string(options?: Options) {
    return new Schema<string>(options || {}, [
        check_is_string,
        check_min_length,
        check_max_length,
        check_regex_pattern,
    ])
}
