package llm

import (
	"context"
)

// Client represents an LLM client interface
type Client interface {
	// ProcessContent sends content to the LLM and returns structured analysis
	ProcessContent(ctx context.Context, content string, sourceFile string) (*ProcessingResult, error)
	// GetProvider returns the name of the LLM provider
	GetProvider() string
}

// ProcessingResult contains the structured output from LLM processing
type ProcessingResult struct {
	// Summary of the activity/content
	ActivitySummary string `json:"activity_summary"`
	
	// List of actionable tasks extracted from the content
	ActionableTasks []string `json:"actionable_tasks"`
	
	// Doctrine compliance check results
	DoctrineCompliance DoctrineCheck `json:"doctrine_compliance"`
	
	// Metadata about the processing
	Metadata ProcessingMetadata `json:"metadata"`
}

// DoctrineCheck contains compliance analysis
type DoctrineCheck struct {
	// Whether the content appears to follow naming conventions
	NamingConventionCompliant bool `json:"naming_convention_compliant"`
	
	// Issues found during compliance check
	Issues []string `json:"issues"`
	
	// Suggestions for improvement
	Suggestions []string `json:"suggestions"`
	
	// Overall compliance score (0-100)
	ComplianceScore int `json:"compliance_score"`
}

// ProcessingMetadata contains information about the processing
type ProcessingMetadata struct {
	// Model used for processing
	Model string `json:"model"`
	
	// Provider that processed the content
	Provider string `json:"provider"`
	
	// Processing timestamp
	ProcessedAt string `json:"processed_at"`
	
	// Source file that was processed
	SourceFile string `json:"source_file"`
	
	// Token usage information
	TokenUsage TokenUsage `json:"token_usage"`
}

// TokenUsage tracks token consumption
type TokenUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// PromptTemplates contains the system prompts for different tasks
type PromptTemplates struct {
	ActivityAnalysis   string
	TaskExtraction     string
	DoctrineCompliance string
}

// DefaultPromptTemplates returns the default prompts used for processing
func DefaultPromptTemplates() PromptTemplates {
	return PromptTemplates{
		ActivityAnalysis: `Analyze the following ScreenPipe content and provide a concise activity summary.
Focus on what the user was doing, key applications used, and important events.
Keep the summary under 200 words and make it actionable.

Content:
%s

Provide a structured summary focusing on productivity insights.`,

		TaskExtraction: `Extract actionable tasks from the following ScreenPipe content.
Look for:
- Explicit TODO items or tasks mentioned
- Implied next steps from conversations or activities
- Follow-up actions needed
- Deadlines or time-sensitive items

Content:
%s

Return a list of specific, actionable tasks. Each task should be clear and executable.`,

		DoctrineCompliance: `Analyze the following content for compliance with naming conventions and best practices.
Check for:
- Proper file naming conventions
- Code structure and organization
- Documentation standards
- Consistent terminology usage

Content:
%s

Provide a compliance analysis with specific issues found and suggestions for improvement.
Rate compliance on a scale of 0-100.`,
	}
} 