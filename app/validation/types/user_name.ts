import { Schema } from "../schema"
import { check_is_string } from "../validator/string/is_string"
import { check_min_length } from "../validator/string/min_length"
import { check_max_length } from "../validator/string/max_length"
import { check_regex_pattern } from "../validator/string/regex"
import { Options } from "./string"
import config from "../../config/app"

export function user_name() {
    const options: Options = {
        min_length: config.user.name.min_length,
        max_length: config.user.name.max_length,
        regexp: config.user.name.regexp,
    }
    return new Schema<string>(options, [
        check_is_string,
        check_min_length,
        check_max_length,
        check_regex_pattern,
    ])
}
