#!/usr/bin/env python3
import sys
import json
import os
import re
import argparse
from pathlib import Path

# Add user packages to path
import subprocess
result = subprocess.run(['python3', '-m', 'site', '--user-site'], capture_output=True, text=True)
user_site = result.stdout.strip()
if user_site and user_site not in sys.path:
    sys.path.insert(0, user_site)

try:
    import ebooklib
    from ebooklib import epub
    from mobi import extract as mobi_extract
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}"}))
    sys.exit(1)

def clean_html(text):
    """Remove HTML tags and clean text"""
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def process_epub(epub_path):
    """Extract text and metadata from epub file"""
    book = epub.read_epub(epub_path)
    
    metadata = {
        "title": None,
        "author": None,
        "description": None,
        "language": None,
        "publisher": None,
        "identifier": None
    }
    
    # Get metadata
    for item in book.get_metadata('DC', 'title'):
        if item and item[0]:
            metadata['title'] = item[0]
            
    for item in book.get_metadata('DC', 'creator'):
        if item and item[0]:
            metadata['author'] = item[0]
            
    for item in book.get_metadata('DC', 'description'):
        if item and item[0]:
            metadata['description'] = clean_html(str(item[0]))
            
    for item in book.get_metadata('DC', 'language'):
        if item and item[0]:
            metadata['language'] = item[0]
            
    for item in book.get_metadata('DC', 'publisher'):
        if item and item[0]:
            metadata['publisher'] = item[0]
    
    # Extract text
    full_text = ""
    for item in book.get_items():
        if item.get_type() == 9:  # DOCUMENT
            content = item.get_content()
            if isinstance(content, bytes):
                content = content.decode('utf-8', errors='ignore')
            clean_text = clean_html(content)
            if len(clean_text) > 50:
                full_text += clean_text + " "
    
    return {
        "text": full_text.strip(),
        "metadata": metadata,
        "word_count": len(full_text.split()),
        "char_count": len(full_text)
    }

def process_mobi(mobi_path):
    """Convert mobi to epub and extract"""
    # Convert mobi to epub
    epub_path = mobi_extract(mobi_path)
    return process_epub(epub_path)

def main():
    parser = argparse.ArgumentParser(description='Process ebook files')
    parser.add_argument('file', help='Path to ebook file')
    args = parser.parse_args()
    
    file_path = args.file
    
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)
    
    ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if ext == '.mobi':
            result = process_mobi(file_path)
        elif ext == '.epub':
            result = process_epub(file_path)
        else:
            print(json.dumps({"error": f"Unsupported format: {ext}"}))
            sys.exit(1)
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
