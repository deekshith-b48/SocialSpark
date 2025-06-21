'use server';
/**
 * @fileOverview Extracts structured event details from a given URL.
 *
 * - extractEventDetailsFromUrl - A function that fetches a URL and uses an LLM to extract event information.
 * - ExtractEventDetailsInput - The input type for the extractEventDetailsFromUrl function.
 * - ExtractEventDetailsOutput - The return type for the extractEventDetailsFromUrl function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchUrlContent } from '../tools/fetch-url-content';

const ExtractEventDetailsInputSchema = z.object({
  url: z.string().url().describe('The URL of the event page.'),
});
export type ExtractEventDetailsInput = z.infer<typeof ExtractEventDetailsInputSchema>;

const ExtractEventDetailsOutputSchema = z.object({
  title: z.string().optional().describe('The title of the event.'),
  description: z.string().optional().describe('A detailed description of the event.'),
  date: z.string().optional().describe('The date of the event (e.g., YYYY-MM-DD). If a full date is found, extract it.'),
  time: z.string().optional().describe('The start time of the event (e.g., HH:MM AM/PM).'),
  location: z.string().optional().describe('The physical address or virtual location of the event.'),
  imageUrl: z.string().url().optional().describe('A direct URL to a relevant featured image for the event. Look for Open Graph or other social media image tags.'),
  registrationUrl: z.string().url().optional().describe('A direct link for event registration, if available.'),
});
export type ExtractEventDetailsOutput = z.infer<typeof ExtractEventDetailsOutputSchema>;

export async function extractEventDetailsFromUrl(input: ExtractEventDetailsInput): Promise<ExtractEventDetailsOutput> {
  return extractEventDetailsFlow(input);
}

const extractEventDetailsPrompt = ai.definePrompt({
  name: 'extractEventDetailsPrompt',
  input: { schema: ExtractEventDetailsInputSchema },
  output: { schema: ExtractEventDetailsOutputSchema },
  tools: [fetchUrlContent],
  prompt: `You are an expert at extracting structured event information from websites.
  Your task is to analyze the content of the provided URL and extract the key details of the event.
  
  Please extract the following information:
  - Event Title
  - Event Description: A comprehensive summary.
  - Date: In YYYY-MM-DD format.
  - Time: The start time, in HH:MM format if possible.
  - Location: The venue name and/or address, or "Virtual" if online.
  - Image URL: A direct link to a featured image. Prioritize Open Graph (og:image) or similar meta tags.
  - Registration URL: The URL to register for the event. If not explicit, you can use the source URL.

  First, use the 'fetchUrlContent' tool with the provided URL: {{{url}}}
  Then, carefully analyze the fetched text to populate the output fields. If a piece of information is not available, leave the corresponding field empty.
  The registration URL should be the most direct link to sign up or buy tickets. If none is found, the original event URL is a good fallback.`,
});

const extractEventDetailsFlow = ai.defineFlow(
  {
    name: 'extractEventDetailsFlow',
    inputSchema: ExtractEventDetailsInputSchema,
    outputSchema: ExtractEventDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await extractEventDetailsPrompt(input);
    if (!output) {
      throw new Error('Could not extract event details.');
    }
    // If registration URL is not found, default to the source URL
    if (!output.registrationUrl) {
        output.registrationUrl = input.url;
    }
    
    return output;
  }
);
