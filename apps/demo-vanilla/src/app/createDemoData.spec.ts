import { createDemoConfig, createDemoData } from './createDemoData';

describe('demo vanilla data', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a selected sheet with demo cell data', () => {
    const data = createDemoData();

    expect(data.sheets).toHaveLength(1);
    expect(data.sheets[0].selected).toBe(true);
    expect(data.sheets[0].data.rows[1].cells[1].richText[0][0].text).toBe(
      '123',
    );
  });

  it('creates a viewport-sized config', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 600,
    });

    const config = createDemoConfig();

    expect(config.width()).toBe(1000);
    expect(config.height()).toBe(600);
  });
});
