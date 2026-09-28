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
  default = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://village-savior-game.com",
    "https://www.village-savior-game.com",
  ]
}

variable "lambda_zip_path" {
  type        = string
  description = "Path to the packaged backend lambda zip"
  default     = "../backend/lambda.zip"
}

variable "create_frontend" {
  type        = bool
  description = "Create a new S3/CloudFront frontend. Leave false if Amplify or an existing S3 site already serves village-savior-game.com."
  default     = false
}
