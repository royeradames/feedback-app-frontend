# Product Feedback browser-local foundation

This Next.js foundation demonstrates a fictional suggestion board, details, roadmap and local editing. It does not provide accounts, a shared backend, real author permissions or public profiles. Historical Angular source/assets are retained; original root toolchain files are under historical/angular. See reference/fixture-provenance.md for the sample-data limitations.

Use Node 24. Install dependencies and generate the new lock before running npm run dev, npm run typecheck, npm run lint, npm test, npm run build and npm run test:browser. The source-preparation candidate has not yet run those checks. Browser verification uses an isolated Chrome process and port 4394.

Changes save under one versioned browser-local key. Another tab’s changes require explicit reload; malformed saved data is not overwritten. Clearing browser data deletes local work. No network service receives feedback or comments. The demo must not be used for real personal feedback.

The current official Frontend Mentor packet/design comparison and hosted multiuser authentication remain outstanding. The original README follows.

---

# FeedbackAppFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
