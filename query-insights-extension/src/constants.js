export const vizConfigSettings = {
    temperature: {
        type: "number",
        label: "1. Set Model Temperature",
        display: "number",
        default: 0.2,
        required: true,
        section: 'LLM'
    },
    prompt: {
        type: "string",
        label: "2. Set Prompt Type",
        values: [{ Summary: "summarize" }, { Forecast: "predict" }],
        display: "radio",
        default: "summarize",
        required: true,
        section: 'LLM'
    },
    query: {
        type: "string",
        label: "3. Set Query Description / Context",
        display: "text",
        required: false,
        section: 'LLM'
    },
    themeColor: {
      order: 1,
      type: "array",
      label: "Configure Theme Color",
      display: "colors",
      section: "Display"
    },
    backgroundColor: {
        type: "array",
        label: "Configure Background Color",
        display: "color",
        section: "Display"
    },
    cardColor: {
      type: "array",
      label: "Configure Card Color",
      display: "color",
      section: "Display"
    },
    headerColor: {
        type: "array",
        label: "Configure Header Color",
        display: "color",
        section: "Display"
    },
    textColor: {
      type: "array",
      label: "Configure Text Color",
      display: "color",
      section: "Display"
    },
    shadowColor: {
      type: "array",
      label: "Configure Shadow Color",
      display: "color",
      section: "Display"
    },
    insightImage: {
      type: "string",
      label: "Image URL",
      default: "https://img.icons8.com/ios/50/light-on--v1.png",
      section: "Display"
    }
  }