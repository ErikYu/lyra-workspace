/**
 * @jest-environment jsdom
 */
import { ToggleActionBase } from './_toggle-action-base';

class TestToggleAction extends ToggleActionBase {
  constructor(styleAttr: 'italic' | 'bold' | 'strike' | 'underline') {
    super(styleAttr);
  }
}

describe('ToggleActionBase', () => {
  it('uses strikeThrough execCommand for strike in editing mode', () => {
    const action = new TestToggleAction('strike');
    const execSpy = jest.fn(() => true);
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      writable: true,
      value: execSpy,
    });

    (action as any).textInputService = { isEditing: true };

    action.toggle();

    expect(execSpy).toHaveBeenCalledWith('strikeThrough', false);
  });
});
