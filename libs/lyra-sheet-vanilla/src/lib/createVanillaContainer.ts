import { createCore } from '@lyra-sheet/core';
import { container, DependencyContainer } from 'tsyringe';

createCore();

export function createVanillaContainer(): DependencyContainer {
  return container.createChildContainer();
}
