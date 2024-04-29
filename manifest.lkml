project_name: "counter-vue"

application: counter-vue {
  label: "Counter (Vue)"
  url: "https://localhost:8081/bundle.js"
  # file: "bundle.js"
  entitlements: {
    core_api_methods: ["me"]
  }
}
