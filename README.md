# MedsAtHome 💊

Manage your home medications easily and safely.

## Features

- ✅ Secure authentication with Supabase Auth
- ✅ Complete CRUD for medications
- ✅ Visual expiration indicator
- ✅ Search by name
- ✅ Responsive mobile-first design
- ✅ Row Level Security (RLS) to protect your data
- ✅ Family sharing with invitation codes

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)

## Prerequisites

- Node.js 18+ 
- Account at [Supabase](https://supabase.com)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd medsathome
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

5. Run the SQL script in your Supabase dashboard:
   - Go to your Supabase project
   - Open the SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the script

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
medsathome/
├── src/
│   ├── app/                    # App Router (pages)
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   ├── family/             # Family setup page
│   │   └── dashboard/          # Main dashboard
│   │       └── medications/    # Medications CRUD
│   ├── components/             # React components
│   ├── lib/                    # Utilities and configuration
│   │   └── supabase/           # Supabase clients
│   ├── types/                  # TypeScript types
│   └── middleware.ts           # Route protection
├── supabase-schema.sql         # SQL script for Supabase
└── package.json
```

## Functionalities

### Authentication
- Registration with email and password
- Login with email and password
- Persistent sessions
- Automatic route protection

### Family Management
- Create a new family with automatic code generation
- Join an existing family using an invitation code
- Share medications across family members
- Code format: MEDS-XXXXXX

### Medication Management
- Add new medications
- Edit existing medications
- Delete with confirmation
- Search by name
- Visual expiration indicator (red border)

### Security
- Row Level Security (RLS) enabled
- Each user only sees medications from their family
- Protected environment variables
- Authentication middleware

## License

MIT
