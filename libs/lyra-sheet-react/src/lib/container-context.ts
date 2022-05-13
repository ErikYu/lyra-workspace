import { createCore } from '@lyra-sheet/core';
import { container } from 'tsyringe';
import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';

console.log('============Creating core============');
createCore();
const c = container.createChildContainer();

export function useLyraSheetCore<T>(injectionToken: InjectionToken<T>): T {
  return c.resolve(injectionToken);
}

export { c };
