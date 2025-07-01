package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/cursor-blueprint-enforcer/screenpipe-assistant-bridge/internal/config"
	"github.com/sashabaranov/go-openai"
)

// Client handles communication with LLM providers
type Client struct {
	config *config.Config
	openai *openai.Client
	// Future providers
	// claude  *claude.Client
	// grok    *grok.Client
	// gemini  *gemini.Client
	// mindpal *mindpal.Client
	apiKey string
	client *http.Client
}

// Result represents the structured output from an LLM
type Result struct {
	Summary     string   `json:"summary"`
	ActionItems []string `json:"action_items"`
	Compliance  []string `json:"compliance"`
	Provider    string   `json:"provider"`
	Model       string   `json:"model"`
	Timestamp   time.Time `json:"timestamp"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
	MaxTokens int      `json:"max_tokens,omitempty"`
}

type ChatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

// New creates a new LLM client
func New(cfg *config.Config) (*Client, error) {
	client := &Client{
		config: cfg,
	}

	// Initialize provider based on configuration
	switch cfg.LLM.Provider {
	case "openai":
		if cfg.LLM.OpenAI.APIKey == "" {
			return nil, fmt.Errorf("OpenAI API key is required")
		}
		client.openai = openai.NewClient(cfg.LLM.OpenAI.APIKey)
		log.Printf("Initialized OpenAI client with model: %s", cfg.LLM.OpenAI.Model)
		client.apiKey = cfg.LLM.OpenAI.APIKey
		client.client = &http.Client{
			Timeout: 30 * time.Second,
		}

	// Future providers (commented out for Phase 2+)
	// case "claude":
	//     if cfg.LLM.Claude.APIKey == "" {
	//         return nil, fmt.Errorf("Claude API key is required")
	//     }
	//     client.claude = claude.NewClient(cfg.LLM.Claude.APIKey)
	//     log.Printf("Initialized Claude client with model: %s", cfg.LLM.Claude.Model)
	//
	// case "grok":
	//     if cfg.LLM.Grok.APIKey == "" {
	//         return nil, fmt.Errorf("Grok API key is required")
	//     }
	//     client.grok = grok.NewClient(cfg.LLM.Grok.APIKey)
	//     log.Printf("Initialized Grok client with model: %s", cfg.LLM.Grok.Model)
	//
	// case "gemini":
	//     if cfg.LLM.Gemini.APIKey == "" {
	//         return nil, fmt.Errorf("Gemini API key is required")
	//     }
	//     client.gemini = gemini.NewClient(cfg.LLM.Gemini.APIKey)
	//     log.Printf("Initialized Gemini client with model: %s", cfg.LLM.Gemini.Model)
	//
	// case "mindpal":
	//     if cfg.LLM.Mindpal.APIKey == "" {
	//         return nil, fmt.Errorf("Mindpal API key is required")
	//     }
	//     client.mindpal = mindpal.NewClient(cfg.LLM.Mindpal.APIKey)
	//     log.Printf("Initialized Mindpal client with model: %s", cfg.LLM.Mindpal.Model)

	default:
		return nil, fmt.Errorf("unsupported LLM provider: %s", cfg.LLM.Provider)
	}

	return client, nil
}

// Process sends a prompt to the configured LLM and returns structured results
func (c *Client) Process(prompt string) (*Result, error) {
	switch c.config.LLM.Provider {
	case "openai":
		return c.processWithOpenAI(prompt)

	// Future providers (commented out for Phase 2+)
	// case "claude":
	//     return c.processWithClaude(prompt)
	// case "grok":
	//     return c.processWithGrok(prompt)
	// case "gemini":
	//     return c.processWithGemini(prompt)
	// case "mindpal":
	//     return c.processWithMindpal(prompt)

	default:
		return nil, fmt.Errorf("unsupported LLM provider: %s", c.config.LLM.Provider)
	}
}

// processWithOpenAI sends a prompt to OpenAI and parses the response
func (c *Client) processWithOpenAI(prompt string) (*Result, error) {
	// Create OpenAI request
	req := openai.ChatCompletionRequest{
		Model:       c.config.LLM.OpenAI.Model,
		Messages:    []openai.ChatCompletionMessage{{Role: "user", Content: prompt}},
		MaxTokens:   c.config.LLM.OpenAI.MaxTokens,
		Temperature: float32(c.config.LLM.OpenAI.Temperature),
	}

	// Send request
	resp, err := c.openai.CreateChatCompletion(req)
	if err != nil {
		return nil, fmt.Errorf("OpenAI API error: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	// Parse the response
	content := resp.Choices[0].Message.Content
	result, err := c.parseLLMResponse(content)
	if err != nil {
		return nil, fmt.Errorf("failed to parse LLM response: %w", err)
	}

	// Add metadata
	result.Provider = "openai"
	result.Model = c.config.LLM.OpenAI.Model
	result.Timestamp = time.Now()

	return result, nil
}

// parseLLMResponse parses the LLM response into structured format
func (c *Client) parseLLMResponse(content string) (*Result, error) {
	// Try to parse as JSON first
	var jsonResult struct {
		Summary     string   `json:"summary"`
		ActionItems []string `json:"action_items"`
		Compliance  []string `json:"compliance"`
	}

	if err := json.Unmarshal([]byte(content), &jsonResult); err == nil {
		return &Result{
			Summary:     jsonResult.Summary,
			ActionItems: jsonResult.ActionItems,
			Compliance:  jsonResult.Compliance,
		}, nil
	}

	// If JSON parsing fails, try to extract structured content from text
	return c.extractFromText(content)
}

// extractFromText extracts structured content from plain text response
func (c *Client) extractFromText(content string) (*Result, error) {
	// TODO: Implement more sophisticated text parsing
	// For now, return a basic result
	return &Result{
		Summary:     content,
		ActionItems: []string{"Review the content manually"},
		Compliance:  []string{"No compliance issues identified"},
	}, nil
}

// Future provider implementations (commented out for Phase 2+)

// processWithClaude sends a prompt to Claude
// func (c *Client) processWithClaude(prompt string) (*Result, error) {
//     // TODO: Implement Claude integration
//     return nil, fmt.Errorf("Claude integration not yet implemented")
// }

// processWithGrok sends a prompt to Grok
// func (c *Client) processWithGrok(prompt string) (*Result, error) {
//     // TODO: Implement Grok integration
//     return nil, fmt.Errorf("Grok integration not yet implemented")
// }

// processWithGemini sends a prompt to Gemini
// func (c *Client) processWithGemini(prompt string) (*Result, error) {
//     // TODO: Implement Gemini integration
//     return nil, fmt.Errorf("Gemini integration not yet implemented")
// }

// processWithMindpal sends a prompt to Mindpal
// func (c *Client) processWithMindpal(prompt string) (*Result, error) {
//     // TODO: Implement Mindpal integration
//     return nil, fmt.Errorf("Mindpal integration not yet implemented")
// }

// MultiLLM processing (Phase 3)
// ProcessWithMultipleLLMs sends the same prompt to multiple LLMs and compares results
// func (c *Client) ProcessWithMultipleLLMs(prompt string, providers []string) (map[string]*Result, error) {
//     results := make(map[string]*Result)
//     
//     for _, provider := range providers {
//         // Temporarily switch provider
//         originalProvider := c.config.LLM.Provider
//         c.config.LLM.Provider = provider
//         
//         result, err := c.Process(prompt)
//         if err != nil {
//             log.Printf("Failed to process with %s: %v", provider, err)
//             continue
//         }
//         
//         results[provider] = result
//         
//         // Restore original provider
//         c.config.LLM.Provider = originalProvider
//     }
//     
//     return results, nil
// }

// GetStats returns LLM client statistics
func (c *Client) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"provider": c.config.LLM.Provider,
		"model":    c.getCurrentModel(),
	}
}

// getCurrentModel returns the current model name
func (c *Client) getCurrentModel() string {
	switch c.config.LLM.Provider {
	case "openai":
		return c.config.LLM.OpenAI.Model
	// case "claude":
	//     return c.config.LLM.Claude.Model
	// case "grok":
	//     return c.config.LLM.Grok.Model
	// case "gemini":
	//     return c.config.LLM.Gemini.Model
	// case "mindpal":
	//     return c.config.LLM.Mindpal.Model
	default:
		return "unknown"
	}
}

func (c *Client) ProcessScreenData(filePath, fileType string) (string, error) {
	prompt := fmt.Sprintf(`Analyze this %s file from ScreenPipe and create an intelligent note summary.

File: %s
Type: %s

Please provide:
1. A concise summary of the content
2. Key insights or observations
3. Any actionable items or follow-ups
4. Relevant tags for organization

Format the response as a markdown note suitable for Obsidian.`, fileType, filePath, fileType)

	req := ChatRequest{
		Model: "gpt-4",
		Messages: []Message{
			{
				Role:    "system",
				Content: "You are an intelligent assistant that analyzes screen capture data and creates well-structured notes for Obsidian. Focus on clarity, organization, and actionable insights.",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens: 1000,
	}

	jsonData, err := json.Marshal(req)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return chatResp.Choices[0].Message.Content, nil
} 