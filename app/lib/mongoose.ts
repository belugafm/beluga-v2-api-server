import mongoose, { Document, FilterQuery, DocumentQuery } from "mongoose"

export async function findOne<T extends Document>(
    cls: mongoose.Model<T, {}>,
    condition: FilterQuery<T>,
    additional_query_func?: (query: DocumentQuery<T | null, T>) => void
): Promise<T | null> {
    return new Promise((resolve, reject) => {
        additional_query_func = additional_query_func
            ? additional_query_func
            : (x: any) => x
        additional_query_func(
            cls.findOne(condition, (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
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
