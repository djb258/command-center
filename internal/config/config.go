package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/viper"
)

// Config holds all configuration for the bridge
type Config struct {
	ScreenPipe ScreenPipeConfig
	LLM        LLMConfig
	Obsidian   ObsidianConfig
	Bridge     BridgeConfig
	Processing ProcessingConfig
	Security   SecurityConfig
	Logging    LoggingConfig
	// Future features
	Hotkey     HotkeyConfig     // Phase 2
	Voice      VoiceConfig      // Phase 2
	MultiLLM   MultiLLMConfig   // Phase 3
	Deerflow   DeerflowConfig   // Phase 4
}

// ScreenPipeConfig holds ScreenPipe-specific configuration
type ScreenPipeConfig struct {
	DataDir       string
	PollInterval  time.Duration
	FilePatterns  []string
}

// LLMConfig holds LLM provider configuration
type LLMConfig struct {
	Provider string
	OpenAI   OpenAIConfig
	Claude   ClaudeConfig   // Future
	Grok     GrokConfig     // Future
	Gemini   GeminiConfig   // Future
	Mindpal  MindpalConfig  // Future
}

// OpenAIConfig holds OpenAI-specific configuration
type OpenAIConfig struct {
	APIKey      string
	Model       string
	MaxTokens   int
	Temperature float64
}

// ClaudeConfig holds Claude-specific configuration (Future)
type ClaudeConfig struct {
	APIKey      string
	Model       string
	MaxTokens   int
	Temperature float64
}

// GrokConfig holds Grok-specific configuration (Future)
type GrokConfig struct {
	APIKey      string
	Model       string
	MaxTokens   int
	Temperature float64
}

// GeminiConfig holds Gemini-specific configuration (Future)
type GeminiConfig struct {
	APIKey      string
	Model       string
	MaxTokens   int
	Temperature float64
}

// MindpalConfig holds Mindpal-specific configuration (Future)
type MindpalConfig struct {
	APIKey      string
	Model       string
	MaxTokens   int
	Temperature float64
}

// ObsidianConfig holds Obsidian-specific configuration
type ObsidianConfig struct {
	VaultPath   string
	TemplatePath string
	Folder      string
	TagPrefix   string
}

// BridgeConfig holds bridge server configuration
type BridgeConfig struct {
	Port      int
	Host      string
	EnableHTTPS bool
}

// ProcessingConfig holds processing pipeline configuration
type ProcessingConfig struct {
	BatchSize              int
	Timeout               time.Duration
	EnableAudioProcessing bool
	EnableVideoProcessing bool
	EnableTextProcessing  bool
}

// SecurityConfig holds security-related configuration
type SecurityConfig struct {
	EnableAPIKeyRotation    bool
	APIKeyRotationInterval time.Duration
	EnableRequestLogging    bool
}

// LoggingConfig holds logging configuration
type LoggingConfig struct {
	Level        string
	LogFile      string
	EnableDebug  bool
}

// HotkeyConfig holds hotkey configuration (Phase 2)
type HotkeyConfig struct {
	Enabled bool
	Combo   string
}

// VoiceConfig holds voice command configuration (Phase 2)
type VoiceConfig struct {
	Enabled    bool
	WakePhrase string
}

// MultiLLMConfig holds multi-LLM configuration (Phase 3)
type MultiLLMConfig struct {
	Enabled   bool
	Providers []string
}

// DeerflowConfig holds Deerflow integration configuration (Phase 4)
type DeerflowConfig struct {
	Enabled     bool
	APIKey      string
	WorkflowID  string
}

// Load loads configuration from environment variables and config files
func Load() (*Config, error) {
	// Set up Viper
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./configs")

	// Read config file if it exists
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	// Enable environment variable override
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	// Load environment variables from .env file if it exists
	if _, err := os.Stat(".env"); err == nil {
		viper.SetConfigName(".env")
		viper.SetConfigType("env")
		if err := viper.MergeInConfig(); err != nil {
			return nil, fmt.Errorf("error reading .env file: %w", err)
		}
	}

	config := &Config{}

	// ScreenPipe Configuration
	config.ScreenPipe = ScreenPipeConfig{
		DataDir:      getEnvOrDefault("SCREENPIPE_DATA_DIR", "C:/Users/CUSTOM PC/.screenpipe/data"),
		PollInterval: getDurationEnvOrDefault("SCREENPIPE_POLL_INTERVAL", 5*time.Second),
		FilePatterns: strings.Split(getEnvOrDefault("SCREENPIPE_FILE_PATTERNS", "*.mp4,*.wav,*.txt"), ","),
	}

	// LLM Configuration
	config.LLM = LLMConfig{
		Provider: getEnvOrDefault("LLM_PROVIDER", "openai"),
		OpenAI: OpenAIConfig{
			APIKey:      getEnvOrDefault("OPENAI_API_KEY", ""),
			Model:       getEnvOrDefault("OPENAI_MODEL", "gpt-4-turbo"),
			MaxTokens:   getIntEnvOrDefault("OPENAI_MAX_TOKENS", 4000),
			Temperature: getFloatEnvOrDefault("OPENAI_TEMPERATURE", 0.7),
		},
		// Future LLM providers (commented out for Phase 2+)
		// Claude: ClaudeConfig{...},
		// Grok: GrokConfig{...},
		// Gemini: GeminiConfig{...},
		// Mindpal: MindpalConfig{...},
	}

	// Obsidian Configuration
	config.Obsidian = ObsidianConfig{
		VaultPath:    getEnvOrDefault("OBSIDIAN_VAULT_PATH", "C:/Users/CUSTOM PC/ObsidianVault"),
		TemplatePath: getEnvOrDefault("OBSIDIAN_TEMPLATE_PATH", "templates/note_template.md"),
		Folder:       getEnvOrDefault("OBSIDIAN_FOLDER", "ScreenPipe Notes"),
		TagPrefix:    getEnvOrDefault("OBSIDIAN_TAG_PREFIX", "screenpipe"),
	}

	// Bridge Configuration
	config.Bridge = BridgeConfig{
		Port:        getIntEnvOrDefault("BRIDGE_PORT", 8080),
		Host:        getEnvOrDefault("UI_HOST", "localhost"),
		EnableHTTPS: getBoolEnvOrDefault("ENABLE_HTTPS", false),
	}

	// Processing Configuration
	config.Processing = ProcessingConfig{
		BatchSize:              getIntEnvOrDefault("PROCESSING_BATCH_SIZE", 5),
		Timeout:               getDurationEnvOrDefault("PROCESSING_TIMEOUT", 30*time.Second),
		EnableAudioProcessing: getBoolEnvOrDefault("ENABLE_AUDIO_PROCESSING", true),
		EnableVideoProcessing: getBoolEnvOrDefault("ENABLE_VIDEO_PROCESSING", true),
		EnableTextProcessing:  getBoolEnvOrDefault("ENABLE_TEXT_PROCESSING", true),
	}

	// Security Configuration
	config.Security = SecurityConfig{
		EnableAPIKeyRotation:    getBoolEnvOrDefault("ENABLE_API_KEY_ROTATION", false),
		APIKeyRotationInterval: getDurationEnvOrDefault("API_KEY_ROTATION_INTERVAL", 24*time.Hour),
		EnableRequestLogging:    getBoolEnvOrDefault("ENABLE_REQUEST_LOGGING", false),
	}

	// Logging Configuration
	config.Logging = LoggingConfig{
		Level:       getEnvOrDefault("LOG_LEVEL", "info"),
		LogFile:     getEnvOrDefault("LOG_FILE", "logs/bridge.log"),
		EnableDebug: getBoolEnvOrDefault("ENABLE_DEBUG_MODE", false),
	}

	// Future feature configurations (commented out for Phase 2+)
	// config.Hotkey = HotkeyConfig{
	//     Enabled: getBoolEnvOrDefault("HOTKEY_ENABLED", false),
	//     Combo:   getEnvOrDefault("HOTKEY_COMBO", "ctrl+alt+a"),
	// }
	// config.Voice = VoiceConfig{
	//     Enabled:    getBoolEnvOrDefault("VOICE_COMMANDS_ENABLED", false),
	//     WakePhrase: getEnvOrDefault("VOICE_WAKE_PHRASE", "hey assistant"),
	// }
	// config.MultiLLM = MultiLLMConfig{
	//     Enabled:   getBoolEnvOrDefault("MULTI_LLM_ENABLED", false),
	//     Providers: strings.Split(getEnvOrDefault("MULTI_LLM_PROVIDERS", "openai,claude"), ","),
	// }
	// config.Deerflow = DeerflowConfig{
	//     Enabled:    getBoolEnvOrDefault("DEERFLOW_INTEGRATION_ENABLED", false),
	//     APIKey:     getEnvOrDefault("DEERFLOW_API_KEY", ""),
	//     WorkflowID: getEnvOrDefault("DEERFLOW_WORKFLOW_ID", ""),
	// }

	return config, nil
}

// Helper functions for environment variable parsing
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnvOrDefault(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getFloatEnvOrDefault(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 64); err == nil {
			return floatValue
		}
	}
	return defaultValue
}

func getBoolEnvOrDefault(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getDurationEnvOrDefault(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
} 