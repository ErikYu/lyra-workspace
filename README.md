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

## Formula Support

The current formula engine is lightweight. It supports basic arithmetic, same-sheet A1 references, ranges such as `A1:B2`, and the functions `SUM`, `AVERAGE`, `MAX`, `MIN`, `IF`, `AND`, and `OR`.

It does not yet support dependency graphs, incremental recalculation, cross-sheet references, named ranges, or Excel-compatible function coverage. Circular references and unsupported expressions are treated as formula errors.
