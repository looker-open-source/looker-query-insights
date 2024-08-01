// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
 * @param {Object[]} data - Data array.
 * @returns {string} Formatted string of generator values.
 */
function formatValuesToString(data) {
  // return Array.from(generator).join('\n');
  return data.join('\n')
}

/**
 * 
 * @param {Generator} - the generator to format
 * @param {Number} maxRows - max amount of rows 
 * @param {Number} tokenLimit - model token limit
 * @param {Number} estimateTokens - estimated amount of tokens in response
 * @returns 
 */
const truncateDataForLLM = (data, maxRows, tokenLimit, estimateTokens) => {
  data = Array.from(data)
  if (data.length <= maxRows) {
    return data;
  }

  const halfMax = Math.floor(maxRows / 2);
  let result = [...data.slice(0, halfMax), ...data.slice(-halfMax)];

  while (estimateTokens(result) > tokenLimit && result.length > 2) {
    const removeIndex = result.length > halfMax ? result.length - 1 : halfMax;
    result.splice(removeIndex, 1);
  }
  console.log("Summarizing " + result.length + " rows of the result set")
  return result;
};

const estimateTokens = (arr) => {
  return arr.reduce((sum, item) => sum + JSON.stringify(item).length, 0);
};

/**
 * Composable for handling Looker Vertex messages.
 * @param {Object} core40SDK - The Looker Core 4.0 SDK.
 * @returns {Object} An object containing loading state, results, and sendMessage function.
 */
export const useLookerVertexMessage = (core40SDK) => {
  const loading = ref(false);
  const results = ref();
  const maxRows = 500;
  const tokenLimit = 1000000

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
    const truncatedData = truncateDataForLLM(data, maxRows, tokenLimit, estimateTokens)
    const contents = `
      Context
      ----------

      You are a developer who will either provide a rich summary or analyze the sentiment of given a query's result set and some metadata in a paragraph and under 50 words. 
      
      Instructions:
        - use the Type to inform what action to perform
        - always return your response in detailed markdown, use the markdown formatting instructions
        - do not generate headers or headings (h1, h2 h3 etc) just the text summary
        - if summarize, use the query metadata to understand the nature of the query and then summarize the returned data
        - if sentiment and the data has a lot text data analyze the sentiment of the text
        - use the user provided context(if any) to further customize and refine your response
        - the goal is to take the query data and make it readible within a short amount of time, point out areas of interest summarize long time ranges, among other things
        - don't add next steps, but highlighting key areas of interest is important
        
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

      ${formatValuesToString(truncatedData)}

      Markdown Formatting Instructions
      ----------

      When summarizing data, follow these guidelines to ensure clear and well-formatted markdown output.

      Format numerical values consistently:
          - Use commas for thousands separators (e.g., 1,234,567)
          - Round decimals to 2 places unless more precision is necessary
          - Include relevant units (e.g., $1,234.56, 45%)

      Utilize bold text for emphasis on key points or important data.
      Don't use headers or headings, bullet points, numbered lists, code blocks or tables, keep everything as concise paragraph summaries with no headers (h1, h2,h3).

      Include blockquotes for notable statements or findings:
          - Important quote or key takeaway

      Employ italics for definitions or to provide additional context.

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