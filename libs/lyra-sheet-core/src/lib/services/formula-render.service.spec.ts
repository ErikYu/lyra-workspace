import 'reflect-metadata';
import { DataService } from './data.service';
import { FormulaRenderService } from './formula-render.service';

describe('FormulaRenderService', () => {
  function createService(cells: Record<string, string> = {}): FormulaRenderService {
    return new FormulaRenderService({
      selectedSheet: {
        getCellPlainText: (ri: number, ci: number) => cells[`${ri},${ci}`],
      },
    } as DataService);
  }

  function expectFormulaError(
    service: FormulaRenderService,
    formula: string,
    expectedErrorMessage?: string,
  ) {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(service.conv([[{ text: formula, style: {} }]])).toEqual([
      [{ text: '#Error', style: {} }],
    ]);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    if (expectedErrorMessage) {
      expect(consoleErrorSpy.mock.calls[0][0]).toEqual(
        expect.objectContaining({ message: expectedErrorMessage }),
      );
    }

    consoleErrorSpy.mockRestore();
  }

  it('evaluates arithmetic expressions', () => {
    const service = createService();

    expect(service.convPlainText('=1+2*3')).toBe('7');
  });

  it('evaluates SUM over literal arguments', () => {
    const service = createService();

    expect(service.convPlainText('=SUM(1,2,3)')).toBe(6);
  });

  it('evaluates same-sheet cell references', () => {
    const service = createService({
      '0,0': '2',
      '0,1': '3',
    });

    expect(service.convPlainText('=A1+B1')).toBe('5');
  });

  it('returns #Error through conv when evaluation throws', () => {
    const service = createService();

    expectFormulaError(service, '=UNKNOWN(1)');
  });

  it('returns #Error through conv for circular references', () => {
    const service = createService({
      '0,0': '=A1',
    });

    expectFormulaError(service, '=A1', 'Circular formula reference: A1');
  });
});
