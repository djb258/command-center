package processor

import (
	"context"
	"fmt"
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/cursor-blueprint-enforcer/screenpipe-assistant-bridge/internal/config"
	"github.com/cursor-blueprint-enforcer/screenpipe-assistant-bridge/internal/llm"
	"github.com/cursor-blueprint-enforcer/screenpipe-assistant-bridge/internal/obsidian"
)

// Processor handles the main processing pipeline
type Processor struct {
	config   *config.Config
	llm      *llm.Client
	obsidian *obsidian.Writer
	ctx      context.Context
	cancel   context.CancelFunc
}

// ProcessingResult represents the result of processing a file
type ProcessingResult struct {
	Filepath    string    `json:"filepath"`
	Type        string    `json:"type"`
	Content     string    `json:"content"`
	Summary     string    `json:"summary"`
	ActionItems []string  `json:"action_items"`
	Compliance  []string  `json:"compliance"`
	Timestamp   time.Time `json:"timestamp"`
	Status      string    `json:"status"`
	Error       string    `json:"error,omitempty"`
}

// New creates a new processor
func New(cfg *config.Config) (*Processor, error) {
	ctx, cancel := context.WithCancel(context.Background())

	// Initialize LLM client
	llmClient, err := llm.New(cfg)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to initialize LLM client: %w", err)
	}

	// Initialize Obsidian writer
	obsidianWriter, err := obsidian.New(cfg)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to initialize Obsidian writer: %w", err)
	}

	return &Processor{
		config:   cfg,
		llm:      llmClient,
		obsidian: obsidianWriter,
		ctx:      ctx,
		cancel:   cancel,
	}, nil
}

// ProcessFile processes a single file from ScreenPipe
func (p *Processor) ProcessFile(filepath string) error {
	log.Printf("Processing file: %s", filepath)

	// Create processing result
	result := &ProcessingResult{
		Filepath:  filepath,
		Timestamp: time.Now(),
		Status:    "processing",
	}

	// Determine file type and extract content
	content, fileType, err := p.extractContent(filepath)
	if err != nil {
		result.Status = "error"
		result.Error = err.Error()
		log.Printf("Failed to extract content from %s: %v", filepath, err)
		return err
	}

	result.Type = fileType
	result.Content = content

	// Process with LLM
	llmResult, err := p.processWithLLM(content, fileType)
	if err != nil {
		result.Status = "error"
		result.Error = err.Error()
		log.Printf("Failed to process with LLM: %v", err)
		return err
	}

	// Update result with LLM output
	result.Summary = llmResult.Summary
	result.ActionItems = llmResult.ActionItems
	result.Compliance = llmResult.Compliance
	result.Status = "completed"

	// TODO: Send result to UI for approval/rejection
	// For now, automatically approve and write to Obsidian
	if err := p.obsidian.WriteNote(result); err != nil {
		log.Printf("Failed to write note to Obsidian: %v", err)
		return err
	}

	log.Printf("Successfully processed file: %s", filepath)
	return nil
}

// extractContent extracts content from different file types
func (p *Processor) extractContent(filepath string) (string, string, error) {
	ext := strings.ToLower(filepath.Ext(filepath))
	fileName := strings.ToLower(filepath.Base(filepath))

	switch {
	case strings.HasSuffix(ext, ".mp4"):
		if !p.config.Processing.EnableVideoProcessing {
			return "", "", fmt.Errorf("video processing is disabled")
		}
		return p.extractVideoContent(filepath)

	case strings.HasSuffix(ext, ".wav"):
		if !p.config.Processing.EnableAudioProcessing {
			return "", "", fmt.Errorf("audio processing is disabled")
		}
		return p.extractAudioContent(filepath)

	case strings.HasSuffix(ext, ".txt"):
		if !p.config.Processing.EnableTextProcessing {
			return "", "", fmt.Errorf("text processing is disabled")
		}
		return p.extractTextContent(filepath)

	case strings.HasSuffix(ext, ".json"):
		return p.extractJSONContent(filepath)

	case strings.HasSuffix(ext, ".png") || strings.HasSuffix(ext, ".jpg") || strings.HasSuffix(ext, ".jpeg"):
		return p.extractImageContent(filepath)

	default:
		return "", "", fmt.Errorf("unsupported file type: %s", ext)
	}
}

// extractVideoContent extracts content from video files
func (p *Processor) extractVideoContent(filepath string) (string, string, error) {
	// TODO: Implement video content extraction
	// This could involve:
	// - Extracting frames for OCR
	// - Using video analysis APIs
	// - Extracting metadata
	
	fileName := filepath.Base(filepath)
	return fmt.Sprintf("Video file: %s\nType: Screen recording\nDuration: Unknown\n", fileName), "video", nil
}

// extractAudioContent extracts content from audio files
func (p *Processor) extractAudioContent(filepath string) (string, string, error) {
	// TODO: Implement audio content extraction
	// This could involve:
	// - Speech-to-text transcription
	// - Audio analysis
	// - Speaker identification
	
	fileName := filepath.Base(filepath)
	return fmt.Sprintf("Audio file: %s\nType: Audio recording\nDuration: Unknown\n", fileName), "audio", nil
}

// extractTextContent extracts content from text files
func (p *Processor) extractTextContent(filepath string) (string, string, error) {
	// TODO: Implement text content extraction
	// This could involve:
	// - Reading file content
	// - Parsing structured data
	// - Extracting key information
	
	fileName := filepath.Base(filepath)
	return fmt.Sprintf("Text file: %s\nContent: [Text content would be extracted here]\n", fileName), "text", nil
}

// extractJSONContent extracts content from JSON files
func (p *Processor) extractJSONContent(filepath string) (string, string, error) {
	// TODO: Implement JSON content extraction
	// This could involve:
	// - Parsing JSON structure
	// - Extracting relevant fields
	// - Formatting for LLM consumption
	
	fileName := filepath.Base(filepath)
	return fmt.Sprintf("JSON file: %s\nContent: [JSON content would be parsed here]\n", fileName), "json", nil
}

// extractImageContent extracts content from image files
func (p *Processor) extractImageContent(filepath string) (string, string, error) {
	// TODO: Implement image content extraction
	// This could involve:
	// - OCR text extraction
	// - Image analysis
	// - Screenshot content description
	
	fileName := filepath.Base(filepath)
	return fmt.Sprintf("Image file: %s\nType: Screenshot\nContent: [Image content would be analyzed here]\n", fileName), "image", nil
}

// processWithLLM sends content to LLM for processing
func (p *Processor) processWithLLM(content, fileType string) (*llm.Result, error) {
	// Create prompt based on file type
	prompt := p.createPrompt(content, fileType)

	// Send to LLM
	result, err := p.llm.Process(prompt)
	if err != nil {
		return nil, fmt.Errorf("LLM processing failed: %w", err)
	}

	return result, nil
}

// createPrompt creates an appropriate prompt for the LLM based on file type
func (p *Processor) createPrompt(content, fileType string) string {
	basePrompt := `You are an intelligent assistant analyzing ScreenPipe data. 

Please analyze the following content and provide:
1. A concise summary (2-3 sentences)
2. Action items or tasks that should be done
3. Any compliance or doctrine-related notes

Content type: %s
Content: %s

Please format your response as JSON with the following structure:
{
  "summary": "Brief summary of the content",
  "action_items": ["Action 1", "Action 2", "Action 3"],
  "compliance": ["Compliance note 1", "Compliance note 2"]
}`

	return fmt.Sprintf(basePrompt, fileType, content)
}

// GetStats returns processing statistics
func (p *Processor) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"llm_provider": p.config.LLM.Provider,
		"is_running":   p.ctx.Err() == nil,
	}
}

// Stop stops the processor
func (p *Processor) Stop() {
	p.cancel()
} 