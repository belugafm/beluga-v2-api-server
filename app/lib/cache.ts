import config from "../config/app"
import mongoose, { Document } from "mongoose"
import { ChangeEvent } from "mongodb"

class CachedObject {
    expire_date: Date
    data: any
    constructor(data: any, expire_seconds: number) {
        data._cached = true
        this.data = data
        this.expire_date = new Date(Date.now() + expire_seconds)
    }
    is_expired() {
        if (this.expire_date.getTime() < Date.now()) {
            return true
        } else {
            return false
        }
    }
}
class InMemoryDocumentCache {
    cache_limit: number
    default_expire_seconds: number
    enabled: boolean
    data: { [namespace: string]: { [key: string]: CachedObject } }
    constructor(cache_limit: number, default_expire_seconds: number) {
        this.cache_limit = cache_limit
        this.default_expire_seconds = default_expire_seconds
        this.data = {}
        this.enabled = true
    }
    enable() {
        this.enabled = true
    }
    disable() {
        this.enabled = false
    }
    get(namespace: string, key: string): any {
        if (this.enabled !== true) {
            return null
        }
        if (namespace in this.data !== true) {
            return null
        }
        if (key in this.data[namespace] !== true) {
            return null
        }
        const cached_object = this.data[namespace][key]
        if (cached_object.is_expired() === true) {
            return null
        }
        return cached_object.data
    }
    set(
        namespace: string,
        key: string,
        data: any,
        expire_seconds?: number
    ): void {
        if (this.enabled !== true) {
            return
        }
        if (namespace in this.data !== true) {
            this.data[namespace] = {}
        }
        // @ts-ignore
        if (this.data[namespace].length > this.cache_limit) {
            this.data[namespace] = {}
        }
        this.data[namespace][key] = new CachedObject(
            data,
            expire_seconds ? expire_seconds : this.default_expire_seconds
        )
    }
    delete(namespace: string, key: string) {
        if (this.enabled !== true) {
            return
        }
        if (namespace in this.data !== true) {
            return
        }
        if (key in this.data[namespace] !== true) {
            return
        }
        delete this.data[namespace][key]
    }
    handleChangeEvent(namespace: string, event: ChangeEvent<any>) {
        if (
            event.operationType == "delete" ||
            event.operationType == "update"
        ) {
            const key = JSON.stringify(event.documentKey)
            this.delete(namespace, key)
        }
    }
}

export const in_memory_cache = new InMemoryDocumentCache(
    config.in_memory_cache.cache_limit,
    config.in_memory_cache.default_expire_seconds
)
