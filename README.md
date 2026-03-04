## MayDove MVP

Visual-first mind mapping with platform-aware content generation (LinkedIn + Facebook + Instagram).

### Tech

- Next.js (App Router)
- React Flow (`@xyflow/react`)
- Tailwind CSS
- Prisma + PostgreSQL
- Gemini (for generation)

---

### Local Setup

#### Install
```bash
npm install
```

#### Env

Copy `env.example` → `.env` (or set env vars in your host)

| Variable | Required | Default |
|---|---|---|
| `DATABASE_URL` | ✅ | — |
| `GEMINI_API_KEY` | ✅ | — |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | — |
| `CLERK_SECRET_KEY` | ✅ | — |
| `GEMINI_MODEL` | ❌ | `gemini-2.5-flash-lite` |
| `GEMINI_BASE_URL` | ❌ | `https://aiplatform.googleapis.com/v1` |

#### Database
```bash
npm run prisma:migrate
```

#### Dev
```bash
npm run dev
```

---

### App Routes

| Route | Description |
|---|---|
| `/` | Landing |
| `/dashboard` | MayDove app |
| `/dashboard/new` | Create a map |
| `/dashboard/[mapId]` | Edit a map |

---

### Deployment (Google Cloud Run)

#### Prerequisites

- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- Docker installed (for local builds)
- GCP project with Cloud Build, Cloud Run, and Secret Manager APIs enabled

#### Secrets

Store the following in [GCP Secret Manager](https://console.cloud.google.com/security/secret-manager):

| Secret Name | Value |
|---|---|
| `BANCO_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |
| `BANCO_CLERK_SECRET_KEY` | Your Clerk secret key |

Grant the Cloud Build service account access to each secret:
```bash
gcloud secrets add-iam-policy-binding BANCO_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
  --project=YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding BANCO_CLERK_SECRET_KEY \
  --project=YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### IAM Roles for Cloud Build Service Account
```bash
# Deploy to Cloud Run
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/run.developer"

# Act as compute service account
gcloud iam service-accounts add-iam-policy-binding \
  YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --member="serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

#### Deploy
```bash
gcloud builds submit --config cloudbuild.yaml .
```

This will:
1. Build the Docker image with Clerk secrets injected at build time
2. Push the image to Google Container Registry
3. Deploy to Cloud Run in `us-east1` with 256Mi memory

#### `cloudbuild.yaml`
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - build
      - --build-arg
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      - --build-arg
      - CLERK_SECRET_KEY
      - -t
      - gcr.io/$PROJECT_ID/banco-frontend-cloud-run
      - .
    secretEnv:
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      - CLERK_SECRET_KEY

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - push
      - gcr.io/$PROJECT_ID/banco-frontend-cloud-run

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - beta
      - run
      - deploy
      - banco-frontend
      - --image=gcr.io/$PROJECT_ID/banco-frontend-cloud-run
      - --platform=managed
      - --memory=256Mi
      - --region=us-east1

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/BANCO_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/versions/latest
      env: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    - versionName: projects/$PROJECT_ID/secrets/BANCO_CLERK_SECRET_KEY/versions/latest
      env: CLERK_SECRET_KEY

images:
  - gcr.io/$PROJECT_ID/banco-frontend-cloud-run
```