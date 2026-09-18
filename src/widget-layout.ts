export interface WidgetSize {
  width: number;
  height: number;
}

interface DefaultWidgetSizeOptions {
  isMobile: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

interface InitialWidgetSizeOptions {
  isDesktopWidgetPopout: boolean;
  requestedWidth: number | null;
  requestedHeight: number | null;
  fallback: WidgetSize;
}

interface WidgetResizeBoundsOptions extends DefaultWidgetSizeOptions {
  isDesktopWidgetPopout: boolean;
}

export interface WidgetResizeBounds {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

const DESKTOP_DEFAULT_SIZE: WidgetSize = { width: 440, height: 620 };
const NATIVE_MIN_WIDTH = 160;
const NATIVE_MIN_HEIGHT = 100;
const NATIVE_MAX_WIDTH = 1200;
const NATIVE_MAX_HEIGHT = 900;

export function getChatRoomDefaultWidgetSize(options: DefaultWidgetSizeOptions): WidgetSize {
  if (!options.isMobile) return { ...DESKTOP_DEFAULT_SIZE };

  return {
    width: Math.min(380, options.viewportWidth - 16),
    height: Math.min(540, options.viewportHeight - 80),
  };
}

export function getChatRoomInitialWidgetSize(options: InitialWidgetSizeOptions): WidgetSize {
  if (!options.isDesktopWidgetPopout) return { ...options.fallback };

  const width = options.requestedWidth;
  const height = options.requestedHeight;
  const hasValidNativeSize =
    width !== null &&
    height !== null &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width >= NATIVE_MIN_WIDTH &&
    width <= NATIVE_MAX_WIDTH &&
    height >= NATIVE_MIN_HEIGHT &&
    height <= NATIVE_MAX_HEIGHT;

  if (!hasValidNativeSize) return { ...options.fallback };

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function getChatRoomWidgetResizeBounds(options: WidgetResizeBoundsOptions): WidgetResizeBounds {
  return {
    minWidth: options.isMobile ? 260 : 320,
    minHeight: options.isMobile ? 120 : 180,
    maxWidth: options.isDesktopWidgetPopout
      ? 900
      : Math.min(900, options.viewportWidth - (options.isMobile ? 8 : 32)),
    maxHeight: options.isDesktopWidgetPopout
      ? NATIVE_MAX_HEIGHT
      : Math.min(1000, options.viewportHeight - (options.isMobile ? 32 : 64)),
  };
}
