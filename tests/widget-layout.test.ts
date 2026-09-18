import { describe, expect, test } from 'bun:test';
import {
  getChatRoomDefaultWidgetSize,
  getChatRoomInitialWidgetSize,
  getChatRoomWidgetResizeBounds,
} from '../src/widget-layout';

describe('ChatRoom widget layout', () => {
  test('uses the native target size instead of treating a compact popout as mobile', () => {
    const fallback = getChatRoomDefaultWidgetSize({
      isMobile: false,
      viewportWidth: 160,
      viewportHeight: 100,
    });

    expect(getChatRoomInitialWidgetSize({
      isDesktopWidgetPopout: true,
      requestedWidth: 160,
      requestedHeight: 100,
      fallback,
    })).toEqual({ width: 160, height: 100 });
    expect(fallback).toEqual({ width: 440, height: 620 });
  });

  test('preserves a custom expanded size passed to the native popout', () => {
    expect(getChatRoomInitialWidgetSize({
      isDesktopWidgetPopout: true,
      requestedWidth: 732,
      requestedHeight: 684,
      fallback: { width: 440, height: 620 },
    })).toEqual({ width: 732, height: 684 });
  });

  test('falls back when native dimensions are absent or invalid', () => {
    expect(getChatRoomInitialWidgetSize({
      isDesktopWidgetPopout: true,
      requestedWidth: null,
      requestedHeight: 1000,
      fallback: { width: 440, height: 620 },
    })).toEqual({ width: 440, height: 620 });
  });

  test('retains existing compact mobile defaults outside native popouts', () => {
    expect(getChatRoomDefaultWidgetSize({
      isMobile: true,
      viewportWidth: 390,
      viewportHeight: 844,
    })).toEqual({ width: 374, height: 540 });
  });

  test('does not cap popout resizing against the current native viewport', () => {
    expect(getChatRoomWidgetResizeBounds({
      isDesktopWidgetPopout: true,
      isMobile: false,
      viewportWidth: 160,
      viewportHeight: 100,
    })).toEqual({ minWidth: 320, minHeight: 180, maxWidth: 900, maxHeight: 900 });
  });
});
