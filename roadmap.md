# CoreSkils exact-clone port — roadmap

## Done
- [x] Lovable Cloud enabled; schema + RLS + categories seeded
- [x] Auth: email/password + Google
- [x] Foundation ported from original repo: theme CSS, layout (Navbar/Footer/PublicLayout/DashboardLayout), i18n, session hook, toast, error boundary, assets in public/images + public/brand
- [x] Public pages ported: Home, About, Courses, Creators, CreatorProfile, Products
- [x] Auth pages ported: login, sign-up, creator application
- [x] Dashboard components ported: dialogs, course player, product views
- [x] Build green (typecheck OK)

## In progress (agents running)
- [ ] CourseDetail + ProductDetail routes (agent sub_yfz5dayz)
- [ ] Compliance pages overwrite with original copy (agent sub_yfz5dayz)
- [ ] NotFound / UnavailablePage (agent sub_yfz5dayz)
- [ ] Student/Creator/Admin dashboard route overwrites with original design (agent sub_9n48zr1x)

## Blocked / later
- [ ] Demo data seeding — needs first user sign-up + email confirmation (no auth users yet)
- [ ] Phase 2: live classes (LiveKit), ZapUPI payments, file/video uploads, AI outlines, admin settings backend
- [ ] End-to-end browser verification with a signed-in account
