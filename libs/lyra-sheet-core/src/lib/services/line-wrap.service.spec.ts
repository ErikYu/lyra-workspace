import 'reflect-metadata';
import { CanvasService } from './canvas.service';
import { LineWrapService } from './line-wrap.service';

describe('LineWrapService', () => {
  it('formats a numeric line as a percent', () => {
    const service = new LineWrapService({} as CanvasService);

    expect(service.convOnPercent([[{ text: '0.25' }]])).toEqual([
      [{ text: '25%', style: undefined }],
    ]);
  });
});
