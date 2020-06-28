import mongoose, { Schema, Document } from "mongoose"
import { IpqsResult } from "app/lib/ipqs"

const schema_version = 1

export interface FraudScoreSchema extends Document {
    ip_address: string
    result: IpqsResult
    created_at: Date
    _schema_version?: number
}

export const FraudScore = mongoose.model<FraudScoreSchema>(
    "fraud_score",
    new Schema({
        ip_address: String,
        result: Object,
        created_at: Date,
        _schema_version: {
            type: Number,
            default: schema_version,
        },
    })
)
