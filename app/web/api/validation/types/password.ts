import { Schema } from "../schema"
import { check_min_value } from "../validator/string/min_length"
import { check_max_value } from "../validator/string/max_length"
import { check_regex_pattern } from "../validator/string/regex"
import { Options } from "./string"

export function password() {
    const options: Options = {
        min_length: 5,
        max_length: 256,
    }
    return new Schema<string>(options, [
        check_min_value,
        check_max_value,
        check_regex_pattern,
    ])
}
