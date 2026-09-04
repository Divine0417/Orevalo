# Add an Orevalo Admin Account

Admin access is controlled by the `public.profiles.role` column. Do not hard-code an admin email or password in the application.

## 1. Create the account

Create the account through the normal Orevalo signup flow, or create it in Supabase:

- Open **Authentication → Users**.
- Choose **Add user**.
- Use `hello@orevalo.com`.
- Set a strong password.
- Confirm the email if you create the user manually.

You can also sign up at:

```text
https://orevalo.com/signup
```

The email must be confirmed before the account can access the dashboard.

## 2. Promote the account

Open the Supabase **SQL Editor** and run:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('hello@orevalo.com');
```

Check that it worked:

```sql
select id, email, role
from public.profiles
where lower(email) = lower('hello@orevalo.com');
```

Expected result:

```text
email              | role
hello@orevalo.com  | admin
```

If no row is returned, the user has not completed signup yet. Create the account first, then run the promotion query again.

## 3. Sign in

Open:

```text
https://orevalo.com/admin/login
```

Use:

```text
Email: hello@orevalo.com
Password: the password created for this account
```

Never place the password in Git, `.env.local`, a SQL file, or a chat message.

## 4. Confirm access

After signing in, the account should be able to open:

- `/admin`
- `/admin/listings`
- `/admin/scholarships`
- `/admin/subscribers`
- `/admin/applications`
- `/admin/research`

The app checks the role server-side and Supabase Row Level Security also protects admin writes.

## Troubleshooting

### “You are signed in but not an admin”

Run the promotion query again and make sure the email matches the authenticated account exactly. Then sign out and sign in again so the fresh profile role is read.

### The account cannot sign in

Confirm the email first. Keep **Authentication → Providers → Email → Confirm email** enabled, and use the password reset flow if needed.

### The query returns no row

The `profiles` row is created by the signup trigger. Create the user through `/signup`, confirm the email, then rerun the query.

### Do not make every signup an admin

Never add a default-admin rule based on email domain or public signup input. Promote individual accounts manually from the SQL Editor or a tightly protected admin workflow.
