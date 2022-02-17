export interface GetTopicsOptions {
    /** the number of topics to extract */
    numberOfTopics: number
    /** the minimum rank for a word to be included in a topic */
    topicsMinWordRank: number
    /** the minimum rank for a document to be tagged with a topic */
    docsMinTopicRank: number
}

export const defaultGetTopicsOptions: GetTopicsOptions = {
    numberOfTopics: 5, topicsMinWordRank: 0, docsMinTopicRank: 0
}