# dooo - Awesome Todo App for Teams

A beautiful todo application built with Next.js, shadcn/ui, and Supabase for real-time collaboration.

## Features

- ✅ **Beautiful UI** - Built with shadcn/ui components
- 📝 **Add todos** - Type and press Enter to add todos
- 👤 **User assignment** - Use @name to assign todos to team members
- 📅 **Date tracking** - Todos are assigned today's date by default
- 🔐 **Organization-based auth** - Join organizations and collaborate
- 👥 **Team ready** - Easy to assign todos to other team members
- 💾 **Real-time sync** - Uses Supabase for persistent storage
- 🔗 **Link attachments** - Attach URLs to todos
- ⌨️ **Keyboard shortcuts** - Cmd+K to focus input, Cmd+↑/↓ to navigate
- 🔔 **Notifications** - Desktop notifications for new todos

## Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ramenyu/dooo.git
   cd dooo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Add your Supabase credentials to .env.local
   ```

4. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Add your Supabase URL and anon key to `.env.local`

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started
1. **Register/Login** - Create an account with your name and organization
2. **Add todos** - Type your todo in the input field at the bottom
3. **Assign to team members** - Use @name to assign todos (e.g., "@john Buy groceries")
4. **Attach links** - Paste URLs to attach them to todos
5. **Complete todos** - Click the circle icon or use Enter key
6. **Delete todos** - Use Delete key to discard todos

### Keyboard Shortcuts
- **⌘K** - Focus the input field
- **⌘↑/↓** - Navigate through todos
- **Enter** - Complete selected todo
- **Delete** - Discard selected todo

### Features Explained

#### @ Mention System
- Type `@name` to assign a todo to someone
- Auto-completion shows organization members
- Case-insensitive matching

#### Link Attachments
- Paste URLs to automatically attach them
- Click attached links to open in new tab
- Remove attachments before submitting

#### Organization Management
- Join organizations with @organization format
- All members see each other in @ mentions
- Isolated data per organization

## Project Structure

```
dooo/
├── app/
│   ├── api/                 # API routes
│   ├── globals.css          # shadcn/ui CSS variables
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main todo app component
├── components/
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── supabase-db.ts       # Database operations
│   └── utils.ts             # Utility functions
├── supabase-schema.sql      # Database schema
└── package.json
```

## Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT License - feel free to use this project for personal or commercial purposes.
