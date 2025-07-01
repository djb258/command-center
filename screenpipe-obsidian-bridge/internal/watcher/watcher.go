package watcher

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/fsnotify/fsnotify"
	"screenpipe-obsidian-bridge/internal/config"
)

// FileEvent represents a file system event
type FileEvent struct {
	Path      string
	Operation string
	Timestamp time.Time
}

// Watcher monitors ScreenPipe output directory for changes
type Watcher struct {
	config   *config.ScreenPipeConfig
	watcher  *fsnotify.Watcher
	events   chan FileEvent
	errors   chan error
	patterns []string
}

// New creates a new file watcher
func New(cfg *config.ScreenPipeConfig) (*Watcher, error) {
	fsWatcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, fmt.Errorf("failed to create fsnotify watcher: %w", err)
	}

	w := &Watcher{
		config:   cfg,
		watcher:  fsWatcher,
		events:   make(chan FileEvent, 100), // Buffer events
		errors:   make(chan error, 10),
		patterns: cfg.WatchPatterns,
	}

	return w, nil
}

// Start begins monitoring the ScreenPipe output directory
func (w *Watcher) Start(ctx context.Context) error {
	// Add the ScreenPipe output directory to the watcher
	err := w.watcher.Add(w.config.OutputPath)
	if err != nil {
		return fmt.Errorf("failed to add watch path %s: %w", w.config.OutputPath, err)
	}

	log.Printf("Started watching ScreenPipe output directory: %s", w.config.OutputPath)
	log.Printf("Watching for file patterns: %v", w.patterns)

	// Start processing events in a goroutine
	go w.processEvents(ctx)

	return nil
}

// Stop stops the file watcher
func (w *Watcher) Stop() error {
	close(w.events)
	close(w.errors)
	return w.watcher.Close()
}

// Events returns the channel for file events
func (w *Watcher) Events() <-chan FileEvent {
	return w.events
}

// Errors returns the channel for watcher errors
func (w *Watcher) Errors() <-chan error {
	return w.errors
}

// processEvents handles fsnotify events and filters them
func (w *Watcher) processEvents(ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Watcher processEvents recovered from panic: %v", r)
		}
	}()

	for {
		select {
		case <-ctx.Done():
			log.Println("Watcher context cancelled, stopping event processing")
			return

		case event, ok := <-w.watcher.Events:
			if !ok {
				log.Println("Watcher events channel closed")
				return
			}

			// Filter events based on patterns and operations
			if w.shouldProcessEvent(event) {
				fileEvent := FileEvent{
					Path:      event.Name,
					Operation: event.Op.String(),
					Timestamp: time.Now(),
				}

				select {
				case w.events <- fileEvent:
					log.Printf("File event: %s %s", fileEvent.Operation, fileEvent.Path)
				case <-ctx.Done():
					return
				default:
					log.Printf("Warning: Event buffer full, dropping event for %s", event.Name)
				}
			}

		case err, ok := <-w.watcher.Errors:
			if !ok {
				log.Println("Watcher errors channel closed")
				return
			}

			select {
			case w.errors <- err:
				log.Printf("Watcher error: %v", err)
			case <-ctx.Done():
				return
			default:
				log.Printf("Warning: Error buffer full, dropping error: %v", err)
			}
		}
	}
}

// shouldProcessEvent determines if an event should be processed
func (w *Watcher) shouldProcessEvent(event fsnotify.Event) bool {
	// Only process write and create events (ignore chmod, remove, etc.)
	if !event.Has(fsnotify.Write) && !event.Has(fsnotify.Create) {
		return false
	}

	// Check if file matches any of our watch patterns
	filename := filepath.Base(event.Name)
	
	for _, pattern := range w.patterns {
		matched, err := filepath.Match(pattern, filename)
		if err != nil {
			log.Printf("Error matching pattern %s against %s: %v", pattern, filename, err)
			continue
		}
		
		if matched {
			return true
		}
	}

	return false
}

// AddRecursiveWatch adds a directory and all its subdirectories to the watcher
func (w *Watcher) AddRecursiveWatch(rootPath string) error {
	return filepath.Walk(rootPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		if info.IsDir() {
			return w.watcher.Add(path)
		}
		
		return nil
	})
}

// IsWatching checks if a path is currently being watched
func (w *Watcher) IsWatching(path string) bool {
	watchList := w.watcher.WatchList()
	for _, watchedPath := range watchList {
		if watchedPath == path {
			return true
		}
	}
	return false
}

// GetWatchedPaths returns all currently watched paths
func (w *Watcher) GetWatchedPaths() []string {
	return w.watcher.WatchList()
}

// TODO: Add more sophisticated filtering options
// - File size thresholds
// - Time-based filtering (only process files newer than X)
// - Content type detection
// - Debouncing for rapid file changes 