package logic

import (
	"fast-topics/timer"
	"fmt"
	"github.com/james-bowman/nlp"
	"sort"
)

var stopWords = []string{"a", "quot", "don", "th", "amp", "video", "vs", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amoungst", "amount", "an", "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are", "around", "as", "at", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom", "but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven", "else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "i", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves"}

type TopicWord struct {
	Word string  `json:"word"`
	Rank float64 `json:"rank"`
}
type TopicWords []TopicWord

func (d TopicWords) Len() int           { return len(d) }
func (d TopicWords) Less(i, j int) bool { return d[i].Rank > d[j].Rank }
func (d TopicWords) Swap(i, j int)      { d[i], d[j] = d[j], d[i] }

type DocTopic struct {
	Topic int     `json:"topic"`
	Rank  float64 `json:"rank"`
}
type DocTopics []DocTopic

func (d DocTopics) Len() int           { return len(d) }
func (d DocTopics) Less(i, j int) bool { return d[i].Rank > d[j].Rank }
func (d DocTopics) Swap(i, j int)      { d[i], d[j] = d[j], d[i] }

type GetTopicsOptions struct {
	NumberOfTopics int `js:"numberOfTopics"`
}

func GetTopics(corpus []string, options GetTopicsOptions) (map[int]DocTopics, map[int]TopicWords) {
	defer timer.Track(timer.RunningTime(fmt.Sprintf("Get %d main topics of %d documents", options.NumberOfTopics, len(corpus))))
	// Create a pipeline with a count vectoriser and LDA transformer for 2 topics
	vectoriser := nlp.NewCountVectoriser(stopWords...)
	// the tdif would be nice, but its too expensive for large corpuses of documents
	//tdif := nlp.NewTfidfTransformer()
	lda := nlp.NewLatentDirichletAllocation(options.NumberOfTopics)
	pipeline := nlp.NewPipeline(vectoriser, lda)
	docsOverTopics, _ := pipeline.FitTransform(corpus...)

	topicsOverWords := lda.Components()
	tr, tc := topicsOverWords.Dims()
	vocab := make([]string, len(vectoriser.Vocabulary))
	for k, v := range vectoriser.Vocabulary {
		vocab[v] = k
	}
	topics := make(map[int]TopicWords, options.NumberOfTopics)
	for topic := 0; topic < tr; topic++ {
		topicWords := make(TopicWords, tc)
		for word := 0; word < tc; word++ {
			topicWords[word] = TopicWord{
				Word: vocab[word],
				Rank: topicsOverWords.At(topic, word),
			}
		}
		sort.Sort(topicWords)
		topics[topic] = topicWords
	}

	// Examine Document over Topic probability distribution
	dr, dc := docsOverTopics.Dims()
	docs := make(map[int]DocTopics, dc)
	for doc := 0; doc < dc; doc++ {
		//fmt.Printf("\nDocument '%s' -", corpus[doc])
		docTopics := make(DocTopics, dr)
		for topic := 0; topic < dr; topic++ {
			docTopics[topic] = DocTopic{
				Topic: topic,
				Rank:  docsOverTopics.At(topic, doc),
			}
		}
		sort.Sort(docTopics)
		docs[doc] = docTopics
	}
	return docs, topics
	//for i, doc := range docs {
	//	f := doc[0].Topic
	//	s := doc[1].Topic
	//	fmt.Printf("Document '%s' topics: #%d('%s', '%s')[%2f], #%d('%s', '%s')[%2f]\n", corpus[i], f, topics[f][0].Word, topics[f][1].Word, doc[0].Rank, s, topics[s][0].Word, topics[s][1].Word, doc[1].Rank)
	//}
	//allScores := make([]float64, options.numberOfTopics)
	//for i, topicWords := range topics {
	//	fmt.Printf("Topic #%d - ", i)
	//	topicTotal := float64(0)
	//	for _, Word := range topicWords[:3] {
	//		topicTotal += Word.Rank
	//		// print top 3
	//		fmt.Printf("'%s'=%3f, ", Word.Word, Word.Rank)
	//	}
	//	fmt.Printf("Total score: %f ", topicTotal)
	//	fmt.Println()
	//	allScores[i] = topicTotal
	//}
	//sum := float64(0)
	//for _, score := range allScores {
	//	sum += score
	//}
	//fmt.Printf("Average Topic score: %f\n", sum/float64(numberOfTopics))
	//return nil, nil
}
