# Testing Commands for Phase 1

## Quick TypeScript Check
```bash
cd /Users/adamwolfe/openinfo-platform
npx tsc --noEmit
```

## Start Development Server
```bash
cd /Users/adamwolfe/openinfo-platform
npm run dev
# or
pnpm dev
```

## Test URLs to Visit

### 1. Login Page
```
http://localhost:3000/login
```
- [ ] Page loads without errors
- [ ] Form fields render correctly
- [ ] "Forgot password?" link goes to /forgot-password
- [ ] Submit button works
- [ ] LinkedIn OAuth button works

### 2. Signup Page
```
http://localhost:3000/signup
```
- [ ] Page loads without errors
- [ ] Full name, email, password fields render
- [ ] Terms checkbox required
- [ ] Submit creates account
- [ ] Redirects to /onboarding

### 3. Forgot Password
```
http://localhost:3000/forgot-password
```
- [ ] Page loads without errors
- [ ] Email field renders
- [ ] Submit sends reset email
- [ ] Success message shows
- [ ] "Back to login" link works

### 4. Reset Password
```
http://localhost:3000/reset-password
```
- [ ] Page loads without errors
- [ ] Shows error if no valid token
- [ ] Password fields render when valid
- [ ] Validation works (min 8 chars, matching)
- [ ] Success redirects to login

### 5. Email Verification
```
http://localhost:3000/verify-email
```
- [ ] Page loads without errors
- [ ] Shows email address
- [ ] Resend button works
- [ ] Help text displays

### 6. Onboarding
```
http://localhost:3000/onboarding
```
- [ ] Page loads without errors
- [ ] Step 1: Workspace name field
- [ ] Slug auto-generates from name
- [ ] Industry dropdown works
- [ ] Step 2: Review page shows data
- [ ] Submit creates workspace
- [ ] Redirects to /dashboard

### 7. Auth Callback
```
http://localhost:3000/auth/callback?code=TEST
```
- [ ] Handles OAuth redirect
- [ ] Shows appropriate error if invalid
- [ ] Redirects properly

## Browser Console Check

Run dev server and open browser console. Should see NO errors for:
- [ ] /login
- [ ] /signup
- [ ] /forgot-password
- [ ] /reset-password
- [ ] /verify-email
- [ ] /onboarding

## TypeScript Compilation Test

```bash
# Full typecheck
npx tsc --noEmit --project tsconfig.json

# Expected output: No errors
```

## Lint Check

```bash
# Run ESLint
npm run lint
# or
pnpm lint

# Expected: No critical errors in auth files
```

## Build Test

```bash
# Test production build
npm run build
# or
pnpm build

# Should complete without errors
```

## File Structure Verification

Check these files exist:
```bash
ls -la /Users/adamwolfe/openinfo-platform/src/app/\(auth\)/login/page.tsx
ls -la /Users/adamwolfe/openinfo-platform/src/app/\(auth\)/signup/page.tsx
ls -la /Users/adamwolfe/openinfo-platform/src/app/\(auth\)/onboarding/page.tsx
ls -la /Users/adamwolfe/openinfo-platform/src/app/\(auth\)/forgot-password/page.tsx
ls -la /Users/adamwolfe/openinfo-platform/src/app/\(auth\)/reset-password/page.tsx
ls -la /Users/adamwolfe/openinfo-platform/src/app/\(auth\)/verify-email/page.tsx
ls -la /Users/adamwolfe/openinfo-platform/src/app/auth/callback/route.ts
ls -la /Users/adamwolfe/openinfo-platform/src/lib/auth/helpers.ts
ls -la /Users/adamwolfe/openinfo-platform/src/lib/auth/validation.ts
```

## Manual Testing Flows

### Flow 1: New User Registration
1. Go to http://localhost:3000/signup
2. Enter test data:
   - Full name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
3. Check terms checkbox
4. Click "Create account"
5. Should redirect to /onboarding
6. Fill workspace details:
   - Name: "Test Company"
   - Slug: auto-generated "test-company"
   - Industry: "Technology"
7. Click "Continue"
8. Review details on step 2
9. Click "Create Workspace"
10. Should redirect to /dashboard

### Flow 2: Login
1. Go to http://localhost:3000/login
2. Enter credentials from Flow 1
3. Click "Sign in"
4. Should redirect to /dashboard

### Flow 3: Password Reset
1. Go to http://localhost:3000/login
2. Click "Forgot your password?"
3. Should redirect to /forgot-password
4. Enter email: "test@example.com"
5. Click "Send reset link"
6. Should show success message
7. Check email for reset link
8. Click reset link
9. Should go to /reset-password with token
10. Enter new password (twice)
11. Click "Reset password"
12. Should show success and redirect to /login

### Flow 4: Design System Check
Open each page and verify:
- [ ] White background (not gray)
- [ ] Zinc-900 buttons (not blue)
- [ ] Text size 13px for body
- [ ] Text size text-xl for titles
- [ ] Proper spacing and alignment
- [ ] Error messages in red-50 bg
- [ ] Success messages in emerald-50 bg
- [ ] All form inputs have rounded-lg
- [ ] All buttons have h-9

## API Testing (if needed)

```bash
# Test auth helpers
node -e "
const { getCurrentUser } = require('./src/lib/auth/helpers');
getCurrentUser().then(user => console.log(user));
"
```

## Environment Variables Check

```bash
# Make sure these are set
grep NEXT_PUBLIC_SUPABASE_URL /Users/adamwolfe/openinfo-platform/.env.local
grep NEXT_PUBLIC_SUPABASE_ANON_KEY /Users/adamwolfe/openinfo-platform/.env.local
```

## Database Check

If you have access to Supabase dashboard:
1. Check `users` table exists
2. Check `workspaces` table exists
3. Verify RLS policies are enabled
4. Test creating a user through UI
5. Verify user appears in database
6. Verify workspace appears in database

## Common Issues & Solutions

### Issue: Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
# or
pnpm install
```

### Issue: TypeScript errors
```bash
# Generate types from Supabase
npx supabase gen types typescript --local > src/types/database.types.ts
```

### Issue: Next.js cache issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

## Success Criteria

Phase 1 is complete when:
- ✅ All pages load without console errors
- ✅ TypeScript compiles without errors
- ✅ Login flow works end-to-end
- ✅ Signup flow works end-to-end
- ✅ Password reset works end-to-end
- ✅ Onboarding creates workspace
- ✅ Design system is consistent
- ✅ All forms have validation
- ✅ Error messages display properly
- ✅ OAuth (LinkedIn) works

## Next Phase Preparation

After testing Phase 1, prepare for Phase 2:
1. Document any issues found
2. Create list of missing API routes
3. Identify areas needing error boundaries
4. Note any design inconsistencies
5. List any TypeScript strict mode violations
