'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate smart, contextual refill alerts for medications.
 *
 * - generateRefillAlert - A function that handles the refill alert generation process.
 * - GenerateRefillAlertInput - The input type for the generateRefillAlert function.
 * - GenerateRefillAlertOutput - The return type for the generateRefillAlert function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRefillAlertInputSchema = z.object({
  medicineName: z.string().describe('The name of the medication.'),
  currentQuantity: z
    .number()
    .describe('The current remaining quantity of the medicine.'),
  dosageAmount: z.number().describe('The amount of medicine per single dose.'),
  dosageUnit: z.string().describe('The unit of the dosage (e.g., "pill", "mg", "ml").'),
  dosesPerDay: z
    .number()
    .describe('The number of doses taken per day.'),
  refillThreshold: z
    .number()
    .describe('The quantity at which a refill alert should be triggered.'),
});
export type GenerateRefillAlertInput = z.infer<
  typeof GenerateRefillAlertInputSchema
>;

const GenerateRefillAlertOutputSchema = z.object({
  alertMessage: z
    .string()
    .describe('A smart, contextual message for the refill alert.'),
  needsRefill: z
    .boolean()
    .describe('True if a refill is needed based on the current quantity and threshold.'),
  daysRemaining: z
    .number()
    .describe('Estimated number of days until the medicine runs out, considering the current dosage.'),
});
export type GenerateRefillAlertOutput = z.infer<
  typeof GenerateRefillAlertOutputSchema
>;

export async function generateRefillAlert(
  input: GenerateRefillAlertInput
): Promise<GenerateRefillAlertOutput> {
  return generateRefillAlertFlow(input);
}

const generateRefillAlertPrompt = ai.definePrompt({
  name: 'generateRefillAlertPrompt',
  input: { schema: GenerateRefillAlertInputSchema },
  output: { schema: GenerateRefillAlertOutputSchema },
  prompt: `You are an intelligent personal medication manager assistant. Your task is to generate a proactive and contextual refill alert message for a user based on their medication details.

Calculate the estimated number of days remaining until the medicine runs out, considering the current dosage and doses per day. If the current quantity is less than or equal to the refill threshold, indicate that a refill is needed.

Medicine Name: {{{medicineName}}}
Current Quantity: {{{currentQuantity}}} {{{dosageUnit}}}
Dosage: {{{dosageAmount}}} {{{dosageUnit}}} per dose
Doses per day: {{{dosesPerDay}}}
Refill Threshold: {{{refillThreshold}}} {{{dosageUnit}}}

Based on this information, provide a refill alert message. If a refill is critically needed, make the message urgent but helpful. If the medicine is getting low but not yet at the critical threshold, provide a heads-up. If there's plenty of stock, provide an informative update on remaining stock.

Output MUST be a JSON object conforming to the following schema, including the calculated 'daysRemaining' and 'needsRefill' fields:
{{jsonSchema GenerateRefillAlertOutputSchema}}`,
});

const generateRefillAlertFlow = ai.defineFlow(
  {
    name: 'generateRefillAlertFlow',
    inputSchema: GenerateRefillAlertInputSchema,
    outputSchema: GenerateRefillAlertOutputSchema,
  },
  async (input) => {
    const { output } = await generateRefillAlertPrompt(input);
    return output!;
  }
);
