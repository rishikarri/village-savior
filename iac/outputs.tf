output "api_url" {
  value       = aws_apigatewayv2_api.http.api_endpoint
  description = "Set this as VITE_API_URL in Amplify (or bake it in before an S3 upload)"
}

output "high_scores_table" {
  value       = aws_dynamodb_table.high_scores.name
  description = "DynamoDB table for high scores"
}

output "frontend_bucket" {
  value       = var.create_frontend ? aws_s3_bucket.frontend[0].bucket : null
  description = "Only set when create_frontend=true"
}

output "cloudfront_domain" {
  value       = var.create_frontend ? aws_cloudfront_distribution.frontend[0].domain_name : null
  description = "Only set when create_frontend=true"
}
