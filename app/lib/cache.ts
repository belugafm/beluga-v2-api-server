import { ChangeStream } from "mongodb"

export class CachedObject {
    expire_date: Date
    value: any
    constructor(value: any, expire_seconds: number) {
        this.value = value
        this.expire_date = new Date(Date.now() + expire_seconds * 1000)
    }
    is_expired() {
        if (this.expire_date.getTime() < Date.now()) {
            return true
        } else {
            return false
        }
    }
}

export class InMemoryCache {
    cache_limit: number
    default_expire_seconds: number
    enabled: boolean
    data: { [namespace: string]: { [key: string]: CachedObject } }
    change_streams: ChangeStream<any>[] = []
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
    get(namespace: string, key: string): [any, boolean] {
        if (this.enabled !== true) {
            return [null, false]
        }
        if (namespace in this.data !== true) {
            return [null, false]
        }
        if (key in this.data[namespace] !== true) {
            return [null, false]
        }
        const cached_object = this.data[namespace][key]
        if (cached_object.is_expired() === true) {
            delete this.data[namespace][key]
            return [null, false]
        }
        return [cached_object.value, true]
    }
    set(
        namespace: string,
        key: string,
        value: any,
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
            value,
            expire_seconds ? expire_seconds : this.default_expire_seconds
        )
    }
    delete(namespace: string, key?: string) {
        if (this.enabled !== true) {
            return
        }
        if (namespace in this.data !== true) {
            return
        }
        if (key == null) {
            delete this.data[namespace]
            return
        }
        if (key in this.data[namespace] !== true) {
            return
        }
        delete this.data[namespace][key]
    }
    on() {}
    async off() {
        await Promise.all(this.change_streams.map((stream) => stream.close()))
    }
}
