# RunPod H100 Inference Switch

This document explains how to switch Tayseer from local Qwen2.5 14B inference to the RunPod H100 instance running Qwen2.5 72B for the live demo.

---

## When to Use RunPod

Use RunPod when the live demo requires the highest quality responses and the audience will be evaluating decision rationale quality. The 72B model produces significantly richer Arabic and English rationale text compared to the 14B local model.

Use local inference during development, testing, and setup. RunPod costs money per hour, so only start the instance when needed.

---

## Step by Step Setup

### Step 1: Start the RunPod Instance

Log in to your RunPod account and start the Ollama H100 instance. Wait for the status to show Running before proceeding.

Note the public endpoint URL. It will look like:

```
https://abc123def456-11434.proxy.runpod.net
```

### Step 2: Confirm Ollama is Responsive

Run this command replacing the URL with your actual endpoint:

```bash
curl https://YOUR_POD_ID-11434.proxy.runpod.net/api/tags
```

You should see a JSON response listing available models. If you see connection refused the instance is still warming up. Wait 60 seconds and retry.

### Step 3: Pull the 72B Model (First Time Only)

If this is the first run on a fresh pod you need to pull the model. This takes 5 to 10 minutes on the H100:

```bash
curl -X POST https://YOUR_POD_ID-11434.proxy.runpod.net/api/pull \
  -H "Content-Type: application/json" \
  -d '{"name": "qwen2.5:72b"}'
```

Subsequent starts on the same pod will have the model cached.

---

## Switching to RunPod

Open the `.env` file in the project root and update two variables:

```bash
sed -i '' \
  -e 's|OLLAMA_URL=.*|OLLAMA_URL=https://YOUR_POD_ID-11434.proxy.runpod.net|' \
  -e 's|OLLAMA_MODEL=.*|OLLAMA_MODEL=qwen2.5:72b|' \
  .env
```

Then restart the FastAPI container to pick up the new values:

```bash
docker-compose restart fastapi
```

---

## Switching Back to Local

Run the following to restore local inference:

```bash
sed -i '' \
  -e 's|OLLAMA_URL=.*|OLLAMA_URL=http://host.docker.internal:11434|' \
  -e 's|OLLAMA_MODEL=.*|OLLAMA_MODEL=qwen2.5:14b|' \
  .env
docker-compose restart fastapi
```

---

## Verification

After restarting, confirm the backend is using the new model:

```bash
curl http://localhost:8000/health
```

The response will include:

```json
{
  "status": "ok",
  "ollama_model": "qwen2.5:72b"
}
```

If the model field still shows the old value wait 10 seconds and retry. The FastAPI container may still be restarting.

---

## Important Notes

The first inference request after switching to RunPod may take 3 to 5 minutes if the model is loading into GPU memory. Submit a test case immediately after the switch and wait for it to complete before the demo begins.

Never commit the `.env` file to git. It is listed in `.gitignore`. If you change the RunPod URL in `.env` those changes remain local only.

The switch is a single environment variable change. No code changes are required. The entire Tayseer application is model-agnostic by design.
