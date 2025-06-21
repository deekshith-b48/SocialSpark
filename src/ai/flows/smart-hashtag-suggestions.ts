'use server';

/**
 * @fileOverview Provides AI-powered hashtag suggestions based on event details.
 *
 * - suggestHashtags -  A function that generates smart hashtag suggestions.
 * - SuggestHashtagsInput - The input type for suggestHashtags.
 * - SuggestHashtagsOutput - The return type for suggestHashtags.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHashtagsInputSchema = z.object({
  eventTitle: z.string().describe('The title of the event.'),
  eventDescription: z.string().describe('A detailed description of the event.'),
  targetAudience: z.string().describe('The target audience for the event.'),
  tone: z.string().describe('The desired tone for the social media posts (e.g., professional, casual, inspirational).'),
});

export type SuggestHashtagsInput = z.infer<typeof SuggestHashtagsInputSchema>;

const SuggestHashtagsOutputSchema = z.object({
  hashtags: z.array(z.string()).describe('An array of relevant and trending hashtags.'),
});

export type SuggestHashtagsOutput = z.infer<typeof SuggestHashtagsOutputSchema>;

export async function suggestHashtags(input: SuggestHashtagsInput): Promise<SuggestHashtagsOutput> {
  return suggestHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHashtagsPrompt',
  input: {schema: SuggestHashtagsInputSchema},
  output: {schema: SuggestHashtagsOutputSchema},
  prompt: `You are an AI social media expert. Generate relevant and trending hashtags based on the following event details to maximize visibility and reach.

Event Title: {{{eventTitle}}}
Event Description: {{{eventDescription}}}
Target Audience: {{{targetAudience}}}
Tone: {{{tone}}}

Return ONLY an array of hashtags.  Do not include any other text.  Be sure to include both general and trending hashtags. Limit the array to a maximum of 10 hashtags.`,
});

const suggestHashtagsFlow = ai.defineFlow(
  {
    name: 'suggestHashtagsFlow',
    inputSchema: SuggestHashtagsInputSchema,
    outputSchema: SuggestHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
