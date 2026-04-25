import { createCore } from '@lyra-sheet/core';
import { createContext, useContext } from 'react';
import { container, DependencyContainer } from 'tsyringe';
import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';

createCore();

const LyraSheetContainerContext = createContext<DependencyContainer | null>(
  null,
);

export const LyraSheetContainerProvider = LyraSheetContainerContext.Provider;

export function createLyraSheetContainer(): DependencyContainer {
  return container.createChildContainer();
}

export function useLyraSheetCore<T>(injectionToken: InjectionToken<T>): T {
  const scopedContainer = useContext(LyraSheetContainerContext);
  if (!scopedContainer) {
    throw new Error(
      'useLyraSheetCore must be used inside LyraSheetContainerProvider',
    );
  }
  return scopedContainer.resolve(injectionToken);
}
