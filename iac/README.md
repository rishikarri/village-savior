# Infrastructure

Terraform deploys the **API only** by default (Lambda, HTTP API, DynamoDB).
The game site stays on your existing S3 → `village-savior-game.com` flow, or on Amplify Hosting.

## 1. Deploy the API

```bash
cd backend
python3 -m pip install -r requirements.txt -t .package
cp -R app .package/app
cd .package && zip -qr ../lambda.zip .
```

Or:

```bash
backend/scripts/package.sh
```

Then:

```bash
cd iac
terraform init
terraform apply
```

Copy the `api_url` output. It looks like `https://xxxx.execute-api.us-east-1.amazonaws.com`.

CORS already allows `https://village-savior-game.com`.

## 2. Hook the frontend to that API

The React app reads `VITE_API_URL` at **build** time.

### Option A — Amplify Hosting (recommended)

This replaces “upload files to S3” with git-push deploys, and you can still use `village-savior-game.com`.

1. AWS Console → **Amplify** → **Create new app** → **Host web app** → connect this GitHub repo.
2. App root / monorepo setting: `frontend` (the root `amplify.yml` already sets `appRoot: frontend`).
3. Build settings should pick up `amplify.yml`.
4. **Environment variables** (for the branch):
   - `VITE_API_URL` = the Terraform `api_url` (no trailing slash)
5. **Domain management** → add `village-savior-game.com` (and `www` if you use it).
   Amplify will ask you to update Route 53 / DNS. After the domain is on Amplify, stop uploading the old static files to S3, or you will have two sources fighting.

Each push to the connected branch rebuilds with the API URL baked in.

### Option B — keep uploading to your current S3 bucket

```bash
cd frontend
VITE_API_URL="https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com" npm run build
aws s3 sync dist/ s3://YOUR_EXISTING_BUCKET --delete
```

Use the same bucket that already feeds `village-savior-game.com`. If CloudFront sits in front, invalidate after upload:

```bash
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## Frontend Terraform (optional)

Leave `create_frontend = false` (default) so Terraform does not create a second site.
Set it to `true` only if you want a brand-new S3 + CloudFront distribution instead of Amplify / your current bucket.
