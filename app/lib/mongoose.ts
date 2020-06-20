import mongoose, { Document, FilterQuery } from "mongoose"

export async function findOne<T extends Document>(
    cls: mongoose.Model<T, {}>,
    condition: FilterQuery<T>,
    case_sensitive: boolean = true
): Promise<T | null> {
    return new Promise((resolve, reject) => {
        if (case_sensitive) {
            cls.findOne(condition, (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        } else {
            cls.findOne(condition, (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            }).collation({
                locale: "en_US",
                strength: 2,
            })
        }
    })
}
