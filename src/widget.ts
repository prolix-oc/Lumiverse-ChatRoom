import type {
  SpindleFrontendContext,
  SpindleFrontendWidgetTarget,
} from 'lumiverse-spindle-types';
import { setup } from './frontend';
import { createDesktopWidgetContext } from './widget-context';

export function setupWidget(
  context: SpindleFrontendContext,
  _target: SpindleFrontendWidgetTarget,
) {
  return setup(createDesktopWidgetContext(context));
}
