# Product Feedback browser-local demo

This Next.js foundation demonstrates a fictional suggestion board, details, roadmap and local editing. It does not provide accounts, a shared backend, real author permissions or public profiles. The original Angular client was removed on October 13, 2026 and stays in git history. See reference/fixture-provenance.md for the sample-data limitations.

Use Node 24 and `npm ci`. The checks are `npm run lint`, `npm run typecheck`, `npm test` (domain unit tests), `npm run build` and `npm run test:browser` (Playwright against `next start` in an isolated Chrome; set `PW_PORT` to use a port other than 4394). On October 7, 2026 all five passed on this branch on Mac2 and in Mac1's independent review clone.

Changes save under one versioned browser-local key. Another tab’s changes require explicit reload; malformed saved data is not overwritten. Clearing browser data deletes local work. No network service receives feedback or comments. The demo must not be used for real personal feedback.

The pages follow the official Frontend Mentor design at its mobile, tablet and desktop frames, with two deliberate differences: text keeps a 16px minimum (the design uses 13–15px labels), so on phones narrower than about 400px "+ Add Feedback" wraps under Sort instead of sharing its row, and the brand card reads "Product Feedback" so the visible name matches the site name. A dark appearance and a footer with the demo notice, saved-data status and keyboard help are additions. Hosted multiuser authentication remains out of scope.

