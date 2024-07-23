import { ref,watch,computed, toValue, toRaw, unref } from 'vue'
import process from 'process'

export class UtilsHelper {
    /**
     * Adds an extra slash to line breaks \n -> \\n
     * @param originalString
     * @returns
     */
     static escapeBreakLine(originalString) {
      return originalString.replace(/\n/g, '\\n')
    }
  
     static escapeQueryAll(originalString) {
      return UtilsHelper.escapeSpecialCharacter(UtilsHelper.escapeBreakLine(originalString))
    }
  
    /**
     * Adds an extra slash to line breaks \n -> \\n
     * @param originalString
     * @returns
     */
     static escapeSpecialCharacter(originalString) {
      let fixedString = originalString
      fixedString = fixedString.replace(/'/g, "\\'")
      return fixedString
    }
  
    /**
     * Returns first element from Array
     * @param array
     * @returns
     */
     static firstElement(array) {
      const [firstElement] = array
      return firstElement
    }
  
    /**
     * Replaces ```JSON with ```
     * @param originalString
     * @returns
     */
     static cleanResult(originalString) {
      let fixedString = originalString
      fixedString = fixedString.replace('```json', '')
      fixedString = fixedString.replace('```JSON', '')
      fixedString = fixedString.replace('```', '')
      return fixedString
    }
  
    /**
     * Remove duplicates from Array
     * @param array
     * @returns
     */
     static removeDuplicates(array) {
      return Array.from(new Set(array))
    }
  
     static isNumber = (value) => isNaN(Number(value)) === false
  
     static enumToArray(enumerator) {
      return Object.keys(enumerator)
        .filter(this.isNumber)
        .map((key) => enumerator[key])
    }
  
     static getQueryFromPrompt(singleLineString, useNativeBQ) {
      let subselect = ''
      if (useNativeBQ == false) {
        subselect = `SELECT llm.bq_vertex_remote('` + singleLineString + `') AS r, '' AS status `
      } else {
        subselect = `SELECT '` + singleLineString + `' AS prompt`
      }
      return subselect
    }
  }

  
function formatValuesToString(generator) {
    return Array.from(generator).join('\n');
}

export const useLookerVertexMessage = (
    core40SDK
) => {
    const loading = ref(false)
    const results = ref()
    // bigquery
    const VERTEX_BIGQUERY_LOOKER_CONNECTION_NAME = process.env.VUE_APP_VERTEX_BIGQUERY_LOOKER_CONNECTION_NAME || ''
    const VERTEX_BIGQUERY_MODEL_ID = process.env.VUE_APP_VERTEX_BIGQUERY_MODEL_ID || ''

    const generateSQL = (
        model_id,
        prompt,
        temperature,
        parameters,
    ) => {
        const escapedPrompt = UtilsHelper.escapeQueryAll(prompt)
        const subselect = `SELECT '` + escapedPrompt + `' AS prompt`
      
        return `
        
          SELECT ml_generate_text_llm_result AS generated_content
          FROM
          ML.GENERATE_TEXT(
              MODEL \`${model_id}\`,
              (
                ${subselect}
              ),
              STRUCT(
              ${temperature} AS temperature,
              1024 AS max_output_tokens,
              0.98 AS top_p,
              TRUE AS flatten_json_output,
              1 AS top_k)
            )
        
            `
    }

    const vertexBigQuery = async (
        contents,
        temperature,
        parameters,
    ) => {
        const createSQLQuery = await core40SDK.ok(
          core40SDK.create_sql_query({
            connection_name: VERTEX_BIGQUERY_LOOKER_CONNECTION_NAME,
            sql: generateSQL(VERTEX_BIGQUERY_MODEL_ID, contents, temperature, parameters),
          }),
        )
    
        if (createSQLQuery.slug) {
          const runSQLQuery = await core40SDK.ok(
            core40SDK.run_sql_query(createSQLQuery.slug, 'json'),
          )
          const exploreData = await runSQLQuery[0]['generated_content']
    
          // clean up the data by removing backticks
          const cleanExploreData = exploreData
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim()
    
          return cleanExploreData
        }
    }

    const sendMessage = async (
        fields,
        data,
        type,
        temperature,
        additionalContext
    ) => {
        loading.value = true
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
              
        Metadata: ${JSON.stringify(fields)}\n

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
    `
      const parameters = {
        max_output_tokens: 1000,
      }
      console.log(contents)
      try {
        const response = await vertexBigQuery(contents, temperature, parameters)
        loading.value = false
        results.value = response
      } catch(e) {
        loading.value = false
        results.value = e
      }
    }

    return {
        loading,
        results,
        sendMessage
    }
}