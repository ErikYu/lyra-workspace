import 'reflect-metadata';
import { DataService } from '@lyra-sheet/core';
import { createVanillaContainer } from './createVanillaContainer';

describe('createVanillaContainer', () => {
  it('creates isolated DataService instances', () => {
    const first = createVanillaContainer().resolve(DataService);
    const second = createVanillaContainer().resolve(DataService);

    expect(first).not.toBe(second);
  });
});
