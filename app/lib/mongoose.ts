import mongoose, {
    Document,
    FilterQuery,
    DocumentQuery,
    ClientSession,
    CreateQuery,
} from "mongoose"
import { in_memory_cache } from "./cache"

type FindOneOptions<T extends Document> = {
    additional_query_func?: (query: DocumentQuery<T | null, T>) => void
    disable_in_memory_cache?: boolean
    transaction_session?: ClientSession | null
}

export async function findOne<T extends Document>(
    cls: mongoose.Model<T, {}>,
    condition: FilterQuery<T>,
    options?: FindOneOptions<T>
): Promise<T | null> {
    options = options || {
        additional_query_func: (x) => x,
        disable_in_memory_cache: false,
        transaction_session: null,
    }
    const { additional_query_func, transaction_session } = options
    const { _id } = condition
    const cache_enabled =
        options.disable_in_memory_cache !== true &&
        _id instanceof mongoose.Types.ObjectId &&
        Object.keys(condition).length == 1 &&
        transaction_session == null
    if (cache_enabled) {
        const cached_document = in_memory_cache.get(
            cls.modelName,
            (_id as mongoose.Types.ObjectId).toHexString()
        )
        if (cached_document) {
            return cached_document
        }
    }
    const $ = additional_query_func ? additional_query_func : (x: any) => x
    return new Promise((resolve, reject) => {
        $(
            cls
                .findOne(condition, (error, doc) => {
                    if (error) {
                        return reject(error)
                    }
                    if (doc && cache_enabled) {
                        in_memory_cache.set(
                            cls.modelName,
                            (_id as mongoose.Types.ObjectId).toHexString(),
                            doc
                        )
                    }
                    return resolve(doc)
                })
                .session(transaction_session ? transaction_session : null)
        )
    })
}

export async function find<T extends Document>(
    cls: mongoose.Model<T, {}>,
    condition: FilterQuery<T>,
    additional_query_func?: (
        query: DocumentQuery<T[], T, {}>
    ) => DocumentQuery<T[], T, {}>
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        additional_query_func = additional_query_func
            ? additional_query_func
            : (x: DocumentQuery<T[], T, {}>) => x
        additional_query_func(cls.find(condition)).exec((error, docs) => {
            if (error) {
                reject(error)
            } else {
                resolve(docs)
            }
        })
    })
}

export async function createWithSession<T extends Document>(
    cls: mongoose.Model<T, {}>,
    doc: CreateQuery<T>,
    session: ClientSession
): Promise<T> {
    return new Promise((resolve, reject) => {
        cls.create(
            [doc],
            {
                session,
            },
            (error, docs) => {
                if (error) {
                    return reject(error)
                } else {
                    resolve(docs[0])
                }
            }
        )
    })
}
