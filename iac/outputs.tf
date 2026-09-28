output "api_url" {
  value       = aws_apigatewayv2_api.http.api_endpoint
  description = "HTTP API base URL"
}

output "frontend_bucket" {
  value       = aws_s3_bucket.frontend.bucket
  description = "S3 bucket for the React build"
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "CloudFront domain for the frontend"
}

output "high_scores_table" {
  value       = aws_dynamodb_table.high_scores.name
  description = "DynamoDB table for high scores"
}
