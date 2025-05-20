package main

import (
	"fmt"
	"log"
	"net/http"
)

func apiHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println(w, `{"message": "Hello from Go API!"}`)
}

func main() {
	http.HandleFunc("/api/", apiHandler)
	fmt.Println("Go API server running at http://localhost:4000")
	log.Fatal(http.ListenAndServe(":4000", nil))
}
