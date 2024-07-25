application: query_insights {
    label: "Query Insights"
    # url: "https://localhost:3000/bundle.js"
    file: "bundle.js"
    mount_points: {
      dashboard_vis: yes
      dashboard_tile: yes
      standalone: no
    }
    entitlements: {
      core_api_methods: ["create_sql_query","run_sql_query","run_query","create_query"]
      navigation: yes
      use_embeds: yes
      use_iframes: yes
      new_window: yes
      new_window_external_urls: ["https://developers.generativeai.google/*"]
      local_storage: yes
    }
}