variable "aws_region" {
  type        = string
  description = "AWS region for all resources"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Name prefix for AWS resources"
  default     = "village-savior"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
  default     = "dev"
}

variable "cors_origins" {
  type        = list(string)
  description = "Allowed browser origins for the API"
  default     = ["http://localhost:5173"]
}

variable "lambda_zip_path" {
  type        = string
  description = "Path to the packaged backend lambda zip"
  default     = "../backend/lambda.zip"
}
