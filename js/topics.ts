import {setupEnvironment} from './wasm_exec.js'
import type {GetTopicsOptions} from "./GetTopicsOptions";

setupEnvironment() //  needs to set up before anything else will work
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
export async function initialiseWasm(input?: string | ArrayBuffer) {
    if (isGetTopicsReady())
        console.warn('WASM has already been initialised')
    if (typeof input === 'string') setInitFunction(initWithFetch(input))
    else if (input instanceof ArrayBuffer) setInitFunction(initWithBinary(input))
    else if (input) console.warn("Invalid input to 'initialiseWasm'. Must be either URL: string, or binary: ArrayBuffer")
    await initWasm()
    console.assert(isGetTopicsReady(), 'fast-topics WebAssembly module failed to instantiate')
}

/**
 * Return type of getTopics. Contains keys `{ docs, topics }` which are each arrays.
 * `docs` is an array of the documents (with the same indexes as the input documents).
 * `topics` is an array of the generated topics, and their indexes match the topic references in documents.
 */
export interface GetTopicsReturnType {
    // there is an issue which causes these to be { '1': [...], '2': [...] }, rather than [ [...], [...] ]
    docs: Record<string, { topic: number, rank: number }>[]
    topics: Record<string, { word: number, rank: number }>[]
}

const defaultGetTopicsOptions: GetTopicsOptions = {
    numberOfTopics: 5, topicsMinWordRank: 0, docsMinTopicRank: 0
}
/**
 * Get the topics in a set of documents (strings).
 * @param docs - an array of strings, where each string is a "document".
 * @param opts - options for the topic extraction
 */
export const getTopics = (docs: string[], opts?: Partial<GetTopicsOptions>): GetTopicsReturnType => {
    if (!isGetTopicsReady()) {
        throw new Error("WASM has not been initialised. Call `await intialiseWasm()`")
    }
    try {
        const options: GetTopicsOptions = {...defaultGetTopicsOptions, ...opts}
        const result = getTopicsString(docs, options)
        if (typeof result === "string") return JSON.parse(result)
        else if (result instanceof Error) throw result
        else throw new Error("Unrecognised value returned: " + typeof result + '. Value=' + String(result))
    } catch (e) {
        console.error('Error occurred while calling WASM function "getTopicsString":', e.message)
    }
}

/**
 * Returns true if getTopics() is ready to be called. This depends on the WebAssembly module being instantiated first.
 */
export const isGetTopicsReady = (): boolean => typeof getTopicsString !== 'undefined'


export type {GetTopicsOptions}