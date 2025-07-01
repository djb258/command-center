package obsidian

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"text/template"
	"time"

	"github.com/cursor-blueprint-enforcer/screenpipe-assistant-bridge/internal/config"
	"github.com/cursor-blueprint-enforcer/screenpipe-assistant-bridge/internal/processor"
)

// Writer handles writing notes to Obsidian vault
type Writer struct {
	config      *config.Config
	noteTemplate *template.Template
	vaultPath   string
}

// New creates a new Obsidian writer
func New(cfg *config.Config) (*Writer, error) {
	if cfg.Obsidian.VaultPath == "" {
		// Default to a common Obsidian vault location
		cfg.Obsidian.VaultPath = os.ExpandEnv("$USERPROFILE/Documents/Obsidian Vault")
	}

	// Create vault directory if it doesn't exist
	if err := os.MkdirAll(cfg.Obsidian.VaultPath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create vault directory: %w", err)
	}

	// Create folder directory if specified
	if cfg.Obsidian.Folder != "" {
		folderPath := filepath.Join(cfg.Obsidian.VaultPath, cfg.Obsidian.Folder)
		if err := os.MkdirAll(folderPath, 0755); err != nil {
			return nil, fmt.Errorf("failed to create Obsidian folder: %w", err)
		}
	}

	// Load note template
	tmpl, err := loadNoteTemplate(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to load note template: %w", err)
	}

	return &Writer{
		config:      cfg,
		noteTemplate: tmpl,
		vaultPath:   cfg.Obsidian.VaultPath,
	}, nil
}

// WriteNote writes a processing result to Obsidian as a Markdown note
func (w *Writer) WriteNote(result *processor.ProcessingResult) error {
	// Generate note content
	content, err := w.generateNoteContent(result)
	if err != nil {
		return fmt.Errorf("failed to generate note content: %w", err)
	}

	// Generate filename
	filename := w.generateFilename(result)

	// Determine file path
	var filePath string
	if w.config.Obsidian.Folder != "" {
		filePath = filepath.Join(w.config.Obsidian.VaultPath, w.config.Obsidian.Folder, filename)
	} else {
		filePath = filepath.Join(w.config.Obsidian.VaultPath, filename)
	}

	// Write file
	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write note file: %w", err)
	}

	log.Printf("Wrote Obsidian note: %s", filePath)
	return nil
}

// generateNoteContent creates the Markdown content for the note
func (w *Writer) generateNoteContent(result *processor.ProcessingResult) (string, error) {
	// Prepare template data
	data := struct {
		Title       string
		Timestamp   time.Time
		Filepath    string
		Type        string
		Content     string
		Summary     string
		ActionItems []string
		Compliance  []string
		Tags        []string
	}{
		Title:       w.generateTitle(result),
		Timestamp:   result.Timestamp,
		Filepath:    result.Filepath,
		Type:        result.Type,
		Content:     result.Content,
		Summary:     result.Summary,
		ActionItems: result.ActionItems,
		Compliance:  result.Compliance,
		Tags:        w.generateTags(result),
	}

	// Execute template
	var buf strings.Builder
	if err := w.noteTemplate.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return buf.String(), nil
}

// generateTitle creates a title for the note
func (w *Writer) generateTitle(result *processor.ProcessingResult) string {
	baseName := filepath.Base(result.Filepath)
	ext := filepath.Ext(baseName)
	name := strings.TrimSuffix(baseName, ext)
	
	// Format timestamp
	timestamp := result.Timestamp.Format("2006-01-02 15:04:05")
	
	return fmt.Sprintf("ScreenPipe %s - %s", strings.Title(result.Type), timestamp)
}

// generateFilename creates a filename for the note
func (w *Writer) generateFilename(result *processor.ProcessingResult) string {
	// Use timestamp for unique filename
	timestamp := result.Timestamp.Format("20060102-150405")
	baseName := filepath.Base(result.Filepath)
	ext := filepath.Ext(baseName)
	name := strings.TrimSuffix(baseName, ext)
	
	// Clean filename
	cleanName := strings.ReplaceAll(name, " ", "_")
	cleanName = strings.ReplaceAll(cleanName, "(", "")
	cleanName = strings.ReplaceAll(cleanName, ")", "")
	
	return fmt.Sprintf("%s_%s_%s.md", timestamp, result.Type, cleanName)
}

// generateTags creates tags for the note
func (w *Writer) generateTags(result *processor.ProcessingResult) []string {
	tags := []string{
		fmt.Sprintf("#%s", w.config.Obsidian.TagPrefix),
		fmt.Sprintf("#%s-%s", w.config.Obsidian.TagPrefix, result.Type),
	}

	// Add tags based on content type
	switch result.Type {
	case "video":
		tags = append(tags, "#screen-recording")
	case "audio":
		tags = append(tags, "#audio-recording")
	case "text":
		tags = append(tags, "#text-content")
	case "image":
		tags = append(tags, "#screenshot")
	case "json":
		tags = append(tags, "#data")
	}

	// Add tags for action items
	if len(result.ActionItems) > 0 {
		tags = append(tags, "#action-items")
	}

	// Add tags for compliance
	if len(result.Compliance) > 0 {
		tags = append(tags, "#compliance")
	}

	return tags
}

// loadNoteTemplate loads the note template from file or uses default
func loadNoteTemplate(cfg *config.Config) (*template.Template, error) {
	// Try to load from template file
	if cfg.Obsidian.TemplatePath != "" {
		if content, err := os.ReadFile(cfg.Obsidian.TemplatePath); err == nil {
			return template.New("note").Parse(string(content))
		}
		log.Printf("Failed to load template file %s, using default template", cfg.Obsidian.TemplatePath)
	}

	// Use default template
	return template.New("note").Parse(defaultNoteTemplate)
}

// defaultNoteTemplate is the default Markdown template for notes
const defaultNoteTemplate = `# {{.Title}}

**Generated:** {{.Timestamp.Format "2006-01-02 15:04:05"}}  
**Source:** {{.Filepath}}  
**Type:** {{.Type}}

{{range .Tags}}{{.}} {{end}}

## Summary

{{.Summary}}

## Content

\`\`\`
{{.Content}}
\`\`\`

## Action Items

{{if .ActionItems}}
{{range .ActionItems}}
- [ ] {{.}}
{{end}}
{{else}}
No action items identified.
{{end}}

## Compliance Notes

{{if .Compliance}}
{{range .Compliance}}
- {{.}}
{{end}}
{{else}}
No compliance issues identified.
{{end}}

---

*Generated by ScreenPipe Assistant Bridge*
`

// GetStats returns Obsidian writer statistics
func (w *Writer) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"vault_path": w.config.Obsidian.VaultPath,
		"folder":     w.config.Obsidian.Folder,
		"tag_prefix": w.config.Obsidian.TagPrefix,
	}
}

func (w *Writer) WriteNoteWithMetadata(content, title string, metadata map[string]interface{}) error {
	// Generate filename with timestamp
	timestamp := time.Now().Format("2006-01-02-15-04-05")
	filename := fmt.Sprintf("%s-%s.md", timestamp, sanitizeFilename(title))
	filepath := filepath.Join(w.vaultPath, filename)

	// Build frontmatter
	frontmatter := fmt.Sprintf("---\ntitle: \"%s\"\ncreated: %s\nsource: \"ScreenPipe Bridge\"\n", 
		title, time.Now().Format("2006-01-02T15:04:05Z"))
	
	// Add custom metadata
	for key, value := range metadata {
		frontmatter += fmt.Sprintf("%s: %v\n", key, value)
	}
	
	frontmatter += "tags: [screenpipe, auto-generated]\n---\n\n"

	// Write the note
	fullContent := frontmatter + content
	if err := os.WriteFile(filepath, []byte(fullContent), 0644); err != nil {
		return fmt.Errorf("failed to write note: %w", err)
	}

	fmt.Printf("[Obsidian] Note written: %s\n", filepath)
	return nil
}

// sanitizeFilename removes or replaces characters that are invalid in filenames
func sanitizeFilename(name string) string {
	// Replace invalid characters with underscores
	invalid := []rune{'<', '>', ':', '"', '/', '\\', '|', '?', '*'}
	result := []rune(name)
	
	for i, char := range result {
		for _, inv := range invalid {
			if char == inv {
				result[i] = '_'
				break
			}
		}
	}
	
	return string(result)
} 