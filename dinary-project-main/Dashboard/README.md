# Dinary Admin Dashboard

A comprehensive admin dashboard for the Dinary application built with Next.js, React, Tailwind CSS, and Supabase.

## Features

- **User Management**: View, block, boost, contact, and manage users
- **Merchant Management**: Validate accounts, view balances, rate, and message merchants
- **Withdrawal Management**: Approve or decline withdrawal requests from merchants
- **Mission Management**: Create and edit Learn and Shop missions
- **Statistics Dashboard**: View key metrics, charts, and transaction data
- **Messaging System**: Admin-to-user communication
- **Smart Notifications**: Generate and send targeted notifications

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18
- **Styling**: Tailwind CSS 3
- **Charts**: Chart.js with react-chartjs-2
- **Database & Auth**: Supabase
- **Icons**: Lucide Icons
- **State Management**: React Hooks + Context (with option for Zustand)
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/dinary-admin.git
cd dinary-admin
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard

## Project Structure

```
/app                    # Next.js App Router
  /admin                # Admin pages
    /dashboard          # Dashboard page
    /users              # User management
    /merchants          # Merchant management
    /withdrawals        # Withdrawal requests
    /missions           # Mission management
    /shop               # Shop items management
    /messages           # Messaging system
    /notifications      # Notification management
/components             # React components
  /admin                # Admin-specific components
/lib                    # Utility functions and helpers
  mock-data.ts          # Mock data for development
  supabase.ts           # Supabase client and helpers
```

## Deployment

This is a Next.js application, so it can be deployed to Vercel with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/dinary-admin)

Or follow the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## License

This project is licensed under the MIT License.

## Acknowledgments

- Design inspired by modern iOS-like interfaces
- Dinary brand colors: turquoise, yellow, and white