// MIT License

// Copyright (c) 2023 Looker Data Sciences, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { ref } from 'vue';

/**
 * Utility class for string manipulation and array operations.
 */
class UtilsHelper {
  /**
   * Escapes line breaks in a string.
   * @param {string} originalString - The string to escape.
   * @returns {string} The string with escaped line breaks.
   */
  static escapeBreakLine(originalString) {
    return originalString.replace(/\n/g, '\\n');
  }

  /**
   * Escapes special characters in a string.
   * @param {string} originalString - The string to escape.
   * @returns {string} The string with escaped special characters.
   */
  static escapeSpecialCharacter(originalString) {
    return originalString.replace(/'/g, "\\'");
  }

  /**
   * Escapes both line breaks and special characters in a string.
   * @param {string} originalString - The string to escape.
   * @returns {string} The fully escaped string.
   */
  static escapeQueryAll(originalString) {
    return this.escapeSpecialCharacter(this.escapeBreakLine(originalString));
  }
}

/**
 * Formats generator values to a string.
 * @param {Generator} generator - The generator to format.
 * @returns {string} Formatted string of generator values.
 */
function formatValuesToString(generator) {
  return Array.from(generator).join('\n');
}

/**
 * Composable for handling Looker Vertex messages.
 * @param {Object} core40SDK - The Looker Core 4.0 SDK.
 * @returns {Object} An object containing loading state, results, and sendMessage function.
 */
export const useLookerVertexMessage = (core40SDK) => {
  const loading = ref(false);
  const results = ref();

  const VERTEX_BIGQUERY_LOOKER_CONNECTION_NAME = process.env.VERTEX_BIGQUERY_LOOKER_CONNECTION_NAME || '';
  const VERTEX_BIGQUERY_MODEL_ID = process.env.VERTEX_BIGQUERY_MODEL_ID || '';

  /**
   * Generates SQL for the Vertex AI model.
   * @param {string} model_id - The ID of the Vertex AI model.
   * @param {string} prompt - The prompt for the model.
   * @param {number} temperature - The temperature parameter for the model.
   * @returns {string} The generated SQL query.
   */
  const generateSQL = (model_id, prompt, temperature) => {
    const escapedPrompt = UtilsHelper.escapeQueryAll(prompt);
    const subselect = `SELECT '${escapedPrompt}' AS prompt`;
    
    return `
      SELECT ml_generate_text_llm_result AS generated_content
      FROM ML.GENERATE_TEXT(
        MODEL \`${model_id}\`,
        (${subselect}),
        STRUCT(
          ${temperature} AS temperature,
          1024 AS max_output_tokens,
          0.98 AS top_p,
          TRUE AS flatten_json_output,
          1 AS top_k
        )
      )
    `;
  };

  /**
   * Executes a Vertex BigQuery request.
   * @param {string} contents - The contents of the query.
   * @param {number} temperature - The temperature parameter for the model.
   * @returns {Promise<string>} The cleaned response from the query.
   */
  const vertexBigQuery = async (contents, temperature) => {
    const createSQLQuery = await core40SDK.ok(
      core40SDK.create_sql_query({
        connection_name: VERTEX_BIGQUERY_LOOKER_CONNECTION_NAME,
        sql: generateSQL(VERTEX_BIGQUERY_MODEL_ID, contents, temperature),
      })
    );

    if (createSQLQuery.slug) {
      const runSQLQuery = await core40SDK.ok(
        core40SDK.run_sql_query(createSQLQuery.slug, 'json')
      );
      const exploreData = runSQLQuery[0]['generated_content'];

      return exploreData.replace(/```json/g, '').replace(/```/g, '').trim();
    }
  };

  /**
   * Sends a message to the Vertex AI model.
   * @param {Object} fields - The query metadata fields.
   * @param {Generator} data - The generator containing the query data.
   * @param {string} type - The type of action to perform (e.g., 'summarize' or 'predict').
   * @param {number} temperature - The temperature parameter for the model.
   * @param {string} additionalContext - Additional context provided by the user.
   * @returns {Promise<void>}
   */
  const sendMessage = async (fields, data, type, temperature, additionalContext) => {
    loading.value = true;
    const contents = `
      Context
      ----------

      You are a developer who will either provide a rich summary or forecast given a query's result set and some metadata in a paragraph and under 50 words. 
      
      Instructions:
        - use the Type to inform what action to perform
        - always return your response in detailed markdown, use the markdown formatting instructions
        - if summarize, use the query metadata to understand the nature of the query and then summarize the returned data
        - if predict, use query data and try and predict future values
        - use the user provided context(if any) to further customize and refine your response
        
      Type
      ----------
      ${type}

      Query Metadata
      ----------
            
      Metadata: ${JSON.stringify(fields)}

      User Provided Context
      ----------

      ${UtilsHelper.escapeQueryAll(additionalContext)}

      Data
      ----------

      ${formatValuesToString(data)}

      Markdown Formatting Instructions
      ----------

      When summarizing data, follow these guidelines to ensure clear and well-formatted markdown output.
      
      Use appropriate header levels (H1, H2, H3) to organize content hierarchically:
          - H1 for the main title, H2 for major sections, H3 for subsections

      Format numerical values consistently:
          - Use commas for thousands separators (e.g., 1,234,567)
          - Round decimals to 2 places unless more precision is necessary
          - Include relevant units (e.g., $1,234.56, 45%)

      Utilize bold text for emphasis on key points or important data.
      Employ bullet points or numbered lists for clarity:
          - Use bullet points for unordered lists
          - Use numbered lists for sequential information or ranked items

      Create tables for structured data comparisons:
          - Column 1Column 2Column 3Data 1Data 2Data 3

      Use code blocks for any code snippets or technical information:
          - CopyExample code or technical data here

      Include blockquotes for notable statements or findings:
          - Important quote or key takeaway

      Employ italics for definitions or to provide additional context.

      Use horizontal rules to separate major sections:

      Include hyperlinks when referencing external sources:
          - Link text

      Remember to maintain consistent formatting throughout the summary and use white space effectively to enhance readability.

      Output
      ----------
    `;

    try {
      const response = await vertexBigQuery(contents, temperature);
      results.value = response;
    } catch (e) {
      results.value = e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    results,
    sendMessage
  };
};