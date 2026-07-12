package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

const service = "appaloft-example-go-http"

var startedAt = time.Now().UTC().Format(time.RFC3339)

func port() string {
	if p := os.Getenv("PORT"); p != "" {
		return p
	}
	if p := os.Getenv("APPALOFT_PORT"); p != "" {
		return p
	}
	return "8080"
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	payload, err := json.Marshal(body)
	if err != nil {
		http.Error(w, `{"ok":false,"error":"encode_failed"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.Header().Set("cache-control", "no-store")
	w.WriteHeader(status)
	_, _ = w.Write(payload)
}

func main() {
	p := port()
	mux := http.NewServeMux()

	health := func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"ok":        true,
			"service":   service,
			"status":    "healthy",
			"port":      p,
			"startedAt": startedAt,
			"now":       time.Now().UTC().Format(time.RFC3339),
		})
	}
	mux.HandleFunc("/health", health)
	mux.HandleFunc("/api/health", health)
	mux.HandleFunc("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"message":   "Hello from Appaloft Go example",
			"service":   service,
			"startedAt": startedAt,
		})
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && r.URL.Path != "/index.html" {
			writeJSON(w, http.StatusNotFound, map[string]any{
				"ok":    false,
				"error": "not_found",
				"path":  r.URL.Path,
			})
			return
		}
		w.Header().Set("content-type", "text/html; charset=utf-8")
		w.Header().Set("cache-control", "no-store")
		_, _ = fmt.Fprintf(w, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><title>Appaloft Go HTTP</title>
<style>:root{color-scheme:light dark;font-family:ui-sans-serif,system-ui,sans-serif}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1220;color:#e8eefc}
main{max-width:40rem;padding:2rem;border:1px solid #243149;border-radius:1rem;background:#121a2b}
code{color:#9fd0ff}p{color:#b7c3db;line-height:1.5}</style></head>
<body><main>
<h1>Appaloft Go HTTP</h1>
<p>Stdlib-only Go service for <strong>git-public</strong> multi-language smoke.</p>
<p>Port: <code>%s</code> · Health: <code>/health</code></p>
<p>Started at <code>%s</code></p>
</main></body></html>`, p, startedAt)
	})

	addr := "0.0.0.0:" + p
	log.Printf(`{"level":"info","message":"%s.listening","port":%q,"health":"/health"}`, service, p)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
