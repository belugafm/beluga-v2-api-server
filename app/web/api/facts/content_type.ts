export const ContentTypes = {
    MultipartFormData: "multipart/form-data",
    ApplicationFormUrlEncoded: "application/x-www-form-urlencoded",
    ApplicationJson: "application/json",
} as const

export type ContentTypesLiteralUnion = typeof ContentTypes[keyof typeof ContentTypes]
