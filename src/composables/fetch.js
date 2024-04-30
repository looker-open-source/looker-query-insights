// fetch.js
import { ref,watch } from 'vue'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { exploreContext, joinContext, viewContext } from '../static/context'

function pretty(str) {
  console.log(str.substring(str.indexOf("{")).replace(/^`+|`+$/g, '').trim())
  return str.substring(str.indexOf("{")).replace(/^`+|`+$/g, '').trim()
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY)

const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro-latest", 
  generationConfig: {
    maxOutputTokens: 800024, 
    candidateCount: 1, 
    temperature: 0.4
  }
});

export function useFetch(fileData) {
  const data = ref(null)
  const json = ref(null)
  const error = ref(null)
  const events = ref(['starting'])
  const isLoaded = ref(false)
  watch(fileData, () => {
    events.value.push('checking')
    if(fileData.value !== null) {
      events.value.push('found')
      setTimeout(async() => {
        const rand = Math.random() 
        
        if(rand < 0.003) {
          error.value = "404: Failed to fetch data"
        }
        
        events.value.push('prompt')
        
        const prompt = `You are going to receive an image of a database ERD. To your best knowledge, please convert this ERD using the following instructions:
        
        Instructions
        ____________

        - For every table referenced in the ERD, create a corresponding LookML View File.
        - For each view file created, create a dimension for each column referenced with the appropriate sql reference, type and add a label and description describing the field for business use.
        - Additionally for each view file created, add new dimensions and measures (sum, avg, min, max, etc.) for aggregating common numerical columns or tiering specific dimensions.
        - Once the view files are created, please create a LookML model file 
        - Include in the model file a connection parameter, a datagroup for cache based on a daily cache strategy and a single Looker explore that joins all of the tables in the ERD together correctly.
        - Each view and explore file should be wrapped in \`\`\`lookml \`\`\`

        Use the following context to help create the lookml content:

        Explore Documentation: ${exploreContext}

        View Documentation: 
        ${viewContext}

        View Instructions:
        - Make sure to always include a sql table name or derived table if asked for
        - If a derived table is required make sure to persist the derived table
        - Always include drill fields
        - Make sure to have a view label and a description for the view
        - For each dimension and measure make sure to include labels and descriptions
        - Create common measures where you see fit for each relevant dimensions in each view

        Join Documentation: ${joinContext}

        Join Instructions:
        - make sure to follow the join documentation for the correct format for each join
        - always join using sql_on
        - always include the join type and relationship

        -----------------------------

        Output these in LookML format. Never include the instructions in your response. It should only be the outputted LookML. Always complete the views and explores, as in finish every join and model every field.
        `;
        // const prompt = `You are going to receive an image of a receipt, please use the instructions below to extract the specific details from the receipt and format it into a JSON object:
        
        // Instructions
        // ____________

        // - Extract the merchant name; labeled as \`merchant_name\`
        // - Extract the merchant address or place of purchase; labeled as \`purchase_location\`
        // - Extract the date & time of purchase; labeled as \`purchase_time\`
        // - Extract each line item, the amount, and discount, item name and quantity; format this into an array of json objects representing each line item; labeled as \`line_items\`
        // - Extract the total amount; labeled as \`total_amount\`
        // - Extract the total discount; labeled as \`total_discount\`
        // - Extract the total tax; labeled as \`total_tax\`
        // - Extract the total; labeled as \`total\`
        
        // Format the data in dollar amounts. Don't include any data that is not in the receipt itself.
        
        // Output this in JSON format.
        // `
        
        const image = {
          inlineData: JSON.parse(JSON.stringify(fileData.value))[0]
        }
        
        events.value.push('parsing')
        const result = await model.generateContentStream([prompt,image])

        // json.value = result.response.text()
        //JSON.parse(pretty(result.response.text()))
        json.value = []

        events.value.push('summary')
        // const summaryPrompt = `
        // Given the following JSON of a receipt, please provide a very concise and brief summary on the spend and receipt overview.

        // Instructions
        // ____________
        // - Use a header for the title of the summary
        // - The summary itself should be rich text and not a markdown list

        // JSON:
        // ${JSON.stringify(result.response.text())}

        // Output this in markdown format.
        // `
        // const summaryResult = await model.generateContent([summaryPrompt])
        
        // .generateContentStream([prompt,image])
        events.value.push('finished')
        
        // data.value = summaryResult.response.text()
        for await (const item of result.stream) {
          data.value += item.text()
        }
        
        isLoaded.value = true
      },2000)
    }
  })

  return { data, events, json, error, isLoaded }
}