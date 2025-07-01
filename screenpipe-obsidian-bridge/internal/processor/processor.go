package processor

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"screenpipe-obsidian-bridge/internal/config"
	"screenpipe-obsidian-bridge/internal/llm"
	"screenpipe-obsidian-bridge/internal/obsidian"
	"screenpipe-obsidian-bridge/internal/watcher"
)

// Processor orchestrates the main workflow
type Processor struct {
	config         *config.Config
	watcher        *watcher.Watcher
	llmClient      llm.Client
	obsidianWriter *obsidian.Writer
	
	// Processing state
	processQueue   chan string
	processingMutex sync.Mutex
	isProcessing   map[string]bool
}

// New creates a new processor
func New(cfg *config.Config) (*Processor, error) {
	// Create file watcher
	fileWatcher, err := watcher.New(&cfg.ScreenPipe)
	if err != nil {
		return nil, fmt.Errorf("failed to create file watcher: %w", err)
	}

	// Create LLM client based on provider
	var llmClient llm.Client
	switch cfg.LLM.Provider {
	case "openai":
		llmClient = llm.NewOpenAIClient(&cfg.LLM)
	default:
		return nil, fmt.Errorf("unsupported LLM provider: %s", cfg.LLM.Provider)
	}

	// Create Obsidian writer
	obsidianWriter := obsidian.New(&cfg.Obsidian)

	processor := &Processor{
		config:         cfg,
		watcher:        fileWatcher,
		llmClient:      llmClient,
		obsidianWriter: obsidianWriter,
		processQueue:   make(chan string, cfg.Processing.BatchSize*2),
		isProcessing:   make(map[string]bool),
	}

	return processor, nil
}

// Start begins the processing workflow
func (p *Processor) Start(ctx context.Context) error {
	log.Println("🚀 Starting ScreenPipe Obsidian Bridge...")

	// Validate Obsidian vault
	if err := p.obsidianWriter.ValidateVaultPath(); err != nil {
		log.Printf("Warning: %v", err)
	}

	// Create vault structure
	if err := p.obsidianWriter.CreateVaultStructure(); err != nil {
		return fmt.Errorf("failed to create vault structure: %w", err)
	}

	// Start file watcher
	if err := p.watcher.Start(ctx); err != nil {
		return fmt.Errorf("failed to start file watcher: %w", err)
	}

	// Start processing goroutines
	go p.handleFileEvents(ctx)
	go p.processFiles(ctx)

	log.Printf("✅ Successfully started monitoring:")
	log.Printf("   📂 ScreenPipe Output: %s", p.config.ScreenPipe.OutputPath)
	log.Printf("   📝 Obsidian Vault: %s", p.config.Obsidian.VaultPath)
	log.Printf("   🤖 LLM Provider: %s (%s)", p.config.LLM.Provider, p.config.LLM.Model)

	return nil
}

// Stop stops the processor
func (p *Processor) Stop() error {
	log.Println("🛑 Stopping ScreenPipe Obsidian Bridge...")
	
	close(p.processQueue)
	return p.watcher.Stop()
}

// handleFileEvents processes file system events
func (p *Processor) handleFileEvents(ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("File event handler recovered from panic: %v", r)
		}
	}()

	for {
		select {
		case <-ctx.Done():
			log.Println("File event handler context cancelled")
			return

		case event, ok := <-p.watcher.Events():
			if !ok {
				log.Println("File events channel closed")
				return
			}

			// Check if we should process this file
			if p.shouldProcessFile(event.Path) {
				select {
				case p.processQueue <- event.Path:
					log.Printf("📋 Queued file for processing: %s", event.Path)
				case <-ctx.Done():
					return
				default:
					log.Printf("⚠️ Process queue full, skipping file: %s", event.Path)
				}
			}

		case err, ok := <-p.watcher.Errors():
			if !ok {
				log.Println("File watcher errors channel closed")
				return
			}
			log.Printf("❌ File watcher error: %v", err)
		}
	}
}

// processFiles handles the file processing queue
func (p *Processor) processFiles(ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("File processor recovered from panic: %v", r)
		}
	}()

	// Batch processing with delay
	batch := make([]string, 0, p.config.Processing.BatchSize)
	ticker := time.NewTicker(time.Duration(p.config.Processing.BatchDelay) * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("File processor context cancelled")
			return

		case filePath, ok := <-p.processQueue:
			if !ok {
				// Process any remaining files in batch
				if len(batch) > 0 {
					p.processBatch(ctx, batch)
				}
				log.Println("Process queue closed")
				return
			}

			batch = append(batch, filePath)

			// Process batch if it's full
			if len(batch) >= p.config.Processing.BatchSize {
				p.processBatch(ctx, batch)
				batch = batch[:0] // Reset batch
			}

		case <-ticker.C:
			// Process batch on timer if not empty
			if len(batch) > 0 {
				p.processBatch(ctx, batch)
				batch = batch[:0] // Reset batch
			}
		}
	}
}

// processBatch processes a batch of files
func (p *Processor) processBatch(ctx context.Context, filePaths []string) {
	log.Printf("🔄 Processing batch of %d files", len(filePaths))

	for _, filePath := range filePaths {
		if err := p.processFile(ctx, filePath); err != nil {
			log.Printf("❌ Failed to process file %s: %v", filePath, err)
		}
	}
}

// processFile processes a single file
func (p *Processor) processFile(ctx context.Context, filePath string) error {
	// Check if already processing this file
	p.processingMutex.Lock()
	if p.isProcessing[filePath] {
		p.processingMutex.Unlock()
		return nil // Skip if already processing
	}
	p.isProcessing[filePath] = true
	p.processingMutex.Unlock()

	defer func() {
		p.processingMutex.Lock()
		delete(p.isProcessing, filePath)
		p.processingMutex.Unlock()
	}()

	log.Printf("🔍 Processing file: %s", filePath)

	// Read file content
	content, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}

	// Skip empty files
	if len(content) == 0 {
		log.Printf("⏭️ Skipping empty file: %s", filePath)
		return nil
	}

	// Process with LLM
	result, err := p.llmClient.ProcessContent(ctx, string(content), filePath)
	if err != nil {
		return fmt.Errorf("failed to process content with LLM: %w", err)
	}

	// Write to Obsidian
	if err := p.obsidianWriter.WriteNote(result); err != nil {
		return fmt.Errorf("failed to write Obsidian note: %w", err)
	}

	log.Printf("✅ Successfully processed: %s", filePath)
	log.Printf("   📊 Token usage: %d total (%d prompt + %d completion)",
		result.Metadata.TokenUsage.TotalTokens,
		result.Metadata.TokenUsage.PromptTokens,
		result.Metadata.TokenUsage.CompletionTokens)

	return nil
}

// shouldProcessFile determines if a file should be processed
func (p *Processor) shouldProcessFile(filePath string) bool {
	// Check file size - skip very large files
	info, err := os.Stat(filePath)
	if err != nil {
		log.Printf("❌ Failed to stat file %s: %v", filePath, err)
		return false
	}

	// Skip files larger than 1MB for now
	maxSize := int64(1024 * 1024) // 1MB
	if info.Size() > maxSize {
		log.Printf("⏭️ Skipping large file (%d bytes): %s", info.Size(), filePath)
		return false
	}

	// Skip files that are too new (might still be writing)
	if time.Since(info.ModTime()) < 5*time.Second {
		log.Printf("⏭️ Skipping recently modified file: %s", filePath)
		return false
	}

	return true
}

// GetStatus returns the current processor status
func (p *Processor) GetStatus() ProcessorStatus {
	p.processingMutex.Lock()
	defer p.processingMutex.Unlock()

	return ProcessorStatus{
		WatchedPaths:     p.watcher.GetWatchedPaths(),
		QueueLength:      len(p.processQueue),
		ProcessingFiles:  len(p.isProcessing),
		LLMProvider:      p.llmClient.GetProvider(),
	}
}

// ProcessorStatus contains status information
type ProcessorStatus struct {
	WatchedPaths    []string `json:"watched_paths"`
	QueueLength     int      `json:"queue_length"`
	ProcessingFiles int      `json:"processing_files"`
	LLMProvider     string   `json:"llm_provider"`
}

// TODO: Add more sophisticated features:
// - Retry logic for failed processing
// - File content deduplication
// - Processing history/cache
// - Metrics and monitoring
// - Configuration hot-reloading
// - Support for different ScreenPipe output formats 