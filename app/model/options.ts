import { ClientSession } from "mongoose"

export type GetOptions = {
    transaction_session?: ClientSession | null
    disable_in_memory_cache?: boolean
}
export const DefaultOptions: GetOptions = {
    transaction_session: null,
    disable_in_memory_cache: false,
}
