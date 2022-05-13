import { Lifecycle, scoped } from 'tsyringe';
import {
  DataService,
  FocusedStyleService,
  HistoryService,
  TextInputService,
} from '../../services';
import { ToggleActionBase } from './_toggle-action-base';

@scoped(Lifecycle.ContainerScoped)
export class FontItalicController extends ToggleActionBase {
  constructor(
    public override focusedStyleService: FocusedStyleService,
    public override textInputService: TextInputService,
    public override historyService: HistoryService,
    public override dataService: DataService,
  ) {
    super('italic');
  }
}
