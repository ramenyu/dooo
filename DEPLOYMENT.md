# 🚀 Todo App Deployment Guide

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (recommended for Next.js)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Set Up Supabase Database

### 1.1 Create a New Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a name like "todo-app-production"
3. Set a strong database password
4. Select a region close to your users

### 1.2 Set Up Database Schema
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create tables and policies

### 1.3 Get Your Supabase Credentials
1. Go to Settings → API
2. Copy your:
   - Project URL
   - Anon (public) key

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `todo-app` folder

### 2.2 Configure Environment Variables
In Vercel dashboard, add these environment variables:

```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2.3 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 3: Update API Routes (Optional)

If you want to use the Supabase database instead of file storage, update your API routes to use the new database functions.

## Step 4: Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Add your custom domain
3. Configure DNS records as instructed

## Step 5: Share with Your Team

1. Share the deployed URL with your team
2. Each team member can:
   - Create their own organization
   - Invite others to their organization
   - Start using the todo app immediately!

## Features Your Team Will Love

✅ **Real-time Updates**: Todos update instantly across all team members
✅ **Organization-based**: Each team can have their own workspace
✅ **Keyboard Shortcuts**: ⌘K to focus, ⌘↑↓ to navigate
✅ **Multi-user Assignments**: Assign todos to multiple team members
✅ **Link Attachments**: Attach URLs directly to todos
✅ **Desktop Notifications**: Get notified when assigned new todos
✅ **Mobile Responsive**: Works great on all devices

## Troubleshooting

### Database Connection Issues
- Check your Supabase credentials
- Ensure RLS policies are set up correctly
- Verify your database schema matches the SQL file

### Build Errors
- Check environment variables are set correctly
- Ensure all dependencies are installed
- Check the Vercel build logs for specific errors

### Performance Issues
- Supabase has built-in caching
- Consider adding more database indexes if needed
- Monitor usage in Supabase dashboard

## Next Steps

1. **Analytics**: Add Vercel Analytics to track usage
2. **Authentication**: Consider adding Supabase Auth for user accounts
3. **Real-time**: Enable Supabase real-time subscriptions for live updates
4. **Backup**: Set up automated database backups in Supabase

Happy deploying! 🎉
