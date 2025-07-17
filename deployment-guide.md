# Deployment Guide

## Quick Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or connect your GitHub repo to Netlify for automatic deployments

3. **Set Environment Variables** in Netlify:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. **Deploy Edge Functions**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Deploy functions
   supabase functions deploy voice-conversion
   ```

3. **Set Environment Variables** in Supabase:
   ```
   HUGGINGFACE_API_TOKEN=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
   ```

## Alternative: Local Development

1. **Start Supabase locally**:
   ```bash
   supabase start
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## Production Considerations

- Replace hardcoded API token with environment variable
- Add rate limiting to prevent API abuse
- Implement user authentication if needed
- Add file size and type validation on backend
- Set up monitoring and error tracking