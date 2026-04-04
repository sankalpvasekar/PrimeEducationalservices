# Prime Educational Services - Startup Guide

This document explains how to run, test, and deploy the application locally and to Vercel.

## 🚀 Local Development

For the best experience, start both the frontend and backend servers together.

### 1. Backend (FastAPI)
Required: Python 3.9+

```bash
# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn api.index:app --reload --port 8000
```
- API will be available at: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 2. Frontend (Vite/React)
Required: Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
- UI will be available at: http://localhost:5173

---

## ⚡ Deployment (Vercel)

The project is already configured for **Vercel Serverless Functions**.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the root directory.
3. Vercel will automatically detect the `api/index.py` (Backend) and `dist` (Frontend).

## 🗄️ Project Structure

- `api/`: FastAPI Backend endpoints.
- `src/`: React + TypeScript + Tailwind Frontend.
- `vercel.json`: Deployment configuration.
- `tailwind.config.js`: Custom Prime Educational design tokens.
