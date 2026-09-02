# Running Mesob Financial Portal in Docker

This app is a Create React App (CRA) frontend. It has no backend server in
this repo — the backend is a set of AWS Lambda functions + API Gateway
(see `API_INTEGRATION_SUMMARY.md`, `QUICK_SETUP_PAYMENT_PORTAL.md`) deployed
separately, and the frontend currently ships via `genezio.yaml` (a
serverless static-hosting platform), not a container.

This Dockerfile containerizes the **frontend** so it can be built once and
run identically anywhere: your laptop, CI, or an AWS container service.

## How it works

Two-stage build (`Dockerfile`):

1. **`build` stage** (`node:20-alpine`) — installs deps with `npm ci` and
   runs `npm run build`, same as CRA's normal build.
2. **`production` stage** (`nginx:1.27-alpine`) — copies only the compiled
   `build/` output into an Nginx image and serves it on port 80, with
   `nginx/default.conf` doing SPA fallback (`try_files ... /index.html`) so
   client-side routes from `react-router-dom` work on refresh/deep-link.

The final image ships zero Node.js, zero source code, and zero
`node_modules` — just static HTML/JS/CSS behind Nginx.

### Important: CRA env vars are baked in at build time

`REACT_APP_*` variables (Cognito pool IDs, OAuth client IDs, app URLs — see
`.env.example`) get compiled directly into the JS bundle when `npm run
build` runs. That means:

- They must be supplied as **build args**, not container runtime env vars.
- A single built image is tied to one environment (staging vs production).
  To switch environments you rebuild the image with different `--build-arg`
  values — you can't flip an env var on a running container the way you
  could with a real backend.

## Local usage

```bash
# Production-style: build + serve via Nginx on http://localhost:8080
docker compose build web
docker compose up web

# Or plain docker, passing build args explicitly:
docker build \
  --build-arg REACT_APP_ENV=production \
  --build-arg REACT_APP_PRODUCTION_APP_URL=https://app.meksova.com \
  --build-arg REACT_APP_PRODUCTION_COGNITO_USER_POOL_ID=us-east-1_avAIOjCOE \
  --build-arg REACT_APP_PRODUCTION_COGNITO_CLIENT_ID=6iejj0l52i4qihmmojh88kmvie \
  --build-arg REACT_APP_PRODUCTION_COGNITO_DOMAIN=us-east-1avaiojcoe.auth.us-east-1.amazoncognito.com \
  --build-arg REACT_APP_PRODUCTION_GOOGLE_CLIENT_ID=<id> \
  --build-arg REACT_APP_PRODUCTION_APPLE_CLIENT_ID=com.mesob.financial \
  -t mesob-financial-portal:prod .

docker run -p 8080:80 mesob-financial-portal:prod
```

```bash
# Dev-style: hot-reloading `npm start` on http://localhost:3000, source bind-mounted
docker compose --profile dev up dev
```

`docker-compose.yml` reads build args from a local `.env` file (copy
`.env.example` → `.env` and fill in real values) — compose does **not**
commit or ship that file.

## Deploying this image on AWS (portfolio angle)

Since this produces a standard OCI image, it's deployable to any AWS
container target instead of (or alongside) genezio:

- **ECR** — `docker tag` + `docker push` to a private repository as the
  first step for any of the below.
- **ECS Fargate** — run the Nginx image as a Fargate service behind an ALB;
  no EC2 to manage. This is the most common "containerized frontend on AWS"
  reference architecture.
- **AWS App Runner** — point it at the ECR image; it handles the
  load balancer, scaling, and HTTPS cert for you with less config than ECS.
- **Lambda container images** — not the right fit for *this* static
  frontend, but worth knowing for your applications: the
  `backend-lambda-portal-session.js` / `backend-lambda-stripe-webhook.js`
  functions referenced in `API_INTEGRATION_SUMMARY.md` could themselves be
  packaged as container images (`FROM public.ecr.aws/lambda/nodejs:20`)
  instead of zip uploads, if you want a "Dockerized Lambda" story too.

A minimal CI story: GitHub Actions builds the image on push to `main`,
pushes to ECR, then triggers an ECS service update (or App Runner
auto-deploys on new image digest if you enable that).
