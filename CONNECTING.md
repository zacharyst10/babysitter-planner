# Connecting Your Babysitting Planner Backend

This guide will walk you through the process of connecting your Babysitting Planner application to Neon PostgreSQL and Resend.

## Step 1: Set Up Neon PostgreSQL

1. Sign up for a free Neon account at [https://neon.tech](https://neon.tech)
2. Create a new project
   - Click "New Project"
   - Give it a name (e.g., "babysitting-planner")
   - Choose a region closest to your users
   - Click "Create Project"
3. Get your connection string:
   - In the Neon dashboard, click "Connection Details"
   - Select "Prisma" from the dropdown (the format works for Drizzle too)
   - Copy the connection string that looks like: `postgresql://user:password@ep-something.us-east-2.aws.neon.tech/database?sslmode=require`

## Step 2: Set Up Resend for Email

1. Sign up for a Resend account at [https://resend.com](https://resend.com)
2. Create an API key:
   - In the Resend dashboard, go to "API Keys"
   - Click "Create API Key"
   - Give it a name (e.g., "babysitting-planner")
   - Copy the generated API key

## Step 3: Configure Environment Variables

1. In your project root, create a `.env` file if it doesn't exist
2. Add the following environment variables:

```
DATABASE_URL="your_neon_connection_string_here"
RESEND_API_KEY="your_resend_api_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 4: Test Database Connection

1. Run the test connection script:

```bash
pnpm db:test
```

You should see a success message confirming the connection to your Neon database.

## Step 5: Generate and Apply Database Migrations

1. Generate migrations based on your schema:

```bash
pnpm db:generate
```

This will create migration files in the `drizzle` directory.

2. Apply the migrations to your database:

```bash
pnpm db:migrate
```

3. (Optional) Explore your database with Drizzle Studio:

```bash
pnpm db:studio
```

## Step 6: Test API Endpoints

1. Start your development server:

```bash
pnpm dev
```

2. Test the database connection API endpoint:
   - Open your browser and navigate to: `http://localhost:3000/api/test-db`
   - You should see a JSON response confirming the database connection

## Step 7: Explore Your Data with Drizzle Studio

Drizzle Studio provides a convenient way to explore and manage your database:

1. Run Drizzle Studio:

```bash
pnpm db:studio
```

2. Open the URL displayed in your terminal (typically http://localhost:4983)
3. You should see your database tables (parents, babysitters, bookings, etc.)
4. You can manually add test data, view records, and manage your database

## Troubleshooting

### Database Connection Issues

- **Error: SSL connection required**: Make sure your connection string has `?sslmode=require` at the end
- **Connection timeout**: Check if your IP is allowed in Neon's connection settings
- **Authentication failed**: Verify your username and password are correct in the connection string

### Email Sending Issues

- **API key invalid**: Make sure your Resend API key is correct in the .env file
- **Sender domain not verified**: Add and verify your domain in the Resend dashboard
- **Email not received**: Check your spam folder

### Migration Issues

- **Schema mismatch**: If you get errors about existing tables not matching your schema, you might need to drop and recreate your database or adjust your schema
- **Permission denied**: Make sure your Neon user has permission to create tables

## Next Steps

Once your backend is connected:

1. Create test data in your database using Drizzle Studio
2. Test your API endpoints using the frontend or a tool like Postman
3. Integrate authentication (consider NextAuth.js or Clerk)
4. Deploy your application to a hosting provider like Vercel
