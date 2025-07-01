#!/usr/bin/env python3
import os
import time
import glob
import json
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime

class SimpleScreenPipeBridge:
    def __init__(self):
        self.data_dir = os.path.expanduser("~/.screenpipe/data")
        self.vault_dir = os.path.expanduser("~/Documents/Obsidian Vault")
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.seen_files = set()
        
        # Create vault directory if it doesn't exist
        os.makedirs(self.vault_dir, exist_ok=True)
        
        if not self.api_key:
            print("❌ OPENAI_API_KEY environment variable not set")
            print("Set it with: export OPENAI_API_KEY='your-api-key-here'")
            exit(1)
    
    def get_file_type(self, file_path):
        ext = Path(file_path).suffix.lower()
        if ext in ['.mp4', '.avi', '.mov', '.mkv']:
            return 'video'
        elif ext in ['.wav', '.mp3', '.m4a', '.flac']:
            return 'audio'
        elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp']:
            return 'image'
        elif ext in ['.txt', '.log']:
            return 'text'
        else:
            return 'unknown'
    
    def process_with_openai(self, file_path, file_type):
        prompt = f"""Analyze this {file_type} file from ScreenPipe and create an intelligent note summary.

File: {file_path}
Type: {file_type}

Please provide:
1. A concise summary of the content
2. Key insights or observations
3. Any actionable items or follow-ups
4. Relevant tags for organization

Format the response as a markdown note suitable for Obsidian."""

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-4",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an intelligent assistant that analyzes screen capture data and creates well-structured notes for Obsidian. Focus on clarity, organization, and actionable insights."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 1000
        }
        
        try:
            # Convert data to JSON bytes
            json_data = json.dumps(data).encode('utf-8')
            
            # Create request
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json_data,
                headers=headers,
                method='POST'
            )
            
            # Make request
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode('utf-8'))
                
                if result.get("choices") and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    return "No response from OpenAI"
                
        except Exception as e:
            return f"Error processing with OpenAI: {str(e)}"
    
    def write_obsidian_note(self, content, file_path, file_type):
        # Generate filename
        timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        filename = Path(file_path).stem.replace("_", " ").replace("-", " ")
        safe_filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-')).rstrip()
        
        note_filename = f"{timestamp}-{safe_filename}-{file_type}.md"
        note_path = os.path.join(self.vault_dir, note_filename)
        
        # Create frontmatter
        frontmatter = f"""---
title: "{safe_filename} ({file_type})"
created: {datetime.now().isoformat()}
source: "ScreenPipe Bridge"
original_file: "{file_path}"
file_type: "{file_type}"
processed_at: "{datetime.now().isoformat()}"
tags: [screenpipe, auto-generated, {file_type}]
---

"""
        
        # Write the note
        full_content = frontmatter + content
        with open(note_path, 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        print(f"✅ Note written: {note_path}")
        return note_path
    
    def process_file(self, file_path):
        print(f"🔍 Processing: {file_path}")
        
        file_type = self.get_file_type(file_path)
        if file_type == 'unknown':
            print(f"⏭️  Skipping unsupported file type: {file_path}")
            return
        
        print(f"🤖 Sending to OpenAI for analysis...")
        analysis = self.process_with_openai(file_path, file_type)
        
        print(f"📝 Writing note to Obsidian...")
        note_path = self.write_obsidian_note(analysis, file_path, file_type)
        
        print(f"✅ Successfully processed: {file_path}")
        print(f"📄 Note created: {note_path}")
        print("-" * 50)
    
    def run(self):
        print("🚀 ScreenPipe Bridge Starting...")
        print(f"📁 Monitoring: {self.data_dir}")
        print(f"📚 Vault: {self.vault_dir}")
        print("=" * 50)
        
        if not os.path.exists(self.data_dir):
            print(f"❌ Data directory does not exist: {self.data_dir}")
            print("Make sure ScreenPipe is running!")
            exit(1)
        
        while True:
            try:
                # Get all files in the data directory
                files = glob.glob(os.path.join(self.data_dir, "*"))
                
                for file_path in files:
                    if file_path not in self.seen_files:
                        print(f"🆕 New file detected: {file_path}")
                        self.process_file(file_path)
                        self.seen_files.add(file_path)
                
                time.sleep(10)  # Check every 10 seconds
                
            except KeyboardInterrupt:
                print("\n👋 Bridge stopped by user")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(10)

if __name__ == "__main__":
    bridge = SimpleScreenPipeBridge()
    bridge.run() 