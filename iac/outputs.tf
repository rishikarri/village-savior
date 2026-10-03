output "api_url" {
  value       = aws_apigatewayv2_api.http.api_endpoint
  description = "Paste this into frontend/config.js as apiUrl"
}

output "high_scores_table" {
  value       = aws_dynamodb_table.high_scores.name
  description = "DynamoDB table. Query pk=PENDING to review submissions."
}

output "admin_api_key_parameter" {
  value       = aws_ssm_parameter.admin_api_key.name
  description = "SSM parameter that holds the review API key"
}

output "frontend_bucket" {
  value       = var.create_frontend ? aws_s3_bucket.frontend[0].bucket : null
  description = "Only set when create_frontend=true"
}

output "cloudfront_domain" {
  value       = var.create_frontend ? aws_cloudfront_distribution.frontend[0].domain_name : null
  description = "Only set when create_frontend=true"
}
