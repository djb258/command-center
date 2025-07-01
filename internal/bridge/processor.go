package bridge

import (
	"fmt"
	"log"
	"path/filepath"
	"strings"
	"time"

	"screenpipe-assistant-bridge/internal/llm"
	"screenpipe-assistant-bridge/internal/obsidian"
)

type Processor struct {
	llmClient    *llm.Client
	obsidianWriter *obsidian.Writer
}

func New() (*Processor, error) {
	// Initialize LLM client
	llmClient, err := llm.New()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize LLM client: %w", err)
	}

	// Initialize Obsidian writer
	obsidianWriter, err := obsidian.New("")
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Obsidian writer: %w", err)
	}

	return &Processor{
		llmClient:    llmClient,
		obsidianWriter: obsidianWriter,
	}, nil
}

func (p *Processor) ProcessFile(filePath string) error {
	log.Printf("[Processor] Processing file: %s", filePath)

	// Determine file type based on extension
	fileType := p.getFileType(filePath)
	
	// Skip processing if file type is not supported
	if fileType == "unknown" {
		log.Printf("[Processor] Skipping unsupported file type: %s", filePath)
		return nil
	}

	// Process with LLM
	log.Printf("[Processor] Sending to LLM for analysis...")
	analysis, err := p.llmClient.ProcessScreenData(filePath, fileType)
	if err != nil {
		return fmt.Errorf("failed to process with LLM: %w", err)
	}

	// Generate title from filename
	title := p.generateTitle(filePath, fileType)

	// Add metadata
	metadata := map[string]interface{}{
		"original_file": filePath,
		"file_type":     fileType,
		"processed_at":  time.Now().Format("2006-01-02T15:04:05Z"),
	}

	// Write to Obsidian
	log.Printf("[Processor] Writing note to Obsidian...")
	if err := p.obsidianWriter.WriteNoteWithMetadata(analysis, title, metadata); err != nil {
		return fmt.Errorf("failed to write to Obsidian: %w", err)
	}

	log.Printf("[Processor] Successfully processed: %s", filePath)
	return nil
}

func (p *Processor) getFileType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	
	switch ext {
	case ".mp4", ".avi", ".mov", ".mkv":
		return "video"
	case ".wav", ".mp3", ".m4a", ".flac":
		return "audio"
	case ".png", ".jpg", ".jpeg", ".gif", ".bmp":
		return "image"
	case ".txt", ".log":
		return "text"
	default:
		return "unknown"
	}
}

func (p *Processor) generateTitle(filePath, fileType string) string {
	// Extract filename without extension
	filename := filepath.Base(filePath)
	nameWithoutExt := strings.TrimSuffix(filename, filepath.Ext(filename))
	
	// Clean up the filename (remove timestamps, underscores, etc.)
	title := strings.ReplaceAll(nameWithoutExt, "_", " ")
	title = strings.ReplaceAll(title, "-", " ")
	
	// Add file type context
	return fmt.Sprintf("%s (%s)", title, fileType)
} 