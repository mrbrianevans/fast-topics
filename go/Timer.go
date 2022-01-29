package main

import (
	"log"
	"time"
)

func RunningTime(s string) (string, time.Time) {
	return s, time.Now()
}

func Track(s string, startTime time.Time) {
	endTime := time.Now()
	log.Println("Finished:", s, "in", endTime.Sub(startTime))
}
