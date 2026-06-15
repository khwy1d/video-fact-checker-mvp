import { invokeLLM } from '../_core/llm.js';

export async function searchClaim(claim) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a search assistant. Given a claim, generate a list of search queries that would help verify or refute it.
Return a JSON object with:
- queries: Array of 3-5 search queries (strings)

Example queries: "Einstein theory of relativity", "COVID-19 vaccine effectiveness", etc.
Only return valid JSON.`,
        },
        {
          role: 'user',
          content: `Generate search queries for this claim: "${claim}"`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'search_queries',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              queries: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['queries'],
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(content);
    return parsed.queries || [];
  } catch (error) {
    console.error('Search query generation error:', error);
    return [];
  }
}

export async function fetchSearchResults(query) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a search result simulator. Given a search query, provide realistic search results.
Return a JSON object with:
- results: Array of objects with { title, url, snippet }

Provide 3-5 realistic results that would appear in a search engine for the given query.
Only return valid JSON.`,
        },
        {
          role: 'user',
          content: `Provide search results for: "${query}"`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'search_results',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    url: { type: 'string' },
                    snippet: { type: 'string' },
                  },
                  required: ['title', 'url', 'snippet'],
                },
              },
            },
            required: ['results'],
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(content);
    return parsed.results || [];
  } catch (error) {
    console.error('Search results fetch error:', error);
    return [];
  }
}

export async function searchAndVerify(claim) {
  try {
    const queries = await searchClaim(claim);
    const allResults = [];

    for (const query of queries) {
      const results = await fetchSearchResults(query);
      allResults.push(...results);
    }

    return allResults.slice(0, 10);
  } catch (error) {
    console.error('Search and verify error:', error);
    return [];
  }
}
