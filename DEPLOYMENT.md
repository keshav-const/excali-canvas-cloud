# ExcaliSketch - Deployment Guide

## Important: Lovable Architecture vs Traditional Setup

This project is built with **Lovable**, which differs from the traditional Next.js + Express setup you might be familiar with:

### What Lovable Provides:
- **Frontend**: React + Vite + TypeScript (not Next.js)
- **Backend**: Supabase Edge Functions (not Express)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Hosting**: Integrated deployment through Lovable platform
- **Environment**: No `.env` files needed - Supabase credentials are built-in

## ✅ What's Already Implemented

### 1. Database Schema
- ✅ `sketches` table with proper RLS policies
- ✅ User authentication support
- ✅ Guest user support for temporary sketches
- ✅ Auto-updating timestamps

### 2. Backend API (Edge Functions)
- ✅ `POST /sketches` - Create new sketch
- ✅ `GET /sketches/:id` - Fetch sketch by ID
- ✅ `GET /sketches` - Get user's sketches (auth required)
- ✅ `PUT /sketches/:id` - Update sketch (auth required)
- ✅ `DELETE /sketches/:id` - Delete sketch (auth required)

### 3. Authentication
- ✅ Email/password authentication
- ✅ User context and session management
- ✅ Protected routes and data access
- ✅ Guest user support

### 4. Frontend Integration
- ✅ Auth context and hooks
- ✅ API integration hooks
- ✅ Responsive UI with Tailwind CSS
- ✅ Toast notifications

## 🚀 Deployment Options

### Option 1: Lovable Platform (Recommended)
1. Click the **"Publish"** button in the top-right corner of Lovable
2. Your app will be deployed automatically with a `.lovable.app` domain
3. Edge Functions deploy automatically with the frontend
4. Supabase integration works out-of-the-box

**Benefits:**
- Zero configuration deployment
- Edge Functions auto-deploy
- Built-in Supabase integration
- Custom domain support with paid plans

### Option 2: Export and Deploy Elsewhere
If you need to deploy outside Lovable:

#### Frontend (Vercel/Netlify):
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

#### Backend (Edge Functions):
- Edge Functions are Supabase-specific and run on Supabase's platform
- Cannot be deployed to traditional Express hosting like Render
- Use the Supabase CLI to deploy functions:
```bash
supabase functions deploy sketches
```

## 🔧 Environment Configuration

### Lovable (Built-in):
- Supabase URL and keys are automatically configured
- No manual environment setup needed

### External Deployment:
If deploying outside Lovable, you'll need:

```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Edge Functions (configured in Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │ Supabase Edge    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   Functions      │◄──►│   Database      │
│                 │    │   (Backend API)  │    │   with RLS      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │ Supabase Auth    │
                        │ (Authentication) │
                        └──────────────────┘
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own sketches
- **Authentication**: JWT-based auth with Supabase
- **Guest Support**: Temporary sketches for non-authenticated users
- **API Protection**: Edge Functions validate user permissions

## 🌐 API Endpoints

All API calls go through Supabase Edge Functions:

```javascript
// Create sketch
const { data } = await supabase.functions.invoke('sketches', {
  method: 'POST',
  body: { title: 'My Sketch', content: sketchData }
});

// Get user's sketches
const { data } = await supabase.functions.invoke('sketches', {
  method: 'GET'
});
```

## 🔗 Useful Links

After deployment, you can monitor your application:

- **Edge Functions**: [Supabase Functions Dashboard](https://supabase.com/dashboard/project/swnqyqvwmlzezxufejwh/functions)
- **Database**: [Supabase Database](https://supabase.com/dashboard/project/swnqyqvwmlzezxufejwh/editor)
- **Authentication**: [Supabase Auth](https://supabase.com/dashboard/project/swnqyqvwmlzezxufejwh/auth/users)
- **Function Logs**: [Edge Function Logs](https://supabase.com/dashboard/project/swnqyqvwmlzezxufejwh/functions/sketches/logs)

## 🛠️ Local Development

1. The app runs locally through Lovable's development server
2. Edge Functions run locally via Supabase CLI (automatically handled)
3. Database changes are applied via Lovable's migration system

## 🚨 Important Notes

- **Not Next.js**: This is a React + Vite application, not Next.js
- **Not Express**: Backend logic runs in Supabase Edge Functions, not Express
- **Built-in Hosting**: Lovable provides integrated deployment, no need for separate Vercel + Render setup
- **RLS Required**: Make sure to test authentication flows before deployment

The application is ready to deploy and fully functional with all requested features!