import type {GetTopicsOptions} from "./GetTopicsOptions";


declare global {
    /**
     * WASM function exposed in global scope which returns a serialised JSON string
     */
    var getTopicsString: (docs: string[], options: GetTopicsOptions) => string | Error

}