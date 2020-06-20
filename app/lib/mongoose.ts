import mongoose, { Document, FilterQuery } from "mongoose"

export async function findOne<T extends Document>(
    cls: mongoose.Model<T, {}>,
    condition: FilterQuery<T>
): Promise<T | null> {
    return new Promise((resolve, reject) => {
        cls.findOne(condition, (error, result) => {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}
