# Query Insights Extension Frontend Deployment
This documentation outlines the steps required to deploy the Query Insights Extension with the desired backend for generating summaries of data from an Explore Query. It assumes a Looker Instance is available with a suitable LookML Model and Explore configured.

## 1. LLM Integration

This section describes how to set up the LLM Integration for the Query Insights.

### Getting Started for Development

1. Clone or download a copy of this repository to your development machine.
   If you have a git ssh_config:
   ```bash
   # cd ~/ Optional. your user directory is usually a good place to git clone to.
   git clone git@github.com:looker-open-source/looker-query-insights.git
   ```

   If not:
   ```bash
   # cd ~/ Optional. your user directory is usually a good place to git clone to.
   git clone https://github.com/looker-open-source/looker-query-insights.git
   ```
   Alternatively, open up this repository in: &nbsp;
   [![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://shell.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https://github.com/looker-open-source/looker-query-insights.git&cloudshell_workspace=query-insights-extension)

2. Install a backend using terraform by [following the instructions](../query-insights-backend/README.md)

3. Save the backend details for use by the extension framework:
   
   * The BigQuery example dataset
   * If you're using the BigQuery backend, the model id that allows communication with Gemini

## 2. Looker Extension Framework Setup
**Important** If you are not familiar with the Looker Extension Framework, please review [this documentation](https://developers.looker.com/extensions/overview/) first before moving forward.


### Getting Started for Development

1. From the Query Insights root directory (`cd`) to the Query Insights Extension folder. *If deploying from Cloudshell, you should already be in this folder*.

   ```bash
   cd query-insights-extension
   ```

2. Install the dependencies with [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). *Please follow the hyperlinked directions for installing node and npm on your machine. Skip this step if deploying from Cloud Shell method above.* Additionally if you need to work across multiple Node versions, `nvm` can be used switch between and install different node versions.

   ```bash
   npm install
   ```

   > You may need to update your Node version or use a [Node version manager](https://github.com/nvm-sh/nvm) to change your Node version.

3. Create a new BigQuery connection in Looker that will allow us to get the examples from the database. You will use that in the VERTEX_BIGQUERY_LOOKER_CONNECTION_NAME below.

4. Ensure all the appropriate environment variables are set in the `.env` file. There is a .env-examples files in the looker-explore-assitant package, you can edit it and save as .env. 

   Regardless of the backend, you're going to need:

   ```
   VERTEX_BIGQUERY_LOOKER_CONNECTION_NAME=<This is the connection name in Looker with the BQ project that has access to the remote connection and model>
   ```

   If you're using the BigQuery Backend replace the default:

   ```
   VERTEX_BIGQUERY_MODEL_ID=<This is the model id that you want to use for prediction>
   ```

5. Start the development server (**Skip this step if you aren't changing the UI code, and proceed to the next step then to deployment**)
   **IMPORTANT** If you are running the extension from a VM or another remote machine, you will need to Port Forward to the machine where you are accessing the Looker Instance from (ie. If you are accessing Looker from your local machine, run the following command there.). Here's a boilerplate example for port forwarding the remote port 8080 to the local port 8080:
   `ssh username@host -L 8080:localhost:8080`.

   ```bash
   npm run start
   ```

   Great! Your extension is now running and serving the JavaScript at https://localhost:8080/bundle.js.

## 3. Looker Extension LookML Project Setup

1. Now log in to Looker and create a new project or use an existing project.

   This is found under **Develop** => **Manage LookML Projects** => **New LookML Project**.

   You'll want to select "Blank Project" as your "Starting Point". You'll now have a new project with no files.

   1. In your copy of the extension project you have a `manifest.lkml` file.

   You can either drag & upload this file into your Looker project, or create a `manifest.lkml` with the same content. Change the `id`, `label`, or `url` as needed.  Your manifest.lkml file should look like the below examples.

   ```lookml
   application: query_insights {
    label: "Query Insights"
    # url: "https://localhost:3000/bundle.js"
    file: "bundle.js"
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
   ```

2. Create a `model` LookML file in your project. The name doesn't matter. The model and connection won't be used, and in the future this step may be eliminated.

   - Add a connection in this model. It can be any connection, it doesn't matter which.
   - [Configure the model you created](https://docs.looker.com/data-modeling/getting-started/create-projects#configuring_a_model) so that it has access to some connection.

3. Connect your new project to Git. You can do this multiple ways:

   - Create a new repository on GitHub or a similar service, and follow the instructions to [connect your project to Git](https://docs.looker.com/data-modeling/getting-started/setting-up-git-connection)
   - A simpler but less powerful approach is to set up git with the "Bare" repository option which does not require connecting to an external Git Service.

4. Commit your changes and deploy your them to production through the Project UI.

5. Reload the page and in the left navigation panel click on the Application drop-down. You should see your extension in the list.

6. The extension will load the JavaScript from the `url` provided in the `application` definition if running locally OR from the `file` specified if skipping the local development step. By default, this is https://localhost:8080/bundle.js for `url` and `bundle.js` if `file`. If you change the port your server runs on in the package.json, you will need to also update it in the manifest.lkml.

7. Refreshing the extension page will bring in any new code changes from the extension template, although some changes will hot reload.

## 4. Deployment

The process above requires your local development server to be running to load the extension code. To allow other people to use the extension, a production build of the extension needs to be run. As the kitchensink uses code splitting to reduce the size of the initially loaded bundle, multiple JavaScript files are generated.

1. In your extension project directory on your development machine, build the extension by running the command `npm run build`.
2. Drag and drop the `bundle.js` JavaScript file contained in the `dist` directory into the Looker project interface.
3. Modify your `manifest.lkml` to use `file` instead of `url` and point it at the `bundle.js` file.

Note that the additional JavaScript files generated during the production build process do not have to be mentioned in the manifest. These files will be loaded dynamically by the extension as and when they are needed. Note that to utilize code splitting, the Looker server must be at version 7.21 or above.

---