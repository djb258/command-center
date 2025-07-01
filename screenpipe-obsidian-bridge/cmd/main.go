package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"screenpipe-obsidian-bridge/internal/config"
	"screenpipe-obsidian-bridge/internal/processor"
)

const (
	appName    = "ScreenPipe Obsidian Bridge"
	appVersion = "1.0.0"
)

func main() {
	// Parse command line flags
	var (
		configPath = flag.String("config", "", "Path to configuration file")
		version    = flag.Bool("version", false, "Show version information")
		help       = flag.Bool("help", false, "Show help information")
	)
	flag.Parse()

	// Show version
	if *version {
		fmt.Printf("%s v%s\n", appName, appVersion)
		os.Exit(0)
	}

	// Show help
	if *help {
		showHelp()
		os.Exit(0)
	}

	// Setup logging
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Printf("🚀 Starting %s v%s", appName, appVersion)

	// Load configuration
	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}

	log.Printf("✅ Configuration loaded successfully")
	log.Printf("   📂 ScreenPipe Output: %s", cfg.ScreenPipe.OutputPath)
	log.Printf("   📝 Obsidian Vault: %s", cfg.Obsidian.VaultPath)
	log.Printf("   🤖 LLM Provider: %s", cfg.LLM.Provider)

	// Create processor
	proc, err := processor.New(cfg)
	if err != nil {
		log.Fatalf("❌ Failed to create processor: %v", err)
	}

	// Setup context with cancellation
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Start processor in goroutine
	errChan := make(chan error, 1)
	go func() {
		if err := proc.Start(ctx); err != nil {
			errChan <- fmt.Errorf("processor failed: %w", err)
		}
	}()

	// Status reporting goroutine
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				status := proc.GetStatus()
				log.Printf("📊 Status: Queue=%d, Processing=%d, Provider=%s",
					status.QueueLength, status.ProcessingFiles, status.LLMProvider)
			}
		}
	}()

	// Wait for shutdown signal or error
	select {
	case sig := <-sigChan:
		log.Printf("🛑 Received signal: %v", sig)
		cancel()
	case err := <-errChan:
		log.Printf("❌ Application error: %v", err)
		cancel()
	}

	// Graceful shutdown
	log.Println("🔄 Shutting down gracefully...")
	
	// Give some time for cleanup
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	done := make(chan struct{})
	go func() {
		defer close(done)
		if err := proc.Stop(); err != nil {
			log.Printf("❌ Error during shutdown: %v", err)
		}
	}()

	select {
	case <-done:
		log.Println("✅ Shutdown completed successfully")
	case <-shutdownCtx.Done():
		log.Println("⚠️ Shutdown timeout reached")
	}

	log.Printf("👋 %s stopped", appName)
}

// showHelp displays usage information
func showHelp() {
	fmt.Printf(`%s v%s

A Go application that monitors ScreenPipe output, processes it through LLMs,
and generates Obsidian-compatible markdown notes.

USAGE:
    %s [OPTIONS]

OPTIONS:
    -config string
        Path to configuration file (default: searches common locations)
    
    -version
        Show version information
    
    -help
        Show this help message

CONFIGURATION:
    The application requires a YAML configuration file. Copy configs/config.example.yaml
    to configs/config.yaml and update the paths and API keys.

    Example configuration locations searched:
    - configs/config.yaml
    - config.yaml
    - ./config.yaml

ENVIRONMENT VARIABLES:
    OPENAI_API_KEY    OpenAI API key (overrides config file)

EXAMPLES:
    # Run with default configuration
    %s

    # Run with specific config file
    %s -config /path/to/config.yaml

    # Show version
    %s -version

For more information, visit: https://github.com/djb258/screenpipe
`, appName, appVersion, os.Args[0], os.Args[0], os.Args[0], os.Args[0])
} 