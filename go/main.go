package main

import (
	"encoding/json"
	"fast-topics/logic"
	"github.com/norunners/vert"
	"syscall/js"
)

func jsonWrapper() js.Func {
	jsonFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		jsError := js.Global().Get("Error") // for returning an Error object
		if len(args) < 2 || len(args) > 2 {
			return jsError.New("Invalid no of arguments passed")
		}
		corpus, options := args[0], args[1]
		jsArray := js.Global().Get("Array")
		if !corpus.InstanceOf(jsArray) {

			return jsError.New("Corpus (arg0) is not an array. Needs to be an array of strings")
		}
		if options.Type() != js.TypeObject {
			return jsError.New("Options (arg1) is not an object. Needs to be an object of options")
		}
		var goCorpus []string
		jsCorpus := vert.ValueOf(corpus)
		err := jsCorpus.AssignTo(&goCorpus)
		if err != nil {
			return jsError.New("Bad input, could not assign string array")
		}
		goOptions := logic.GetTopicsOptions{
			NumberOfTopics:    options.Get("numberOfTopics").Int(),
			TopicsMinWordRank: options.Get("topicsMinWordRank").Float(),
			DocsMinTopicRank:  options.Get("docsMinTopicRank").Float(),
		}
		docs, topics := logic.GetTopics(goCorpus, goOptions)
		// combine into single JSON object { docs, topics }
		stringified, _ := json.Marshal(struct {
			Docs   map[int]logic.DocTopics  `json:"docs,omitempty"`
			Topics map[int]logic.TopicWords `json:"topics,omitempty"`
		}{Docs: docs, Topics: topics})
		return string(stringified)
	}) // returns a serialised JSON string
	return jsonFunc
}

func main() {
	// defines function called 'getTopicsString' which returns a JSON string
	js.Global().Set("getTopicsString", jsonWrapper())
	<-make(chan bool) // keeps program running so JS can call func anytime
}
