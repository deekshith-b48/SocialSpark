'use server';
/**
 * @fileOverview A tool to fetch and parse content from a URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as cheerio from 'cheerio';

export const fetchUrlContent = ai.defineTool(
  {
    name: 'fetchUrlContent',
    description: 'Fetches the text content of a given public URL. Useful for extracting information from event pages.',
    inputSchema: z.object({
      url: z.string().url().describe('The public URL of the event page to fetch.'),
    }),
    outputSchema: z.string().describe('The extracted text content from the main body of the URL.'),
  },
  async ({ url }) => {
    try {
      const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }
      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script, style, and common non-content elements
      $('script, style, nav, footer, header, noscript, svg').remove();

      // Get text from the body, which is a reasonable proxy for the main content.
      const mainContent = $('body').text();
      
      // Clean up whitespace and newlines
      const cleanedContent = mainContent.replace(/\s\s+/g, ' ').trim();
      
      // Limit content size to avoid overly large payloads for the LLM
      return cleanedContent.substring(0, 15000);

    } catch (error) {
      console.error(`Error fetching or parsing URL ${url}:`, error);
      return `Error: Could not retrieve content from the URL. It might be invalid, down, or blocked.`;
    }
  }
);
