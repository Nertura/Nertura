# RLS policy modules

Modular Row Level Security policies for Nertura tenant tables.

These files are the **source of truth** for policy definitions. They are mirrored (inlined) in:

`supabase/migrations/20250619000500_apply_policies.sql`

When changing policies:

1. Edit the relevant file in this directory
2. Copy changes into the apply-policies migration (or add a new forward migration)
3. Add tests under `supabase/tests/rls/`

## Policy patterns

| Pattern | Tables |
|---------|--------|
| Member read / operator write / admin soft-delete | `farms`, `fields` |
| Member read / operator write+soft-delete | `crops` |
| Self + org admin | `users`, `ai_conversations` |
| Finance admin read / service write | `subscriptions` |
| Append-only / admin read | `audit_logs` |

Helper functions live in `private` schema — see `20250619000250_security_functions.sql`.
