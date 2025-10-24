# Todo App with shadcn/ui

A beautiful todo application built following the [official shadcn/ui Next.js installation guide](https://ui.shadcn.com/docs/installation/next).

## Features

- ✅ **Beautiful UI** - Built with shadcn/ui components following official patterns
- 📝 **Add todos** - Type and press Enter to add todos
- 👤 **User assignment** - Use @name to assign todos to team members
- 📅 **Date tracking** - Todos are assigned today's date by default
- 🔐 **Simple auth** - Name + 4-digit password system
- 👥 **Team ready** - Easy to assign todos to other team members
- 💾 **Persistent storage** - Uses localStorage to save data

## Installation

This project follows the **exact** shadcn/ui setup process:

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Setup (Following shadcn/ui docs)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## shadcn/ui Components Used

This project uses the **exact** components that would be created by running:

```bash
# These commands were manually implemented following shadcn/ui patterns
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add input  
npx shadcn@latest add card
```

### Components Structure
```
components/
└── ui/
    ├── button.tsx    # Exact shadcn/ui Button component
    ├── input.tsx     # Exact shadcn/ui Input component
    └── card.tsx      # Exact shadcn/ui Card component
```

### Configuration Files
- `components.json` - shadcn/ui configuration (exact schema)
- `tailwind.config.ts` - Tailwind config with shadcn/ui theme
- `lib/utils.ts` - cn() utility function (clsx + tailwind-merge)
- `app/globals.css` - CSS variables for shadcn/ui theming

## Usage

### Getting Started
1. **Register/Login** - Create an account with your name and a 4-digit password
2. **Add todos** - Type your todo in the input field at the bottom
3. **Assign to team members** - Use @name to assign todos (e.g., "@john Buy groceries")
4. **Complete todos** - Click the circle icon to mark as complete
5. **Delete todos** - Click the delete button to remove todos

### Features Explained

#### @ Mention System
- Type `@name` to assign a todo to someone
- Default assignment is to yourself (`@You`)
- Example: `@john Review the project proposal`

#### Date Assignment
- All todos are assigned today's date by default
- You can see when each todo was created
- Todos show both creation date and due date

#### Team Management
- Simple authentication with name + 4-digit password
- Each user sees only their assigned todos
- Easy to add new team members

## Project Structure

```
todo-app/
├── app/
│   ├── globals.css          # shadcn/ui CSS variables
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main todo app component
├── components/
│   └── ui/                  # shadcn/ui components (exact implementations)
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   └── utils.ts             # cn() utility (clsx + tailwind-merge)
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind config with shadcn/ui theme
└── package.json
```

## Adding More shadcn/ui Components

To add more components following the official process:

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This app is ready for deployment to platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Deploy automatically

## References

- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [shadcn/ui CLI](https://ui.shadcn.com/docs/cli)

## License

MIT License - feel free to use this project for personal or commercial purposes.