import 'reflect-metadata';
import { LyraSheetVanilla } from '@lyra-sheet/vanilla';
import {
  createDemoConfig,
  createDemoData,
  saveDemoData,
} from './app/createDemoData';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

const sheet = new LyraSheetVanilla({
  data: createDemoData(),
  config: createDemoConfig(),
  onDataChange: saveDemoData,
});

sheet.mount(root);
