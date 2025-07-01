package config

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// Config represents the application configuration
type Config struct {
	ScreenPipe ScreenPipeConfig `yaml:"screenpipe"`
	LLM        LLMConfig        `yaml:"llm"`
	Obsidian   ObsidianConfig   `yaml:"obsidian"`
	Processing ProcessingConfig `yaml:"processing"`
	Logging    LoggingConfig    `yaml:"logging"`
}

// ScreenPipeConfig contains ScreenPipe-related settings
type ScreenPipeConfig struct {
	OutputPath    string   `yaml:"output_path"`
	WatchPatterns []string `yaml:"watch_patterns"`
}

// LLMConfig contains LLM provider settings
type LLMConfig struct {
	Provider    string  `yaml:"provider"`
	Endpoint    string  `yaml:"endpoint"`
	APIKey      string  `yaml:"api_key"`
	Model       string  `yaml:"model"`
	MaxTokens   int     `yaml:"max_tokens"`
	Temperature float32 `yaml:"temperature"`
}

// ObsidianConfig contains Obsidian vault settings
type ObsidianConfig struct {
	VaultPath        string `yaml:"vault_path"`
	NotesSubdirectory string `yaml:"notes_subdirectory"`
	FilenameTemplate string `yaml:"filename_template"`
}

// ProcessingConfig contains processing behavior settings
type ProcessingConfig struct {
	BatchSize           int  `yaml:"batch_size"`
	BatchDelay          int  `yaml:"batch_delay"`
	EnableDoctrineCheck bool `yaml:"enable_doctrine_check"`
}

// LoggingConfig contains logging settings
type LoggingConfig struct {
	Level string `yaml:"level"`
	File  string `yaml:"file"`
}

// Load reads and parses the configuration file
func Load(configPath string) (*Config, error) {
	// If no path provided, try default locations
	if configPath == "" {
		configPath = findDefaultConfig()
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file %s: %w", configPath, err)
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file %s: %w", configPath, err)
	}

	// Override API key from environment if set
	if apiKey := os.Getenv("OPENAI_API_KEY"); apiKey != "" {
		config.LLM.APIKey = apiKey
	}

	// Validate configuration
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return &config, nil
}

// Validate checks if the configuration is valid
func (c *Config) Validate() error {
	if c.ScreenPipe.OutputPath == "" {
		return fmt.Errorf("screenpipe.output_path is required")
	}

	if c.LLM.APIKey == "" {
		return fmt.Errorf("llm.api_key is required (set via config or OPENAI_API_KEY env var)")
	}

	if c.Obsidian.VaultPath == "" {
		return fmt.Errorf("obsidian.vault_path is required")
	}

	// Check if paths exist
	if _, err := os.Stat(c.ScreenPipe.OutputPath); os.IsNotExist(err) {
		return fmt.Errorf("screenpipe output path does not exist: %s", c.ScreenPipe.OutputPath)
	}

	if _, err := os.Stat(c.Obsidian.VaultPath); os.IsNotExist(err) {
		return fmt.Errorf("obsidian vault path does not exist: %s", c.Obsidian.VaultPath)
	}

	return nil
}

// findDefaultConfig searches for config files in standard locations
func findDefaultConfig() string {
	possiblePaths := []string{
		"configs/config.yaml",
		"config.yaml",
		"./config.yaml",
	}

	for _, path := range possiblePaths {
		if _, err := os.Stat(path); err == nil {
			return path
		}
	}

	return "configs/config.yaml" // Default fallback
}

// GetObsidianNotesPath returns the full path to the ScreenPipe notes directory
func (c *Config) GetObsidianNotesPath() string {
	return filepath.Join(c.Obsidian.VaultPath, c.Obsidian.NotesSubdirectory)
} 