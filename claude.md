# Claude Development Guidelines - SuperUMO

## Project Overview

**SuperUMO** is a modern PaaS (Platform as a Service) Admin Dashboard built with React 19, TypeScript, and Vite. This application provides a comprehensive management interface for cloud services including VPS, Containers, Databases, Domains, and more.

- **Repository**: https://github.com/ariaseta/supersumo
- **Type**: Single Page Application (SPA) - Admin Dashboard
- **License**: MIT
- **Node.js**: 20.x
- **Package Manager**: bun (primary)

---

## Architecture Principles

### 1. Feature-Based Architecture

The codebase follows a **feature-based organizational pattern** where code is grouped by business functionality rather than technical layers.

```
src/
├── features/          # Business feature modules (self-contained)
│   ├── affiliate/     # Affiliate management
│   ├── ai/            # AI features
│   ├── apps/          # Applications management
│   └── auth/         # OAuth callback route
│   ├── billing/       # Billing & subscriptions
│   ├── caas/          # Containers as a Service
│   ├── chats/         # Chat functionality
│   ├── dashboard/     # Main dashboard
│   ├── database/      # Database management
│   ├── domain/        # Domain management
│   ├── errors/        # Error pages (404, 500, etc.)
│   ├── settings/      # Settings (account, profile, display, notifications, etc.)
│   ├── tasks/         # Task management
│   ├── users/         # User management
│   └── vps/           # VPS management
├── components/        # Shared/reusable UI components
│   ├── data-table/   # Table-related components
│   ├── layout/        # Layout components (sidebar, header, nav)
│   └── ui/            # Shadcn UI components (30 components - DO NOT modify)
├── routes/            # TanStack Router file-based routing
│   ├── (auth)/        # Authenticated route group
│   ├── (errors)/      # Error route group
│   ├── _authenticated/ # Protected authenticated routes
│   └── auth/         # OAuth callback route
├── context/           # React context providers (theme, layout, search, supabase)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and Supabase client
├── stores/            # Zustand state management
└── styles/            # Global styles and CSS
```

**Key Rules:**
- **Always** organize code by feature when adding new functionality
- **DO NOT** modify components in `src/components/ui/` - these are Shadcn UI primitives
- **Keep** features self-contained with their own components, hooks, and utilities
- **Use** route groups `()` for layout-only routes that don't add path segments
- **Use** underscore prefix `_` for protected/private routes (e.g., `_authenticated`)

### 2. Component Architecture

**Component Hierarchy:**
```
Pages (Routes)
  ↓
Feature Components (Business Logic)
  ↓
Composite Components (data-table, layout)
  ↓
UI Components (Shadcn/Radix - Atomic)
  ↓
Lib/Utils (Helper Functions)
```

**Component Rules:**
- Use **PascalCase** for component file names: `UserProfile.tsx`
- Use **kebab-case** for utility files: `handle-server-error.ts`
- Use **kebab-case** for feature directories: `user-management/`
- Components should be **co-located** with their features when feature-specific
- Shared components go in `src/components/`
- Prefer **composition over inheritance**
- Keep components **small and focused** (single responsibility)

### 3. State Management Strategy

We use a **layered state management approach**:

**Zustand** (`src/stores/`)
- Global client-side state (authentication, user preferences)
- Use for: User session, theme, language, sidebar state
- Example: `src/stores/auth.ts`

**TanStack Query** (React Query)
- Server state management and caching
- Use for: API calls, data fetching, mutations
- Always use for: CRUD operations, list data, server responses
- Example: `useQuery()`, `useMutation()`

**React Context API** (`src/context/`)
- Cross-cutting application concerns
- Use for: Theme, layout state, search context, Supabase auth
- Example: `ThemeProvider`, `DirectionProvider`, `SupabaseProvider`

**Supabase Auth** (`src/lib/supabase/`, `src/context/supabase-provider.tsx`)
- Authentication and user session management
- Use for: Sign in/up, sign out, OAuth (Google, GitHub)
- Syncs with Zustand store for compatibility
- Session handled by Supabase client automatically

**URL State**
- Table filters, pagination, search parameters
- Use for: Shareable UI state
- Example: `use-table-url-state.ts`

**State Decision Tree:**
```
Is it server data?
  → Yes: Use TanStack Query
  → No: Is it global UI state?
    → Yes: Use Zustand
    → No: Is it shareable via URL?
      → Yes: Use URL state
      → No: Use React useState or Context
```

### 4. Type Safety Standards

**TypeScript Configuration:**
- Strict mode is **enabled**
- Path alias: `@/*` maps to `./src/*`
- Type-only imports are **enforced**

**Type Safety Rules:**
- **NEVER** use `any` type (use `unknown` if truly unknown)
- **ALWAYS** type function parameters and return values
- **PREFER** type imports: `import { type User }`
- **USE** Zod for runtime validation schemas
- **DEFINE** interfaces/types in separate files when reusable
- **AVOID** type assertions (`as`) unless absolutely necessary

**Example:**
```typescript
// ✅ Good
import { type User } from '@/types/user'

function getUserById(id: string): Promise<User> {
  return api.get(`/users/${id}`)
}

// ❌ Bad
function getUserById(id: any): any {
  return api.get(`/users/${id}`) as any
}
```

### 5. Routing Architecture

**TanStack Router** with file-based routing:

**Route Structure:**
```
routes/
├── (auth)/           # Route group - doesn't add to URL
│   ├── sign-in.tsx   # /sign-in
│   └── sign-up.tsx   # /sign-up
├── _authenticated/   # Protected route - requires auth
│   └── dashboard.tsx # /dashboard (authenticated)
└── index.tsx         # / (root)
```

**Routing Rules:**
- **DO NOT** use React Router for new routes
- **USE** file-based routing with TanStack Router
- **WRAP** protected routes in `_authenticated/` directory
- **USE** `()` for route groups that share layout but don't add path segments
- **DEFINE** route parameters in filenames: `$userId.tsx` or `$userId/posts.tsx`
- **ENABLE** automatic code splitting (already configured)

---

## Coding Standards

### Import Order (Enforced by Prettier)

Imports **must** follow this exact order:

1. Core framework imports (React, Vite, etc.)
2. Third-party libraries (grouped by package)
3. Internal imports (grouped by directory)
4. Relative imports

```typescript
// 1. Core Framework
import { useCallback, useEffect } from 'react'

// 2. Third-party Libraries
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { z } from 'zod'

// 3. Internal Imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/stores/auth'

// 4. Relative Imports
import { LOCAL_STORAGE_KEYS } from './constants'
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Utilities | kebab-case | `format-date.ts` |
| Hooks | camelCase with 'use' prefix | `useUserData.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL` |
| Interfaces/Types | PascalCase | `UserProfile` |
| Enums | PascalCase | `UserRole` |
| CSS classes | kebab-case with BEM | `user-profile__avatar` |
| Feature directories | kebab-case | `user-management/` |

### Code Style (Prettier Configuration)

- **Quotes**: Single quotes (`'`)
- **Semicolons**: No semicolons
- **Indentation**: 2 spaces
- **Line width**: 80 characters
- **Trailing commas**: ES5 (objects, arrays, functions)
- **Line endings**: LF (not CRLF)
- **Import sorting**: Enabled with specific order

### ESLint Rules (Must Pass)

**Critical Rules:**
- ❌ No `console` statements (error in production)
- ❌ No unused variables
- ✅ Type-only imports enforced
- ❌ No duplicate imports
- ✅ React Hooks rules enforced
- ✅ TanStack Query recommended rules

**Before Committing:**
```bash
bun lint          # Check ESLint
bun format        # Fix with Prettier
bun format:check  # Check formatting
bun knip          # Find unused files/dependencies
bun build         # Must build successfully
```

---

## Technology Stack

### Core Framework
- **React**: 19.2.3 (UI framework)
- **TypeScript**: 5.9.3 (with strict mode)
- **Vite**: 7.3.0 (build tool & dev server)

### Routing & Navigation
- **TanStack Router**: 1.141.2 (file-based routing)
- **React Router DOM**: Declarative routing

### UI & Styling
- **TailwindCSS**: 4.1.18 (utility-first CSS)
- **Shadcn UI**: Component library (Radix UI primitives)
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Recharts**: Charting library

### State Management
- **Zustand**: 5.0.9 (global state)
- **TanStack Query**: 5.90.12 (server state)

### Forms & Validation
- **React Hook Form**: 7.68.0 (form handling)
- **Zod**: 4.2.0 (schema validation)

### Data Fetching
- **Axios**: 1.13.2 (HTTP client)

### Authentication
- **Supabase**: @supabase/supabase-js @supabase/auth-helpers-react @supabase/auth-ui-react
- **OAuth Providers**: Google, GitHub

### Utilities
- **date-fns**: 4.1.0 (date manipulation)
- **clsx** & **tailwind-merge**: CSS class utilities
- **Sonner**: Toast notifications

---

## Development Workflow

### Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build

# Preview production build
bun preview
```

### Before Committing Code

**Required Checklist:**
1. ✅ Run `bun lint` - No ESLint errors
2. ✅ Run `bun format` - Code formatted
3. ✅ Run `bun knip` - No unused code
4. ✅ Run `bun build` - Build successful

### Adding New Features

**Step-by-Step Process:**

1. **Create Feature Directory:**
   ```bash
   src/features/your-feature/
   ├── components/      # Feature-specific components
   ├── hooks/          # Feature-specific hooks
   ├── utils/          # Feature-specific utilities
   ├── types.ts        # TypeScript types
   └── index.ts        # Public exports
   ```

2. **Create Route:**
   ```bash
   routes/_authenticated/your-feature.tsx
   ```

3. **Add UI Components (if needed):**
   ```bash
   # Use Shadcn CLI - DO NOT manually edit ui components
   bunx shadcn@latest add button
   ```

4. **Implement State Management:**
   - Server data: Use TanStack Query
   - Global state: Use Zustand store
   - Local state: Use useState

5. **Add Types:**
   ```typescript
   // src/features/your-feature/types.ts
   export interface YourFeatureData {
     id: string
     name: string
   }
   ```

6. **Test Code Quality:**
   ```bash
   bun lint && bun format && bun knip && bun build
   ```

### Working with Forms

**Use React Hook Form + Zod:**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define schema
const formSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
})

type FormData = z.infer<typeof formSchema>

// Use in component
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
})
```

### Data Fetching Patterns

**GET Requests (Read):**
```typescript
import { useQuery } from '@tanstack/react-query'

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(res => res.data),
  })
}
```

**POST/PUT/DELETE (Write):**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      api.post('/users', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

---

## Accessibility Standards

**Critical Requirements:**
- ✅ All UI components use Radix UI primitives (full a11y support)
- ✅ Include "Skip to main content" button
- ✅ All interactive elements must be keyboard accessible
- ✅ Proper ARIA labels and roles
- ✅ Support RTL (Right-to-Left) languages
- ✅ Focus management in modals and dialogs
- ✅ Color contrast meets WCAG AA standards

**Testing Checklist:**
- [ ] Can navigate using Tab key
- [ ] Can operate all features with keyboard only
- [ ] Screen reader announces important changes
- [ ] Form inputs have associated labels
- [ ] Images have alt text
- [ ] Focus indicators are visible

---

## Performance Guidelines

### Code Splitting
- **Enabled** automatically by TanStack Router
- **Lazy load** heavy components with `React.lazy()`
- **Dynamic imports** for large libraries

### Asset Optimization
- **Images**: Use WebP format, optimize compression
- **Icons**: Use Lucide React (tree-shakeable)
- **Fonts**: Subset fonts to used characters only

### Query Optimization
- **Set appropriate** staleTime and cacheTime for queries
- **Use** pagination for large lists
- **Implement** infinite scroll with TanStack Query when appropriate

### Build Optimization
```bash
# Analyze bundle size
bun build --mode analyze

# Check for unused code
bun knip
```

---

## Security Best Practices

### Data Handling
- ✅ **NEVER** commit `.env` files (use `.env.example`)
- ✅ **ALWAYS** validate user input with Zod
- ✅ **USE** HTTPS for all API calls
- ✅ **SANITIZE** user-generated content
- ✅ **IMPLEMENT** proper error handling (no stack traces to client)

### Authentication
- ✅ Protected routes in `_authenticated/` directory
- ✅ Check Supabase session on mount (useSupabase hook)
- ✅ Handle session changes via Supabase auth listeners
- ✅ Logout clears Supabase session and Zustand store

### API Security
- ✅ Use environment variables for API URLs
- ✅ Don't expose sensitive data in URLs
- ✅ Implement rate limiting (backend)
- ✅ CSRF protection (backend)

---

## Testing Strategy

### Unit Tests (Future)
- Test utility functions in `src/lib/`
- Test custom hooks in `src/hooks/`
- Test pure functions

### Integration Tests (Future)
- Test feature flows
- Test routing
- Test form submissions

### E2E Tests (Future)
- Critical user paths
- Authentication flows
- Payment flows

---

## Deployment

### Build Process
```bash
# Type-checking
tsc -b

# Vite build with optimizations
bun build

# Output: /dist directory
```

### Deployment Configuration
- **Platform**: Netlify (configured in `netlify.toml`)
- **SPA**: All routes redirect to `index.html`
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

### Environment Variables
Required variables (see `.env.example`):
```bash
VITE_API_URL=           # API base URL
VITE_APP_URL=           # Application URL
# Add Supabase credentials when implemented
```

---

## Common Patterns

### Custom Hook Pattern

```typescript
// src/hooks/use-something.ts
import { useQuery } from '@tanstack/react-query'

export function useSomething(id: string) {
  return useQuery({
    queryKey: ['something', id],
    queryFn: () => fetchSomething(id),
    enabled: !!id, // Only run when id exists
  })
}
```

### Feature Component Pattern

```typescript
// src/features/dashboard/components/dashboard-header.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardHeader() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  )
}
```

### Layout Component Pattern

```typescript
// src/components/layout/sidebar.tsx
import { cn } from '@/lib/utils'

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('w-64 border-r', className)}>
      {/* Sidebar content */}
    </aside>
  )
}
```

---

## Troubleshooting

### Common Issues

**Issue: Build fails with TypeScript errors**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
bun install
bun build
```

**Issue: Tailwind classes not working**
```bash
# Check Tailwind config
# Ensure content paths include src/
# Restart dev server
```

**Issue: Import errors with @ alias**
```bash
# Check tsconfig.json paths are correct
# Should be: "@/*": ["./src/*"]
```

**Issue: ESLint errors in Shadcn UI components**
```bash
# Shadcn components are ignored in ESLint config
# If you edit them, move to src/components/
```

---

## Resources

### Documentation
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack Query](https://tanstack.com/query/latest)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)

### Internal Documentation
- [README.md](./README.md) - Project overview
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

---

## Quick Reference

### File Paths to Remember
```
src/components/ui/        # Shadcn components (DO NOT EDIT)
src/features/            # Feature modules
src/routes/              # Route definitions
src/stores/              # Zustand stores
src/context/             # React contexts
src/hooks/               # Custom hooks
src/lib/                 # Utilities
vite.config.ts           # Vite configuration
tsconfig.json            # TypeScript configuration
eslint.config.js         # ESLint rules
.prettierrc              # Prettier config
```

### Essential Commands
```bash
bun dev          # Start development
bun build        # Build for production
bun lint         # Check code quality
bun format       # Format code
bun knip         # Find unused code
bun preview      # Preview build
```

### Must-Remember Rules
1. ✅ **DO NOT** edit `src/components/ui/*` - Use Shadcn CLI
2. ✅ **DO** organize code by feature in `src/features/`
3. ✅ **DO** use TanStack Query for server state
4. ✅ **DO** use Zustand for global state
5. ✅ **DO** type everything with TypeScript
6. ✅ **DO** run lint+format+knip+build before commit
7. ✅ **DO** follow import order (enforced)
8. ✅ **DO** use Zod for validation

---

**Generated for**: SuperUMO PaaS Admin Dashboard
**Last Updated**: 2025-02-14
**Maintainer**: Ariaseta Setia Alam
