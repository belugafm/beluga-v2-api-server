import { ClientSession } from "mongoose"

export type GetOptions = {
    transaction_session?: ClientSession | null
    disable_cache?: boolean
}
export const DefaultOptions: GetOptions = {
    transaction_session: null,
    disable_cache: false,
}
