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

variable "api_rate_limit" {
  type        = number
  description = "API Gateway steady-state requests per second (cost / abuse cap)"
  default     = 10
}

variable "api_burst_limit" {
  type        = number
  description = "API Gateway burst requests (cost / abuse cap)"
  default     = 20
}

variable "lambda_reserved_concurrency" {
  type        = number
  description = "Max concurrent Lambda executions. This is the hard spend cap."
  default     = 5
}

variable "monthly_budget_usd" {
  type        = string
  description = "AWS Budget amount in USD"
  default     = "10"
}

variable "budget_notification_email" {
  type        = string
  description = "Email for budget alerts. Leave empty to skip creating a budget."
  default     = ""
}

variable "invocation_alarm_threshold" {
  type        = number
  description = "CloudWatch alarm if Lambda invocations in an hour exceed this"
  default     = 3000
}

variable "admin_api_key" {
  type        = string
  description = "Optional override for the review API key. Leave empty to auto-generate one."
  default     = ""
  sensitive   = true
}
