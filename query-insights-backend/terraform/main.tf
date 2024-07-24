provider "google" {
  project = var.project_id
}

module "base-project-services" {
  source                      = "terraform-google-modules/project-factory/google//modules/project_services"
  version                     = "14.2.1"
  disable_services_on_destroy = false

  project_id  = var.project_id
  enable_apis = true

  activate_apis = [
    "serviceusage.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
  ]
}

module "bg-backend-project-services" {
  source                      = "terraform-google-modules/project-factory/google//modules/project_services"
  version                     = "14.2.1"
  disable_services_on_destroy = false

  project_id  = var.project_id
  enable_apis = true

  activate_apis = [
    "aiplatform.googleapis.com",
    "bigquery.googleapis.com",
  ]

  depends_on = [module.base-project-services]
}

resource "time_sleep" "wait_after_apis_activate" {
  depends_on      = [module.cf-backend-project-services, module.bg-backend-project-services]
  create_duration = "120s"
}

resource "google_bigquery_dataset" "dataset" {
  dataset_id    = var.dataset_id_name
  friendly_name = var.dataset_id_name
  description   = "big query dataset for examples"
  location      = var.deployment_region
  depends_on    = [time_sleep.wait_after_apis_activate]
}

module "bigquery_backend" {
  source            = "./bigquery"
  project_id        = var.project_id
  deployment_region = var.deployment_region
  dataset_id        = var.dataset_id_name

  depends_on = [time_sleep.wait_after_apis_activate, google_bigquery_dataset.dataset]
}