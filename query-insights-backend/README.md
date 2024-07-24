# Query Insights Backend

## Overview

This Terraform configuration establishes a backend for the Query Insights Extension on Google Cloud Platform (GCP), facilitating interaction with the Gemini Pro model of Vertex AI. The setup supports one option: a BigQuery backend, each acting as a proxy/relay for running content through the model.

## Prerequisites

- Terraform installed on your machine.
- Access to a GCP account with permission to create and manage resources.
- A GCP project & ID where the resources will be deployed.

## Configuration and Deployment

### BigQuery Backend

To deploy the BigQuery backend:
**Replace <PROJECT_ID> in the below script with your GCP project id**

```bash
cd terraform 
export TF_VAR_project_id=<PROJECT_ID>
terraform init
terraform plan
terraform apply
```

You will have to wait 1-2 minutes for the APIs to turn on. You will also have to wait a couple of minutes for the service account for the BigQuery connection to appear.

If you use the defaults, you can test whether everything is working and deployed by running:

```sql
    SELECT ml_generate_text_llm_result AS generated_content
    FROM
    ML.GENERATE_TEXT(
        MODEL `query_insights.query_insights_llm`,
        (
          SELECT "hi" as prompt
        ),
        STRUCT(
        0.05 AS temperature,
        1024 AS max_output_tokens,
        0.98 AS top_p,
        TRUE AS flatten_json_output,
        1 AS top_k)
      )
```

Also, as part of the BigQuery backend setup, we create the Service Account that can be used to connect Looker to the BigQuery dataset to fetch the examples and use the model. You can follow the instructions for creating the connection in Looker here (https://cloud.google.com/looker/docs/db-config-google-bigquery#authentication_with_bigquery_service_accounts). You should be able to pickup the instructions on step 5. 

## Resources Created

- Google BigQuery dataset to connect the BQML model to
- Google BigQuery connection and gemini pro model, if using the BigQuery backend.
- Necessary IAM roles and permissions for the Looker Query Insights Extension to operate.

## Cleaning Up

To remove all resources created by this Terraform configuration either to start from scratch OR tear down the application, run:

```sh
terraform destroy
```

**Note:** This will delete all resources and data. Ensure you have backups if needed.

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository where this configuration is hosted.
