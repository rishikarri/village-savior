# Infrastructure

Terraform for AWS: S3 + CloudFront (React), Lambda + HTTP API (FastAPI), DynamoDB (high scores).

## Prereqs

- Terraform >= 1.5
- AWS credentials
- Pack the Lambda zip from `backend/`:

```bash
chmod +x backend/scripts/package.sh
backend/scripts/package.sh
```

## Apply

```bash
cd iac
terraform init
terraform plan
terraform apply
```

After apply, set `VITE_API_URL` to the `api_url` output, rebuild the frontend, and sync `frontend/dist` to the frontend S3 bucket.

Then invalidate CloudFront:

```bash
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```
