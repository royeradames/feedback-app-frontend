# Historical sample provenance

This is a manually transcribed fictional browser-local fixture, not a certified copy of the current Frontend Mentor starter JSON. No database seed has been imported or executed.

- Frontend: royeradames/feedback-app-frontend, master 532c2d3d5734c855bf6d25ee4e7cda8d44bdd587. Original Angular source/configuration remains in the repository. Root package, lock and TypeScript configuration are preserved under historical/angular.
- Backend source used only for literal data: royeradames/product-feedback, master 25aa23fe882fad83c14779086641e5a7426bdd2c.
- Requests: src/db/seeds/productRequests.ts SHA256 d2d76e88dbafb47815350ecb60b8e1ac1f2ba3250ed341d0051cccdf98a55e37.
- Users: src/db/seeds/users.ts SHA256 59ea10149952956d37b21ecdb5ec1e3845da6897f5b531f590d91fc88b5bd327.
- Comments: src/db/seeds/comments.ts SHA256 093c7f06c79ad375ff49c398f5e31e383f6ae55d439bdd8c5964fea83a787495.

The fixture has 12 requests, 12 historical sample users and 19 comment/reply rows. Request authorship is absent in the seed: the UI labels it “Sample feedback”, never assigns a historical user by inference. Aggregate upvotes remain fictional baseline numbers. Only the separate demo-actor vote set records actual local toggles. New local feedback starts at zero.

Stable comment IDs follow source array order. Explicit source block annotations determine these parent mappings: comment-05 and comment-06 → comment-04; comment-11 → comment-10; comment-19 → comment-18. The source's hummingbird1 and arlen_the_marlin reply labels do not match two parent authors. We retain their exact labels as legacy sample text and do not invent identities to resolve them. Newly composed replies use the selected existing comment ID and actual displayed username.

This demo permits local edits/deletions of fictional sample rows. That is not a future account/author/admin permission model. Do not auto-import these fixtures into real user accounts. No credential inputs, shared auth package or historical backend calls are part of this foundation. The entitled official packet, exact design comparison, account flows and durable multiuser backend remain outstanding.
