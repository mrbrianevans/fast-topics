import './wasm_exec.js'
import type {GetTopicsOptions} from "./GetTopicsOptions";

/**
 * set WASM initialisation function to fetching a URL of the .wasm file
 */
export const initWithFetch = (url: string = "node_modules/fast-topics/dist/topics.wasm") => async () => {
    const go = new Go();
    await WebAssembly.instantiateStreaming(fetch(url), go.importObject)
        .then((result) => {
            go.run(result.instance).then(() => console.log('WASM functions no longer available'))
        })
    console.log('Init WASM using fetch')
}
/**
 * set WASM initialisation function to ArrayBuffer binary (slower than fetching URL)
 */
export const initWithBinary = (binary: ArrayBuffer) => async () => {
    const go = new Go();
    await WebAssembly.instantiate(binary, go.importObject)
        .then((result) => {
            go.run(result.instance).then(() => console.log('WASM functions no longer available'))
        })
    console.log('Init WASM using binary ArrayBuffer')
}
let initWasm = initWithFetch()
/**
 * set the initialisation function. Defaults to fetch URL.
 */
export const setInitFunction = (initFunc) => {
    initWasm = initFunc
}

/**
 * initialise WASM by fetching a URL of the .wasm file
 */
export async function initialiseWasm(url: string)
/**
 * initialise WASM with an ArrayBuffer binary (slower than fetching URL)
 */
export async function initialiseWasm(binary: ArrayBuffer)
/**
 * call this before calling the getTopics function
 */
export async function initialiseWasm(input: string | ArrayBuffer) {
    if ('getTopicsString' ! in window)
        console.warn('WASM has already been initialised')
    if (typeof input === 'string') setInitFunction(initWithFetch(input))
    else if (input instanceof ArrayBuffer) setInitFunction(initWithBinary(input))
    else console.warn("Invalid input to 'initialiseWasm'. Must be either URL: string, or binary: ArrayBuffer")
    await initWasm()
}

/**
 * Return type of getTopics. Contains keys `{ docs, topics }` which are each arrays.
 * `docs` is an array of the documents (with the same indexes as the input documents).
 * `topics` is an array of the generated topics, and their indexes match the topic references in documents.
 */
interface GetTopicsReturnType {
    docs: { topic: number, rank: number }[][]
    topics: { word: number, rank: number }[][]
}

/**
 * Get the topics in a set of documents (strings).
 * @param docs - an array of strings, where each string is a "document".
 * @param opts - options for the topic extraction
 */
export const getTopics = (docs: string[], opts?: GetTopicsOptions): GetTopicsReturnType => {
    if (typeof getTopicsString === 'undefined') {
        throw new Error("WASM has not been initialised. Call `await intialiseWasm()`")
    }
    try {
        const result = getTopicsString(docs, opts ?? {numberOfTopics: 2})
        if (typeof result === "string") return JSON.parse(result)
        else if (result instanceof Error) throw result
        else throw new Error("Unrecognised value returned: " + typeof result + '. Value=' + String(result))
    } catch (e) {
        console.error('Error occurred while calling WASM function "getTopicsString":', e.message)
    }
}

