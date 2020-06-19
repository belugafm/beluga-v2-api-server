import { Schema } from "../schema"
import { check_min_value } from "../validator/string/min_length"
import { check_max_value } from "../validator/string/max_length"
import { check_regex_pattern } from "../validator/string/regex"
import { Options } from "./string"

export function user_name() {
    const options: Options = {
        min_length: 1,
        max_length: 32,
        regexp: new RegExp(/^[a-zA-Z0-9_]+$/),
    }
    return new Schema<string>(options, [
        check_min_value,
        check_max_value,
        check_regex_pattern,
    ])
}
