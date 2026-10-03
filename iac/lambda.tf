data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api_lambda" {
  name               = "${var.project_name}-${var.environment}-api-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "api_lambda" {
  statement {
    sid = "Logs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"]
  }

  statement {
    sid = "Dynamo"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:GetItem",
      "dynamodb:DeleteItem",
    ]
    resources = [aws_dynamodb_table.high_scores.arn]
  }
}

resource "aws_iam_role_policy" "api_lambda" {
  name   = "${var.project_name}-${var.environment}-api-lambda"
  role   = aws_iam_role.api_lambda.id
  policy = data.aws_iam_policy_document.api_lambda.json
}

resource "aws_cloudwatch_log_group" "api_lambda" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-api"
  retention_in_days = 14
}

resource "aws_lambda_function" "api" {
  function_name                    = "${var.project_name}-${var.environment}-api"
  role                             = aws_iam_role.api_lambda.arn
  handler                          = "app.main.handler"
  runtime                          = "python3.12"
  filename                         = var.lambda_zip_path
  source_code_hash                 = filebase64sha256(var.lambda_zip_path)
  timeout                          = 5
  memory_size                      = 256
  reserved_concurrent_executions   = var.lambda_reserved_concurrency

  environment {
    variables = {
      HIGH_SCORES_TABLE = aws_dynamodb_table.high_scores.name
      CORS_ORIGINS      = join(",", var.cors_origins)
      MAX_BODY_BYTES    = "4096"
      ADMIN_API_KEY     = aws_ssm_parameter.admin_api_key.value
    }
  }

  depends_on = [aws_cloudwatch_log_group.api_lambda]
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
