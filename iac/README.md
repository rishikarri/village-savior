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

Put the `api_url` output in `frontend/config.js`:

```js
window.VILLAGE_SAVIOR_CONFIG = {
  apiUrl: "https://xxxx.execute-api.us-east-1.amazonaws.com"
};
```

Localhost ignores this and uses `http://127.0.0.1:8000`.

### Amplify Hosting (push to `main`)

This replaces “upload files to S3”. The site is static HTML, so there is no npm build.

1. AWS Console → **Amplify** → **Create new app** → **Host web app** → connect this GitHub repo.
2. Branch: **`main`**. App root: `frontend` (root `amplify.yml` already sets this).
3. Save. Amplify will deploy on every push to `main`.
4. **Domain management** → add `village-savior-game.com` (and `www` if you use it).
   After DNS is on Amplify, stop uploading the old files to S3 so the two pipelines don’t fight.

### Keep uploading to your current S3 bucket

```bash
cd frontend
aws s3 sync . s3://YOUR_EXISTING_BUCKET --delete \
  --exclude ".gitignore" --exclude ".amplifyignore" --exclude "README.md"
```

If CloudFront sits in front, invalidate `/*` after the sync.

## Frontend Terraform (optional)

Leave `create_frontend = false` (default) so Terraform does not create a second site.
Set it to `true` only if you want a brand-new S3 + CloudFront distribution instead of Amplify / your current bucket.

## Cost and abuse caps

The high-score API is public. Nothing can make a public POST route “unhackable,” but these limits keep a flood from running up the bill:

- API Gateway throttle: 10 requests/sec, burst 20
- Lambda reserved concurrency: 5 (hard cap on parallel work)
- POST only accepted from your site origin (browsers send this; raw curl does not unless spoofed)
- Body capped at 4 KB; scores capped at 10,000; usernames sanitized
- CloudWatch alarms on invocation spikes and Lambda throttles
- Optional AWS Budget email: set `budget_notification_email` in Terraform

Share **village-savior-game.com** on X, not the `execute-api` URL.

To get budget emails:

```hcl
# iac/terraform.tfvars
budget_notification_email = "you@example.com"
monthly_budget_usd        = "10"
```

## Reviewing high scores

Player submissions land as **pending**. They do not appear on the public board until you approve them.

**In the AWS console:** DynamoDB → table `village-savior-dev-high-scores` (name from Terraform output) → Explore table items → Query `pk` = `PENDING`.
You will see `username`, `high_score`, and `game_state`. Approved scores live under `pk` = `HIGH_SCORE`. Rejected ones under `pk` = `REJECTED`.

**Or via the API:**

```bash
KEY=$(aws ssm get-parameter --name /village-savior/dev/admin-api-key --with-decryption --query Parameter.Value --output text)
API=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com

curl -s "$API/api/v1/admin/pending" -H "X-Admin-Key: $KEY"
curl -s -X POST "$API/api/v1/admin/high-scores/SCORE_ID/approve" -H "X-Admin-Key: $KEY"
curl -s -X POST "$API/api/v1/admin/high-scores/SCORE_ID/reject" -H "X-Admin-Key: $KEY"
```


