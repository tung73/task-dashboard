import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert mobi to epub using Python
async function convertMobiToEpub(mobiPath) {
  const { extract } = await import('mobi');
  const outputDir = path.dirname(mobiPath);
  try {
    const epubPath = await extract(mobiPath);
    return epubPath;
  } catch (e) {
    console.error('Mobi conversion error:', e.message);
    throw e;
  }
}

// Extract text from epub
async function extractEpubText(epubPath) {
  const { read_epub } = await import('ebooklib');
  const book = await read_epub(epubPath);
  
  let fullText = '';
  let metadata = {
    title: null,
    author: null,
    description: null
  };
  
  // Get metadata
  try {
    const title = book.getMetadata('DC', 'title');
    if (title.length > 0) metadata.title = title[0][0];
  } catch (e) {}
  
  try {
    const author = book.getMetadata('DC', 'creator');
    if (author.length > 0) metadata.author = author[0][0];
  } catch (e) {}
  
  try {
    const desc = book.getMetadata('DC', 'description');
    if (desc.length > 0) metadata.description = desc[0][0];
  } catch (e) {}
  
  // Extract text from all items
  for (const item of book.getItems()) {
    if (item.getType() === 9) { // DOCUMENT
      const content = item.get_content();
      if (Buffer.isBuffer(content)) {
        const text = content.toString('utf-8');
        // Strip HTML tags
        const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanText.length > 50) {
          fullText += cleanText + ' ';
        }
      }
    }
  }
  
  return { text: fullText.trim(), metadata };
}

// Main function to process ebook
export async function processEbook(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let epubPath = filePath;
  let originalFile = filePath;
  
  // Convert mobi to epub if needed
  if (ext === '.mobi') {
    console.log('Converting mobi to epub...');
    epubPath = await convertMobiToEpub(filePath);
    console.log('Converted to:', epubPath);
  }
  
  if (ext !== '.epub') {
    throw new Error('Unsupported file format. Only epub and mobi are supported.');
  }
  
  // Extract text
  console.log('Extracting text from epub...');
  const { text, metadata } = await extractEpubText(epubPath);
  
  console.log('Extracted text length:', text.length);
  console.log('Metadata:', metadata);
  
  return {
    text,
    metadata,
    wordCount: text.split(/\s+/).length,
    charCount: text.length
  };
}
