resource "random_password" "admin_api_key" {
  length  = 32
  special = false
}

resource "aws_ssm_parameter" "admin_api_key" {
  name  = "/${var.project_name}/${var.environment}/admin-api-key"
  type  = "SecureString"
  value = var.admin_api_key != "" ? var.admin_api_key : random_password.admin_api_key.result
}
