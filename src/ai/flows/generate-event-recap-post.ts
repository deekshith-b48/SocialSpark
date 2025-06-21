'use server';
/**
 * @fileOverview A flow that generates an event recap post based on the event description.
 *
 * - generateEventRecapPost - A function that handles the event recap post generation.
 * - GenerateEventRecapPostInput - The input type for the generateEventRecapPost function.
 * - GenerateEventRecapPostOutput - The return type for the generateEventRecapPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEventRecapPostInputSchema = z.object({
  eventDescription: z.string().describe('The description of the event.'),
});
export type GenerateEventRecapPostInput = z.infer<typeof GenerateEventRecapPostInputSchema>;

const GenerateEventRecapPostOutputSchema = z.object({
  recapPost: z.string().describe('The generated event recap post.'),
});
export type GenerateEventRecapPostOutput = z.infer<typeof GenerateEventRecapPostOutputSchema>;

export async function generateEventRecapPost(input: GenerateEventRecapPostInput): Promise<GenerateEventRecapPostOutput> {
  return generateEventRecapPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEventRecapPostPrompt',
  input: {schema: GenerateEventRecapPostInputSchema},
  output: {schema: GenerateEventRecapPostOutputSchema},
  prompt: `You are an AI assistant that helps generate engaging and informative event recap posts.

  Based on the event description provided below, create a compelling social media post summarizing the event and highlighting its key successes.

  Event Description: {{{eventDescription}}}
  `,
});

const generateEventRecapPostFlow = ai.defineFlow(
  {
    name: 'generateEventRecapPostFlow',
    inputSchema: GenerateEventRecapPostInputSchema,
    outputSchema: GenerateEventRecapPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
