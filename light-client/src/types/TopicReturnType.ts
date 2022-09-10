export const ReturnType = {
    DATA:{
        AVAILABLE_EFFEKTS: "return.data.availableEffekts",
        ACTIVE_EFFEKTS: "return.data.activeEffekts"
    },
    SYSTEM:{
        CONFIG: "return.system.config",
    },
    WSAPI:{
        GET_KEY_VALUE: "return.wsapi.getKeyValue",
    },
    PREVIEW:{
        FRAME_DICT : "return.preview.frameDict",
    }
}

export type WSApiKey = {
    key: string,
    value?: string
}