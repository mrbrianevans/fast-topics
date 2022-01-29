import './wasm_exec.js'
import type {GetTopicsOptions} from "./GetTopicsOptions";

const go = new Go();
// factor this out to allow users to change how the module is instantiated
await WebAssembly.instantiateStreaming(fetch("../dist/topics.wasm"), go.importObject)
    .then((result) => {
        go.run(result.instance);
    });

interface GetTopicsReturnType {
    docs: any
    topics: any
}

/**
 * Get the topics in a set of documents (strings).
 * @param docs - an array of strings, where each string is a "document".
 * @param opts - options for the topic extraction
 */
export const getTopics = (docs: string[], opts?: GetTopicsOptions): GetTopicsReturnType => {
    try {
        const result = getTopicsString(docs, opts ?? {numberOfTopics: 2})
        if (typeof result === "string") return JSON.parse(result)
        else if (result instanceof Error) throw result
        else throw new Error("Unrecognised value returned: " + typeof result + '. Value=' + String(result))
    } catch (e) {
        console.error('Error occurred while calling WASM function "getTopicsString":', e.message)
    }
}


//example - 2 topics: politicians and dog breeds
console.time('Process example')
const example = getTopics([
    'Alexander Boris de Pfeffel Johnson (/ˈfɛfəl/;[5] born 19 June 1964) is a British politician and writer serving as Prime Minister of the United Kingdom and Leader of the Conservative Party since 2019',
    'David William Donald Cameron (born 9 October 1966) is a British politician, businessman, lobbyist, and author who served as Prime Minister of the United Kingdom from 2010 to 2016. He was Member of Parliament (MP) for Witney from 2001 to 2016 and leader of the Conservative Party from 2005 to 2016',
    'Theresa Mary, Lady May[1] (/təˈriːzə/;[2] née Brasier; born 1 October 1956) is a British politician who served as Prime Minister of the United Kingdom and Leader of the Conservative Party from 2016 to 2019. She served as Home Secretary from 2010 to 2016 in the Cameron government and has been the Member of Parliament (MP) for Maidenhead in Berkshire since 1997',
    'James Gordon Brown HonFRSE (born 20 February 1951) is a British politician who served as Prime Minister of the United Kingdom and Leader of the Labour Party from 2007 to 2010',
    'The Poodle, called the Pudel in German and the Caniche in French, is a breed of water dog',
    'The pug is a breed of dog originally from China, with physically distinctive features of a wrinkly, short-muzzled face and curled tail',
    'The Labrador Retriever or Labrador is a British breed of retriever gun dog',
    'Pit bull is a term used in the United States for a type of dog descended from bulldogs and terriers, while in other countries such as the United Kingdom the term is used as an abbreviation of the American Pit Bull Terrier breed',
    'The Yorkshire Terrier (often shortened as Yorkie) is one of the smallest dog breeds of the terrier type, and of any dog breed'
], {numberOfTopics: 2})
console.timeEnd('Process example')

console.log('Example output for politicians and dog breed corpora')
console.log(example)
const pre = document.createElement('pre')
pre.innerText = JSON.stringify(example, null, 2)
document.querySelector('body').appendChild(pre)