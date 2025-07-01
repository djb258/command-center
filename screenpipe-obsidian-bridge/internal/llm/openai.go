package llm

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/sashabaranov/go-openai"
	"screenpipe-obsidian-bridge/internal/config"
)

// OpenAIClient implements the Client interface for OpenAI
type OpenAIClient struct {
	client    *openai.Client
	config    *config.LLMConfig
	templates PromptTemplates
}

// NewOpenAIClient creates a new OpenAI client
func NewOpenAIClient(cfg *config.LLMConfig) *OpenAIClient {
	client := openai.NewClient(cfg.APIKey)
	
	// Set custom base URL if provided
	if cfg.Endpoint != "" && cfg.Endpoint != "https://api.openai.com/v1" {
		config := openai.DefaultConfig(cfg.APIKey)
		config.BaseURL = cfg.Endpoint
		client = openai.NewClientWithConfig(config)
	}

	return &OpenAIClient{
		client:    client,
		config:    cfg,
		templates: DefaultPromptTemplates(),
	}
}

// ProcessContent implements Client.ProcessContent
func (c *OpenAIClient) ProcessContent(ctx context.Context, content string, sourceFile string) (*ProcessingResult, error) {
	// TODO: In a production version, we might want to process these in parallel
	// For now, we'll do them sequentially to stay within rate limits
	
	activitySummary, tokenUsage1, err := c.generateActivitySummary(ctx, content)
	if err != nil {
		return nil, fmt.Errorf("failed to generate activity summary: %w", err)
	}

	actionableTasks, tokenUsage2, err := c.extractActionableTasks(ctx, content)
	if err != nil {
		return nil, fmt.Errorf("failed to extract actionable tasks: %w", err)
	}

	doctrineCheck, tokenUsage3, err := c.checkDoctrineCompliance(ctx, content)
	if err != nil {
		return nil, fmt.Errorf("failed to check doctrine compliance: %w", err)
	}

	// Combine token usage
	totalTokenUsage := TokenUsage{
		PromptTokens:     tokenUsage1.PromptTokens + tokenUsage2.PromptTokens + tokenUsage3.PromptTokens,
		CompletionTokens: tokenUsage1.CompletionTokens + tokenUsage2.CompletionTokens + tokenUsage3.CompletionTokens,
		TotalTokens:      tokenUsage1.TotalTokens + tokenUsage2.TotalTokens + tokenUsage3.TotalTokens,
	}

	result := &ProcessingResult{
		ActivitySummary:    activitySummary,
		ActionableTasks:    actionableTasks,
		DoctrineCompliance: *doctrineCheck,
		Metadata: ProcessingMetadata{
			Model:       c.config.Model,
			Provider:    c.GetProvider(),
			ProcessedAt: time.Now().UTC().Format(time.RFC3339),
			SourceFile:  sourceFile,
			TokenUsage:  totalTokenUsage,
		},
	}

	return result, nil
}

// GetProvider implements Client.GetProvider
func (c *OpenAIClient) GetProvider() string {
	return "openai"
}

// generateActivitySummary creates a summary of the user's activity
func (c *OpenAIClient) generateActivitySummary(ctx context.Context, content string) (string, TokenUsage, error) {
	prompt := fmt.Sprintf(c.templates.ActivityAnalysis, content)
	
	response, err := c.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: c.config.Model,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
		MaxTokens:   c.config.MaxTokens / 3, // Divide tokens among the three calls
		Temperature: c.config.Temperature,
	})

	if err != nil {
		return "", TokenUsage{}, err
	}

	tokenUsage := TokenUsage{
		PromptTokens:     response.Usage.PromptTokens,
		CompletionTokens: response.Usage.CompletionTokens,
		TotalTokens:      response.Usage.TotalTokens,
	}

	if len(response.Choices) == 0 {
		return "", tokenUsage, fmt.Errorf("no response choices returned")
	}

	return response.Choices[0].Message.Content, tokenUsage, nil
}

// extractActionableTasks extracts tasks from the content
func (c *OpenAIClient) extractActionableTasks(ctx context.Context, content string) ([]string, TokenUsage, error) {
	prompt := fmt.Sprintf(c.templates.TaskExtraction, content)
	
	response, err := c.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: c.config.Model,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
		MaxTokens:   c.config.MaxTokens / 3,
		Temperature: c.config.Temperature,
	})

	if err != nil {
		return nil, TokenUsage{}, err
	}

	tokenUsage := TokenUsage{
		PromptTokens:     response.Usage.PromptTokens,
		CompletionTokens: response.Usage.CompletionTokens,
		TotalTokens:      response.Usage.TotalTokens,
	}

	if len(response.Choices) == 0 {
		return nil, tokenUsage, fmt.Errorf("no response choices returned")
	}

	// TODO: Parse the response more intelligently
	// For now, we'll split by lines and clean up
	content = response.Choices[0].Message.Content
	tasks := parseTaskList(content)

	return tasks, tokenUsage, nil
}

// checkDoctrineCompliance analyzes content for compliance
func (c *OpenAIClient) checkDoctrineCompliance(ctx context.Context, content string) (*DoctrineCheck, TokenUsage, error) {
	prompt := fmt.Sprintf(c.templates.DoctrineCompliance, content)
	
	response, err := c.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: c.config.Model,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt + "\n\nPlease respond in JSON format with fields: naming_convention_compliant (boolean), issues (array), suggestions (array), compliance_score (integer 0-100).",
			},
		},
		MaxTokens:   c.config.MaxTokens / 3,
		Temperature: 0.1, // Lower temperature for more consistent JSON output
	})

	if err != nil {
		return nil, TokenUsage{}, err
	}

	tokenUsage := TokenUsage{
		PromptTokens:     response.Usage.PromptTokens,
		CompletionTokens: response.Usage.CompletionTokens,
		TotalTokens:      response.Usage.TotalTokens,
	}

	if len(response.Choices) == 0 {
		return nil, tokenUsage, fmt.Errorf("no response choices returned")
	}

	// Try to parse JSON response
	var doctrineCheck DoctrineCheck
	responseContent := response.Choices[0].Message.Content
	
	if err := json.Unmarshal([]byte(responseContent), &doctrineCheck); err != nil {
		// Fallback to default if JSON parsing fails
		doctrineCheck = DoctrineCheck{
			NamingConventionCompliant: true, // Default to compliant
			Issues:                   []string{},
			Suggestions:              []string{"Unable to parse compliance check response"},
			ComplianceScore:          50, // Neutral score
		}
	}

	return &doctrineCheck, tokenUsage, nil
}

// parseTaskList extracts tasks from LLM response
func parseTaskList(content string) []string {
	// TODO: Implement more sophisticated parsing
	// For now, just split by lines and filter out empty ones
	lines := []string{}
	for _, line := range splitLines(content) {
		line = trimSpace(line)
		if line != "" && len(line) > 5 { // Basic filtering
			// Remove common list markers
			if len(line) > 2 && (line[0] == '-' || line[0] == '*' || line[1] == '.') {
				line = trimSpace(line[2:])
			}
			lines = append(lines, line)
		}
	}
	return lines
}

// Helper functions (simplified implementations)
func splitLines(s string) []string {
	// Simple line splitting - in production you might want to use strings.Split
	result := []string{}
	current := ""
	for _, char := range s {
		if char == '\n' {
			result = append(result, current)
			current = ""
		} else {
			current += string(char)
		}
	}
	if current != "" {
		result = append(result, current)
	}
	return result
}

func trimSpace(s string) string {
	// Simple trim implementation
	start := 0
	end := len(s)
	
	for start < end && (s[start] == ' ' || s[start] == '\t' || s[start] == '\n' || s[start] == '\r') {
		start++
	}
	
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t' || s[end-1] == '\n' || s[end-1] == '\r') {
		end--
	}
	
	return s[start:end]
} 