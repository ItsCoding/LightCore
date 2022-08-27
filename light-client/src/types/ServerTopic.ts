import { JsonValue } from "@daniel-faber/json-ts"

export type ServerTopic = {
    type: string,
    message: JsonValue
}