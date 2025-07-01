package obsidian

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"screenpipe-obsidian-bridge/internal/config"
	"screenpipe-obsidian-bridge/internal/llm"
)

// Writer handles creating Obsidian-compatible markdown files
type Writer struct {
	config *config.ObsidianConfig
}

// New creates a new Obsidian writer
func New(cfg *config.ObsidianConfig) *Writer {
	return &Writer{
		config: cfg,
	}
}

// WriteNote creates an Obsidian note from processing results
func (w *Writer) WriteNote(result *llm.ProcessingResult) error {
	// Ensure the notes directory exists
	notesPath := filepath.Join(w.config.VaultPath, w.config.NotesSubdirectory)
	if err := os.MkdirAll(notesPath, 0755); err != nil {
		return fmt.Errorf("failed to create notes directory %s: %w", notesPath, err)
	}

	// Generate filename
	filename, err := w.generateFilename(result)
	if err != nil {
		return fmt.Errorf("failed to generate filename: %w", err)
	}

	fullPath := filepath.Join(notesPath, filename)

	// Generate markdown content
	content := w.generateMarkdownContent(result)

	// Write the file
	if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write note to %s: %w", fullPath, err)
	}

	fmt.Printf("✅ Created Obsidian note: %s\n", fullPath)
	return nil
}

// generateFilename creates a filename based on the template
func (w *Writer) generateFilename(result *llm.ProcessingResult) (string, error) {
	template := w.config.FilenameTemplate
	
	// Parse timestamp
	processedTime, err := time.Parse(time.RFC3339, result.Metadata.ProcessedAt)
	if err != nil {
		processedTime = time.Now()
	}

	// Create a simple hash from the source file
	hash := generateSimpleHash(result.Metadata.SourceFile)

	// Replace template variables
	filename := template
	filename = strings.ReplaceAll(filename, "{{.Timestamp}}", processedTime.Format("2006-01-02-15-04-05"))
	filename = strings.ReplaceAll(filename, "{{.Hash}}", hash)
	filename = strings.ReplaceAll(filename, "{{.Date}}", processedTime.Format("2006-01-02"))
	filename = strings.ReplaceAll(filename, "{{.Time}}", processedTime.Format("15-04-05"))

	// Ensure .md extension
	if !strings.HasSuffix(filename, ".md") {
		filename += ".md"
	}

	return filename, nil
}

// generateMarkdownContent creates the full markdown content with frontmatter
func (w *Writer) generateMarkdownContent(result *llm.ProcessingResult) string {
	var content strings.Builder

	// Write frontmatter
	content.WriteString("---\n")
	content.WriteString(fmt.Sprintf("title: \"ScreenPipe Analysis - %s\"\n", 
		time.Now().Format("2006-01-02 15:04")))
	content.WriteString(fmt.Sprintf("created: %s\n", result.Metadata.ProcessedAt))
	content.WriteString(fmt.Sprintf("source_file: \"%s\"\n", result.Metadata.SourceFile))
	content.WriteString(fmt.Sprintf("llm_model: \"%s\"\n", result.Metadata.Model))
	content.WriteString(fmt.Sprintf("llm_provider: \"%s\"\n", result.Metadata.Provider))
	content.WriteString(fmt.Sprintf("compliance_score: %d\n", result.DoctrineCompliance.ComplianceScore))
	content.WriteString("tags:\n")
	content.WriteString("  - screenpipe\n")
	content.WriteString("  - automated\n")
	content.WriteString("  - analysis\n")
	
	// Add compliance tag if not compliant
	if !result.DoctrineCompliance.NamingConventionCompliant {
		content.WriteString("  - compliance-issues\n")
	}
	
	content.WriteString("---\n\n")

	// Write main content
	content.WriteString("# ScreenPipe Activity Analysis\n\n")

	// Activity Summary
	content.WriteString("## 📋 Activity Summary\n\n")
	content.WriteString(result.ActivitySummary)
	content.WriteString("\n\n")

	// Actionable Tasks
	if len(result.ActionableTasks) > 0 {
		content.WriteString("## ✅ Actionable Tasks\n\n")
		for _, task := range result.ActionableTasks {
			content.WriteString(fmt.Sprintf("- [ ] %s\n", task))
		}
		content.WriteString("\n")
	}

	// Doctrine Compliance
	content.WriteString("## 🔍 Doctrine Compliance Check\n\n")
	content.WriteString(fmt.Sprintf("**Compliance Score:** %d/100\n\n", 
		result.DoctrineCompliance.ComplianceScore))
	
	if result.DoctrineCompliance.NamingConventionCompliant {
		content.WriteString("✅ **Naming Convention:** Compliant\n\n")
	} else {
		content.WriteString("❌ **Naming Convention:** Non-compliant\n\n")
	}

	// Issues
	if len(result.DoctrineCompliance.Issues) > 0 {
		content.WriteString("### Issues Found\n\n")
		for _, issue := range result.DoctrineCompliance.Issues {
			content.WriteString(fmt.Sprintf("- ⚠️ %s\n", issue))
		}
		content.WriteString("\n")
	}

	// Suggestions
	if len(result.DoctrineCompliance.Suggestions) > 0 {
		content.WriteString("### Suggestions\n\n")
		for _, suggestion := range result.DoctrineCompliance.Suggestions {
			content.WriteString(fmt.Sprintf("- 💡 %s\n", suggestion))
		}
		content.WriteString("\n")
	}

	// Metadata
	content.WriteString("## 📊 Processing Metadata\n\n")
	content.WriteString(fmt.Sprintf("- **Source File:** `%s`\n", result.Metadata.SourceFile))
	content.WriteString(fmt.Sprintf("- **Processed At:** %s\n", result.Metadata.ProcessedAt))
	content.WriteString(fmt.Sprintf("- **LLM Provider:** %s\n", result.Metadata.Provider))
	content.WriteString(fmt.Sprintf("- **Model:** %s\n", result.Metadata.Model))
	content.WriteString(fmt.Sprintf("- **Total Tokens:** %d\n", result.Metadata.TokenUsage.TotalTokens))
	content.WriteString(fmt.Sprintf("- **Prompt Tokens:** %d\n", result.Metadata.TokenUsage.PromptTokens))
	content.WriteString(fmt.Sprintf("- **Completion Tokens:** %d\n", result.Metadata.TokenUsage.CompletionTokens))

	// Footer
	content.WriteString("\n\n---\n")
	content.WriteString("*This note was automatically generated by ScreenPipe Obsidian Bridge*\n")

	return content.String()
}

// generateSimpleHash creates a simple hash from a string
func generateSimpleHash(input string) string {
	// Simple hash implementation - in production you might want crypto/md5 or similar
	hash := uint32(0)
	for _, char := range input {
		hash = hash*31 + uint32(char)
	}
	return fmt.Sprintf("%08x", hash)[:8] // Return first 8 characters
}

// ValidateVaultPath checks if the Obsidian vault path is valid
func (w *Writer) ValidateVaultPath() error {
	vaultPath := w.config.VaultPath
	
	// Check if vault directory exists
	if _, err := os.Stat(vaultPath); os.IsNotExist(err) {
		return fmt.Errorf("obsidian vault path does not exist: %s", vaultPath)
	}

	// Check if it looks like an Obsidian vault (has .obsidian directory)
	obsidianDir := filepath.Join(vaultPath, ".obsidian")
	if _, err := os.Stat(obsidianDir); os.IsNotExist(err) {
		fmt.Printf("Warning: %s doesn't appear to be an Obsidian vault (missing .obsidian directory)\n", vaultPath)
	}

	return nil
}

// CreateVaultStructure creates the necessary directory structure in the vault
func (w *Writer) CreateVaultStructure() error {
	notesPath := filepath.Join(w.config.VaultPath, w.config.NotesSubdirectory)
	
	if err := os.MkdirAll(notesPath, 0755); err != nil {
		return fmt.Errorf("failed to create notes directory structure: %w", err)
	}

	// Create a basic index file if it doesn't exist
	indexPath := filepath.Join(notesPath, "README.md")
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		indexContent := `# ScreenPipe Analysis Notes

This directory contains automatically generated analysis notes from ScreenPipe.

## Overview

These notes are created by the ScreenPipe Obsidian Bridge and contain:
- Activity summaries from screen recordings
- Extracted actionable tasks
- Doctrine compliance analysis
- Processing metadata

## Tags

- #screenpipe - All ScreenPipe generated notes
- #automated - Automatically generated content
- #analysis - Analysis and insights
- #compliance-issues - Notes with compliance issues found

Generated by ScreenPipe Obsidian Bridge
`
		if err := os.WriteFile(indexPath, []byte(indexContent), 0644); err != nil {
			return fmt.Errorf("failed to create index file: %w", err)
		}
	}

	return nil
} 