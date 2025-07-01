package monitor

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/cursor-blueprint-enforcer/screenpipe-assistant-bridge/internal/processor"
)

// Monitor watches the ScreenPipe data directory for new files
type Monitor struct {
	dataDir      string
	pollInterval time.Duration
	processor    *processor.Processor
	watcher      *fsnotify.Watcher
	ctx          context.Context
	cancel       context.CancelFunc
	knownFiles   map[string]time.Time // Track files we've already processed
}

// New creates a new file monitor
func New(dataDir string, pollInterval time.Duration, proc *processor.Processor) (*Monitor, error) {
	// Create directory if it doesn't exist
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}

	// Initialize fsnotify watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, fmt.Errorf("failed to create file watcher: %w", err)
	}

	ctx, cancel := context.WithCancel(context.Background())

	return &Monitor{
		dataDir:      dataDir,
		pollInterval: pollInterval,
		processor:    proc,
		watcher:      watcher,
		ctx:          ctx,
		cancel:       cancel,
		knownFiles:   make(map[string]time.Time),
	}, nil
}

// Start begins monitoring the data directory
func (m *Monitor) Start() error {
	log.Printf("Starting file monitor for directory: %s", m.dataDir)

	// Add the data directory to the watcher
	if err := m.watcher.Add(m.dataDir); err != nil {
		return fmt.Errorf("failed to add directory to watcher: %w", err)
	}

	// Start the file event handler
	go m.handleFileEvents()

	// Start the polling mechanism as backup
	go m.pollForNewFiles()

	// Wait for context cancellation
	<-m.ctx.Done()
	return nil
}

// Stop stops the monitor
func (m *Monitor) Stop() error {
	log.Println("Stopping file monitor...")
	m.cancel()
	return m.watcher.Close()
}

// handleFileEvents processes file system events
func (m *Monitor) handleFileEvents() {
	for {
		select {
		case event, ok := <-m.watcher.Events:
			if !ok {
				return
			}
			m.handleEvent(event)
		case err, ok := <-m.watcher.Errors:
			if !ok {
				return
			}
			log.Printf("File watcher error: %v", err)
		case <-m.ctx.Done():
			return
		}
	}
}

// handleEvent processes a single file system event
func (m *Monitor) handleEvent(event fsnotify.Event) {
	// Only process write events (new files or modifications)
	if event.Op&fsnotify.Write == 0 {
		return
	}

	// Check if this is a file we care about
	if !m.isRelevantFile(event.Name) {
		return
	}

	// Check if we've already processed this file recently
	if m.isRecentlyProcessed(event.Name) {
		return
	}

	log.Printf("New file detected: %s", event.Name)

	// Wait a moment for the file to be fully written
	time.Sleep(1 * time.Second)

	// Process the file
	go func() {
		if err := m.processor.ProcessFile(event.Name); err != nil {
			log.Printf("Failed to process file %s: %v", event.Name, err)
		} else {
			// Mark file as processed
			m.knownFiles[event.Name] = time.Now()
		}
	}()
}

// pollForNewFiles periodically scans for new files (backup mechanism)
func (m *Monitor) pollForNewFiles() {
	ticker := time.NewTicker(m.pollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			m.scanForNewFiles()
		case <-m.ctx.Done():
			return
		}
	}
}

// scanForNewFiles scans the directory for new files
func (m *Monitor) scanForNewFiles() {
	files, err := os.ReadDir(m.dataDir)
	if err != nil {
		log.Printf("Failed to read data directory: %v", err)
		return
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filePath := filepath.Join(m.dataDir, file.Name())

		// Check if this is a relevant file
		if !m.isRelevantFile(filePath) {
			continue
		}

		// Check if we've already processed this file
		if m.isRecentlyProcessed(filePath) {
			continue
		}

		// Get file info to check if it's complete
		fileInfo, err := file.Info()
		if err != nil {
			log.Printf("Failed to get file info for %s: %v", filePath, err)
			continue
		}

		// Skip files that are too small (likely incomplete)
		if fileInfo.Size() < 100 {
			continue
		}

		// Skip files that were modified too recently (likely still being written)
		if time.Since(fileInfo.ModTime()) < 2*time.Second {
			continue
		}

		log.Printf("New file found during scan: %s", filePath)

		// Process the file
		go func() {
			if err := m.processor.ProcessFile(filePath); err != nil {
				log.Printf("Failed to process file %s: %v", filePath, err)
			} else {
				// Mark file as processed
				m.knownFiles[filePath] = time.Now()
			}
		}()
	}

	// Clean up old entries from knownFiles
	m.cleanupKnownFiles()
}

// isRelevantFile checks if a file matches our processing patterns
func (m *Monitor) isRelevantFile(filePath string) bool {
	ext := strings.ToLower(filepath.Ext(filePath))
	
	// Check common ScreenPipe file extensions
	relevantExtensions := []string{
		".mp4",  // Video files
		".wav",  // Audio files
		".txt",  // Text files
		".json", // JSON data files
		".png",  // Screenshot files
		".jpg",  // Screenshot files
		".jpeg", // Screenshot files
	}

	for _, relevantExt := range relevantExtensions {
		if ext == relevantExt {
			return true
		}
	}

	// Check if filename contains ScreenPipe patterns
	fileName := strings.ToLower(filepath.Base(filePath))
	screenPipePatterns := []string{
		"monitor_",
		"microphone",
		"speakers",
		"transcript",
		"ocr",
	}

	for _, pattern := range screenPipePatterns {
		if strings.Contains(fileName, pattern) {
			return true
		}
	}

	return false
}

// isRecentlyProcessed checks if a file was processed recently
func (m *Monitor) isRecentlyProcessed(filePath string) bool {
	if lastProcessed, exists := m.knownFiles[filePath]; exists {
		// Consider files processed if they were handled in the last 5 minutes
		return time.Since(lastProcessed) < 5*time.Minute
	}
	return false
}

// cleanupKnownFiles removes old entries from the knownFiles map
func (m *Monitor) cleanupKnownFiles() {
	cutoff := time.Now().Add(-1 * time.Hour) // Remove entries older than 1 hour
	
	for filePath, lastProcessed := range m.knownFiles {
		if lastProcessed.Before(cutoff) {
			delete(m.knownFiles, filePath)
		}
	}
}

// GetStats returns monitoring statistics
func (m *Monitor) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"data_dir":       m.dataDir,
		"poll_interval":  m.pollInterval.String(),
		"known_files":    len(m.knownFiles),
		"is_running":     m.ctx.Err() == nil,
	}
} 