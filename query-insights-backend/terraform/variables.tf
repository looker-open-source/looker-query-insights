#
# REQUIRED VARIABLES
#

variable "project_id" {
  type = string
  description = "GCP Project ID"
}

#
# VARIABLES WITH DEFAULTS
#

variable "deployment_region" {
  type = string
  description = "Region to deploy the Remote Connection. Example: us-central1"
  default = "us-central1"
}

#
# BIGQUERY VARIABLES
# 

variable "dataset_id_name" {
    type = string
    default = "query_insights"
}