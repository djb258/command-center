package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"screenpipe-assistant-bridge/internal/bridge"
)

func main() {
	dataDir := os.ExpandEnv("$USERPROFILE/.screenpipe/data")
	fmt.Println("[Bridge] Monitoring ScreenPipe data directory:", dataDir)

	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		log.Fatalf("Data directory does not exist: %s", dataDir)
	}

	// Initialize processor
	processor, err := bridge.New()
	if err != nil {
		log.Fatalf("Failed to initialize processor: %v", err)
	}

	fmt.Println("[Bridge] Processor initialized successfully")
	fmt.Println("[Bridge] Starting file monitoring...")

	// Main event loop: poll for new files every 10 seconds
	seen := make(map[string]bool)
	for {
		files, err := filepath.Glob(filepath.Join(dataDir, "*"))
		if err != nil {
			log.Println("Error reading data directory:", err)
			continue
		}
		
		for _, f := range files {
			if !seen[f] {
				fmt.Printf("[Bridge] New file detected: %s\n", f)
				
				// Process the file
				if err := processor.ProcessFile(f); err != nil {
					log.Printf("[Bridge] Error processing file %s: %v", f, err)
				}
				
				seen[f] = true
			}
		}
		
		time.Sleep(10 * time.Second)
	}
} 