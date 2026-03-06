# LecRate — قيّم محاضراتك

> منصة مجانية لتقييم واكتشاف مصادر الدراسة الجامعية

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend & DB**: Supabase (PostgreSQL + REST API)
- **Hosting**: Vercel-ready

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** and paste the contents of `schema.sql`, then run it

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PASSWORD=your-secure-admin-password
```

- **Supabase URL & Anon Key**: Found in Supabase → Project Settings → API
- **Admin Password**: Any password you choose for the `/admin` page

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the 3 environment variables in Vercel Settings → Environment Variables
4. Deploy!

## Pages

| Route          | Description                               |
| -------------- | ----------------------------------------- |
| `/`            | Home page with CTA buttons                |
| `/rate`        | Multi-step wizard to rate lecture sources |
| `/browse`      | Browse & sort rated sources               |
| `/source/[id]` | Source detail with all ratings            |
| `/stats`       | Platform statistics                       |
| `/admin`       | Password-protected admin panel            |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── rate/page.tsx         # Rate a Lecture
│   ├── browse/page.tsx       # Browse Ratings
│   ├── source/[id]/page.tsx  # Source Detail
│   ├── stats/page.tsx        # Statistics
│   ├── admin/page.tsx        # Admin Panel
│   └── api/admin/auth/       # Admin Auth API
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── Navbar.tsx
│   ├── StepSelector.tsx
│   ├── SourceCard.tsx
│   └── RatingForm.tsx
└── lib/
    ├── supabase.ts           # Supabase client
    ├── types.ts              # TypeScript interfaces
    └── utils.ts              # Utilities
```
