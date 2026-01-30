# Server-Side Environment Setup

The application now uses a server-side API route (`/api/transcribe`) to handle authentication. You must configure the `OPENAI_API_KEY` environment variable in Vercel.

## Vercel Configuration

1. Go to your **Vercel Dashboard** -> **Select Project**.
2. Go to **Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-...` (Your actual OpenAI API Key)
   - **Environments**: Check **Production**, **Preview**, and **Development**.
4. Click **Save**.
5. **Redeploy** your application for the changes to take effect.

## Local Development (Optional)

If you want to run this locally ensuring serverless functions work:
1. Create a `.env` file in the root directory.
2. Add: `OPENAI_API_KEY=sk-...`
3. Run with `vercel dev` (requires `npm i -g vercel`).
   - *Note: `npm run dev` only runs the frontend. Since the API is now server-less, you need the Vercel CLI to emulate the backend locally.*
