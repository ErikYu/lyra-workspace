# Lyra Workspace

Lyra Sheet is a web-canvas-based spreadsheet component. The framework-agnostic spreadsheet engine lives in `libs/lyra-sheet-core`, while `libs/lyra-sheet-angular` and `libs/lyra-sheet-react` provide Angular and React integrations.

## Recommended Environment

This project uses Nx 13, Angular 13, React 18, and TypeScript 4.6. Prefer Node 16 when reviving or maintaining the project because Angular 13 and ngcc may fail on newer Node versions.

## Development

- Install dependencies: `yarn install`
- Start Angular demo: `yarn start-ng`
- Start React demo: `yarn start-react`
- Build core library: `yarn build-core-lib`
- Build Angular library: `yarn build-ng-lib`
- Build React library: `yarn build-react-lib`
- Run tests: `yarn test`
- Run lint checks: `yarn lint`
