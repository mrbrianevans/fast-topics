package logic

import (
	"bufio"
	"os"
	"testing"
)

const (
	TEST_CASE_DIR = "../testCases/"
)

func ReadFileToArray(filename string) ([]string, error) {
	file, err := os.Open(TEST_CASE_DIR + filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	var array []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		array = append(array, scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return array, nil
}

type Case struct {
	filename string
	options  GetTopicsOptions
}

func BenchmarkGetTopics(b *testing.B) {
	cases := []Case{
		{
			filename: "DogBreeds.txt", // small corpus (<20 documents)
			options:  GetTopicsOptions{NumberOfTopics: 3},
		},
		{
			filename: "Proverbs.txt", // large corpus (~900 documents)
			options:  GetTopicsOptions{NumberOfTopics: 10},
		},
		{
			filename: "Proverbs.txt", // large corpus, more topics
			options:  GetTopicsOptions{NumberOfTopics: 50},
		},
	}
	for _, benchCase := range cases {
		b.StopTimer() // don't count file read in benchmark
		docs, err := ReadFileToArray(benchCase.filename)
		if err != nil {
			b.Error(err)
		}
		b.StartTimer()
		for i := 0; i < b.N; i++ {
			GetTopics(docs, benchCase.options)
		}
	}
}

func TestGetTopics(t *testing.T) {
	tests := []struct {
		name             string
		args             Case
		wantDocsLength   int
		wantTopicsLength int
	}{
		{name: "dog breeds", args: struct {
			filename string
			options  GetTopicsOptions
		}{filename: "DogBreeds.txt", options: GetTopicsOptions{NumberOfTopics: 3}}, wantDocsLength: 13, wantTopicsLength: 3},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			corpus, err := ReadFileToArray(tt.args.filename)
			if err != nil {
				t.Error(err)
			}
			gotDocs, gotTopics := GetTopics(corpus, tt.args.options)
			if len(gotDocs) != tt.wantDocsLength {
				t.Errorf("GetTopics() got = %v, want %v", len(gotDocs), tt.wantDocsLength)
			}
			if len(gotTopics) != tt.wantTopicsLength {
				t.Errorf("GetTopics() got1 = %v, want %v", len(gotTopics), tt.wantTopicsLength)
			}
		})
	}
}
