#!/usr/bin/env python3
"""
ScreenPipe → Mindpal → Obsidian Bridge
Integrates ScreenPipe captures with Mindpal AI processing and interactive approval workflow
"""

import os
import time
import glob
import json
import yaml
import requests
import threading
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
import queue
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('screenpipe_bridge.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MindpalBridge:
    def __init__(self, config_path: str = "config.yaml"):
        self.config = self.load_config(config_path)
        self.seen_files = set()
        self.pending_approvals = queue.Queue()
        self.approved_notes = queue.Queue()
        
        # Initialize directories
        self.data_dir = os.path.expanduser(self.config['screenpipe']['data_dir'])
        self.vault_dir = os.path.expanduser(self.config['obsidian']['vault_dir'])
        os.makedirs(self.vault_dir, exist_ok=True)
        
        # Mindpal configuration
        self.mindpal_config = self.config['mindpal']
        self.auto_approve = self.config['features']['auto_approve']
        
        logger.info(f"🚀 Mindpal Bridge initialized")
        logger.info(f"📁 ScreenPipe data: {self.data_dir}")
        logger.info(f"📚 Obsidian vault: {self.vault_dir}")
        logger.info(f"🤖 Mindpal chatbot: {self.mindpal_config['chatbot_url']}")
    
    def load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            logger.error(f"❌ Config file not found: {config_path}")
            raise
        except yaml.YAMLError as e:
            logger.error(f"❌ Invalid YAML in config: {e}")
            raise
    
    def get_file_type(self, file_path: str) -> str:
        """Determine file type from extension"""
        ext = Path(file_path).suffix.lower()
        if ext in ['.mp4', '.avi', '.mov', '.mkv']:
            return 'video'
        elif ext in ['.wav', '.mp3', '.m4a', '.flac']:
            return 'audio'
        elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp']:
            return 'image'
        elif ext in ['.txt', '.log', '.json']:
            return 'text'
        else:
            return 'unknown'
    
    def extract_file_content(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """Extract relevant content from file based on type"""
        content = {
            'file_path': file_path,
            'file_type': file_type,
            'timestamp': datetime.now().isoformat(),
            'file_size': os.path.getsize(file_path),
            'filename': Path(file_path).name
        }
        
        if file_type == 'text':
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content['text_content'] = f.read()
            except Exception as e:
                logger.warning(f"Could not read text file {file_path}: {e}")
                content['text_content'] = f"Error reading file: {e}"
        
        elif file_type == 'image':
            # For images, we'll reference the file path
            content['image_path'] = file_path
            content['description'] = f"Screenshot captured at {content['timestamp']}"
        
        elif file_type == 'audio':
            content['audio_path'] = file_path
            content['description'] = f"Audio recording captured at {content['timestamp']}"
        
        elif file_type == 'video':
            content['video_path'] = file_path
            content['description'] = f"Video recording captured at {content['timestamp']}"
        
        return content
    
    def send_to_mindpal(self, content: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send content to Mindpal for processing"""
        try:
            # Prepare the message for Mindpal
            message = {
                "role": "user",
                "content": f"""
ScreenPipe Capture Analysis Request:

File Information:
- Type: {content['file_type']}
- Path: {content['file_path']}
- Timestamp: {content['timestamp']}
- Size: {content['file_size']} bytes

Content:
{content.get('text_content', content.get('description', 'No text content available'))}

Please analyze this ScreenPipe capture and create a structured Obsidian note with:
1. Context and summary
2. Key observations
3. Actionable insights
4. Relevant tags
5. Any follow-up tasks

Format as markdown suitable for Obsidian.
"""
            }
            
            # Mindpal API call (using their chat endpoint)
            headers = {
                "Authorization": f"Bearer {self.mindpal_config['api_key']}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": [message],
                "agent_id": self.mindpal_config['agent_id'],
                "stream": False
            }
            
            response = requests.post(
                f"{self.mindpal_config['base_url']}/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    return {
                        'original_content': content,
                        'mindpal_response': result['choices'][0]['message']['content'],
                        'processed_at': datetime.now().isoformat(),
                        'status': 'success'
                    }
            
            logger.error(f"❌ Mindpal API error: {response.status_code} - {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"❌ Error sending to Mindpal: {e}")
            return None
    
    def create_obsidian_note(self, processed_content: Dict[str, Any]) -> str:
        """Create Obsidian note from processed content"""
        timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        filename = Path(processed_content['original_content']['file_path']).stem
        safe_filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-')).rstrip()
        
        note_filename = f"{timestamp}-{safe_filename}-mindpal.md"
        note_path = os.path.join(self.vault_dir, note_filename)
        
        # Create frontmatter
        frontmatter = f"""---
title: "{safe_filename} (Mindpal Analysis)"
created: {datetime.now().isoformat()}
source: "ScreenPipe Bridge + Mindpal"
original_file: "{processed_content['original_content']['file_path']}"
file_type: "{processed_content['original_content']['file_type']}"
processed_at: "{processed_content['processed_at']}"
tags: [screenpipe, mindpal, auto-generated, {processed_content['original_content']['file_type']}]
---

"""
        
        # Combine frontmatter with Mindpal response
        full_content = frontmatter + processed_content['mindpal_response']
        
        with open(note_path, 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        logger.info(f"✅ Note written: {note_path}")
        return note_path
    
    def process_file(self, file_path: str) -> None:
        """Process a single file through the Mindpal pipeline"""
        logger.info(f"🔍 Processing: {file_path}")
        
        file_type = self.get_file_type(file_path)
        if file_type == 'unknown':
            logger.info(f"⏭️  Skipping unsupported file type: {file_path}")
            return
        
        # Extract content
        content = self.extract_file_content(file_path, file_type)
        
        # Send to Mindpal
        logger.info(f"🤖 Sending to Mindpal for analysis...")
        processed_content = self.send_to_mindpal(content)
        
        if processed_content:
            if self.auto_approve:
                # Auto-approve and write to Obsidian
                note_path = self.create_obsidian_note(processed_content)
                logger.info(f"✅ Auto-approved and written: {note_path}")
            else:
                # Add to approval queue
                self.pending_approvals.put(processed_content)
                logger.info(f"⏳ Added to approval queue: {file_path}")
        else:
            logger.error(f"❌ Failed to process: {file_path}")
    
    def approval_worker(self):
        """Background worker for handling approvals"""
        while True:
            try:
                # Check for approved notes
                if not self.approved_notes.empty():
                    processed_content = self.approved_notes.get()
                    note_path = self.create_obsidian_note(processed_content)
                    logger.info(f"✅ Approved and written: {note_path}")
                
                time.sleep(1)
            except Exception as e:
                logger.error(f"❌ Error in approval worker: {e}")
                time.sleep(5)
    
    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        """Get list of pending approvals for UI"""
        approvals = []
        while not self.pending_approvals.empty():
            try:
                approvals.append(self.pending_approvals.get_nowait())
            except queue.Empty:
                break
        return approvals
    
    def approve_note(self, processed_content: Dict[str, Any]) -> None:
        """Approve a note for writing to Obsidian"""
        self.approved_notes.put(processed_content)
        logger.info(f"✅ Note approved for writing")
    
    def reject_note(self, processed_content: Dict[str, Any]) -> None:
        """Reject a note (discard)"""
        logger.info(f"❌ Note rejected and discarded")
    
    def run(self):
        """Main monitoring loop"""
        logger.info("🚀 Mindpal Bridge Starting...")
        logger.info("=" * 50)
        
        if not os.path.exists(self.data_dir):
            logger.error(f"❌ Data directory does not exist: {self.data_dir}")
            logger.error("Make sure ScreenPipe is running!")
            return
        
        # Start approval worker thread
        approval_thread = threading.Thread(target=self.approval_worker, daemon=True)
        approval_thread.start()
        
        try:
            while True:
                # Get all files in the data directory
                files = glob.glob(os.path.join(self.data_dir, "*"))
                
                for file_path in files:
                    if file_path not in self.seen_files:
                        logger.info(f"🆕 New file detected: {file_path}")
                        self.process_file(file_path)
                        self.seen_files.add(file_path)
                
                time.sleep(self.config['screenpipe']['poll_interval'])
                
        except KeyboardInterrupt:
            logger.info("\n👋 Bridge stopped by user")
        except Exception as e:
            logger.error(f"❌ Error in main loop: {e}")

if __name__ == "__main__":
    bridge = MindpalBridge()
    bridge.run() 