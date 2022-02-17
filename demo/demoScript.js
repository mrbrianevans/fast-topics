import {
    getTopics,
    initialiseWasm,
    initWithBinary,
    initWithFetch,
    setInitFunction
} from "./node_modules/fast-topics/dist/topics.js";

// example of initialising WASM with a binary
await fetch("node_modules/fast-topics/dist/topics.wasm")
    .then(r => r.arrayBuffer())
    .then(binary => setInitFunction(initWithBinary(binary)))

// example of initialising WASM with fetching a URL
setInitFunction(initWithFetch("node_modules/fast-topics/dist/topics.wasm"))

// initialise before calling any wasm functions. Can pass a URL or ArrayBuffer
await initialiseWasm("node_modules/fast-topics/dist/topics.wasm")


//example - two topics: politicians and dog breeds from wikipedia
const documents = [
    'Alexander Boris de Pfeffel Johnson (/ˈfɛfəl/;[5] born 19 June 1964) is a British politician and writer serving as Prime Minister of the United Kingdom and Leader of the Conservative Party since 2019',
    'David William Donald Cameron (born 9 October 1966) is a British politician, businessman, lobbyist, and author who served as Prime Minister of the United Kingdom from 2010 to 2016. He was Member of Parliament (MP) for Witney from 2001 to 2016 and leader of the Conservative Party from 2005 to 2016',
    'Theresa Mary, Lady May[1] (/təˈriːzə/;[2] née Brasier; born 1 October 1956) is a British politician who served as Prime Minister of the United Kingdom and Leader of the Conservative Party from 2016 to 2019. She served as Home Secretary from 2010 to 2016 in the Cameron government and has been the Member of Parliament (MP) for Maidenhead in Berkshire since 1997',
    'James Gordon Brown HonFRSE (born 20 February 1951) is a British politician who served as Prime Minister of the United Kingdom and Leader of the Labour Party from 2007 to 2010',
    'The Poodle, called the Pudel in German and the Caniche in French, is a breed of water dog',
    'The pug is a breed of dog originally from China, with physically distinctive features of a wrinkly, short-muzzled face and curled tail',
    'The Labrador Retriever or Labrador is a British breed of retriever gun dog',
    'Pit bull is a term used in the United States for a type of dog descended from bulldogs and terriers, while in other countries such as the United Kingdom the term is used as an abbreviation of the American Pit Bull Terrier breed',
    'The Yorkshire Terrier (often shortened as Yorkie) is one of the smallest dog breeds of the terrier type, and of any dog breed'
]
console.time('Process example')
const example = getTopics(documents, {numberOfTopics: 2, docsMinTopicRank: 0.7, topicsMinWordRank: 0.04})
console.timeEnd('Process example')

console.log('Example output for politicians and dog breed corpora')
console.log(example)


// ------------------------------- Displaying results in DOM -----------------------------------------
const main = document.querySelector('main')
const resultsContainer = document.createElement('section')
resultsContainer.setAttribute('grid', 'row')

const docContainer = document.createElement('section')
docContainer.setAttribute('grid', 'column')
docContainer.setAttribute('column', 'true')
for (const docIdx in example.docs) {
    const docEl = document.createElement('blockquote')
    const {topic, rank} = example.docs[docIdx][0] ?? {topic: 'none', rank: 0}
    docEl.innerHTML = `<div class="card-box">
      <div class="card-content">
        <h3 class="title"><span class="tag-box ${rank > 0.8 ? '-success' : rank > 0 ? '-warning' : '-error'}">
        Topic #${topic} (${(rank * 100).toFixed(1)}%)</span></h3>
        <p class="content">${documents[docIdx]}</p>
      </div>
    </div>`
    docContainer.appendChild(docEl)
}
resultsContainer.appendChild(docContainer)

const topicContainer = document.createElement('section')
topicContainer.setAttribute('grid', 'column')
topicContainer.setAttribute('column', '4')
for (const topicIdx in example.topics) {
    const docEl = document.createElement('div')
    docEl.innerHTML = `<div class="card-box">
      <div class="card-content">
        <h3 class="title">Topic #${topicIdx}</h3>
        <p class="content"> 
${example.topics[topicIdx].map(({word}) => '<span class="tag-box">' + word + '</span>')}
        </p>
      </div>
    </div>`
    topicContainer.appendChild(docEl)
}

resultsContainer.appendChild(topicContainer)
const pre = document.createElement('pre')
pre.innerText = JSON.stringify(example, null, 2)
main.appendChild(resultsContainer)
main.appendChild(pre)
