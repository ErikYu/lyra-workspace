import { render, screen } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);

    expect(baseElement).toBeTruthy();
  });

  it('should mount LyraSheet', () => {
    render(<App />);

    expect(document.querySelector('.lyra-sheet')).toBeTruthy();
    expect(screen.getByTitle('undo')).toBeTruthy();
  });
});
