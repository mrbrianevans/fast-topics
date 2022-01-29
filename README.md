# fast-topics

Unsupervised topic extraction from text
using [Latent Dirichlet Allocation](https://en.wikipedia.org/wiki/Latent_Dirichlet_allocation).

Written in Go, using [nlp](https://pkg.go.dev/github.com/james-bowman/nlp) library. Compiled
to [WebAssembly](https://webassembly.org) for use in browsers. Zero JavaScript dependencies.

Bindings written in TypeScript and compiled to JavaScript.

## Demo

To see a demo of the algorithm, run `npm run demo` and go to [`localhost:8080`](http://localhost:8080).

## Basic usage

```javascript
import {getTopics, initialiseWasm} from 'fast-topics'

await initialiseWasm()

const documents = ['quick brown fox', 'cow jumped over moon', 'the crafty fox', 'moon of cheese']
const {docs, topics} = getTopics(documents)
for (const [idx, doc] of Object.entries(docs))
    console.log('Doc', documents[idx], 'Topic', doc[0].topic)
for (const [idx, topic] of Object.entries(topics))
    console.log('Topic', idx, 'words', topic[0].word, topic[1].word, topic[2].word)
```

See [below](#usage-in-browsers-with-frameworks) for how to use with frameworks such as Vite.

## Source code

Go code is contained in `go` directory. The logic is in its own file, and the `main.go` file just manages the JavaScript
bindings and exports.

TypeScript and JavaScript bindings source code is in `js`.

The compiled outputs are in `dist` when built with `npm run build`.

Outputs can be built seperately with these scripts:

```bash
npm run build:ts # for typescript only
npm run build:go # for go only
```

Building WASM from source requires a Go compiler to be installed.

## Usage in browsers with frameworks

The WebAssembly module needs to be initialised before the function can be called. The initialisation function
is `await initialiseWasm()`. There are two built in initialisation methods: `initWithFetch` and `initWithBinary`.
`initWithFetch` is the default and is recommended for better performance (due to streaming). It needs to be given a URL
to request the static binary `.wasm` file from. The default URL is `node_modules/fast-topics/dist/topics.wasm`, but if
you are using a bundler (like Webpack or Vite), then this probably isn't going to work. You need to provide a URL from
your bundler to the file.

Example for Vite:

```javascript
import {initialiseWasm} from 'fast-topics'
import wasmUrl from 'fast-topics/dist/topics.wasm?url' // note ?url

await initialiseWasm(wasmUrl)
```

When an import ends with `?url`, Vite automatically serves it at a static file, and assigns the URL to the import
variable (`wasmUrl` in this example).

The initialisation method can be set seperately to actually invoking it, as shown below:

```javascript
import {
    getTopics,
    initialiseWasm,
    initWithFetch,
    setInitFunction
} from 'fast-topics'
import wasmUrl from 'fast-topics/dist/topics.wasm?url' // note ?url

setInitFunction(initWithFetch(wasmUrl))

// perform other logic
// when WASM is required, run:
await initialiseWasm()
```

### Using an ArrayBuffer to init WebAssembly

The WASM module can also be initialised by providing an ArrayBuffer, however this is not recommended as it prevents
streaming.

```javascript
import {initialiseWasm} from 'fast-topics'

await fetch("node_modules/fast-topics/dist/topics.wasm")
    .then(r => r.arrayBuffer())
    .then(binary => initialiseWasm(binary))
```