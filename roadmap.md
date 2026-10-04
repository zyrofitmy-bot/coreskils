# CoreSkils LMS rebuild — roadmap

## Done
- [x] Map original repo (schema, pages, API)
- [x] Database schema + RLS + category seeds (migrations 0000, 0001)
- [x] Auth: email/password + Google enabled
- [x] Server functions: marketplace, account, creator, admin
- [x] Public pages: home, courses, course detail, products, product detail, creators, creator profile, about, contact, terms, privacy, refund policy
- [x] Auth pages: sign in/up, reset password, creator application
- [x] Dashboards: student, creator, admin (behind auth gate)
- [x] Build clean; public pages verified rendering in browser

## Blocked — needs user action
- [ ] First user sign-up: no accounts exist yet and email confirmation is on, so I can't create one. Sign up via "Get started", confirm the email, then tell me — I'll make you admin + creator and seed demo courses/products.

## Deferred (phase 2)
- [ ] Live classes (LiveKit)
- [ ] Payments (ZapUPI / Stripe / Paddle)
- [ ] AI course outline generation
- [ ] File/video uploads to storage
- [ ] Certificates issuance UI
