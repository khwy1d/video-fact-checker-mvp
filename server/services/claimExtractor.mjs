import { invokeLLM } from '../_core/llm.js';

export async function extractClaims(mergedContent) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert fact-checker. Extract all verifiable claims from the provided text. 
For each claim, provide:
1. The claim text (clear and concise)
2. A category (factual, statistical, historical, etc.)
3. Confidence level (1-100) on how verifiable this claim is

Return as JSON array with structure: [{ claim: string, category: string, confidence: number }]
Only return valid JSON, no other text.`,
        },
        {
          role: 'user',
          content: `Extract verifiable claims from this content:\n\n${mergedContent}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'claims_extraction',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              claims: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    claim: { type: 'string' },
                    category: { type: 'string' },
                    confidence: { type: 'number' },
                  },
                  required: ['claim', 'category', 'confidence'],
                },
              },
            },
            required: ['claims'],
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(content);
    return parsed.claims || [];
  } catch (error) {
    console.error('Claim extraction error:', error);
    throw new Error(`Failed to extract claims: ${error.message}`);
  }
}

export async function evaluateClaim(claim, searchResults) {
  try {
    const sourceSummary = searchResults
      .map((r) => `- ${r.title}: ${r.snippet}`)
      .join('\n');

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert fact-checker. Evaluate the veracity of claims based on search results.
Return a JSON object with:
- verdict: "صحيح" (True), "غير مدعوم" (Unsupported), or "مضلل" (Misleading)
- confidence: 1-100
- explanation: Brief explanation of the verdict
- keyPoints: Array of key supporting/contradicting points

Only return valid JSON.`,
        },
        {
          role: 'user',
          content: `Claim: "${claim}"

Search Results:
${sourceSummary}

Evaluate this claim based on the search results.`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'claim_evaluation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              verdict: {
                type: 'string',
                enum: ['صحيح', 'غير مدعوم', 'مضلل'],
              },
              confidence: { type: 'number' },
              explanation: { type: 'string' },
              keyPoints: { type: 'array', items: { type: 'string' } },
            },
            required: ['verdict', 'confidence', 'explanation', 'keyPoints'],
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Claim evaluation error:', error);
    throw new Error(`Failed to evaluate claim: ${error.message}`);
  }
}
