import { Lifecycle, scoped } from 'tsyringe';
import { ToggleActionBase } from './_toggle-action-base';
import {
  DataService,
  FocusedStyleService,
  HistoryService,
  TextInputService,
} from '../../services';

@scoped(Lifecycle.ContainerScoped)
export class FontStrikeController extends ToggleActionBase {
  constructor(
    public override focusedStyleService: FocusedStyleService,
    public override textInputService: TextInputService,
    public override historyService: HistoryService,
    public override dataService: DataService,
  ) {
    super('strike');
  }
}
