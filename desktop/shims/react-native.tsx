import React from 'react';
import * as RNW from 'react-native-web';

export * from 'react-native-web';

const alertAsync = (title: string, message?: string, buttons?: Array<{ text?: string; style?: string; onPress?: () => void | Promise<void> }>) => {
  const body = [title, message].filter(Boolean).join('\n\n');
  if (!buttons || buttons.length === 0) {
    window.alert(body);
    return;
  }
  if (buttons.length === 1) {
    window.alert(body);
    void buttons[0].onPress?.();
    return;
  }
  const confirmButton = buttons.find((b) => b.style !== 'cancel') ?? buttons[buttons.length - 1];
  const cancelButton = buttons.find((b) => b.style === 'cancel') ?? buttons[0];
  const result = window.confirm(`${body}\n\nOK: ${confirmButton.text ?? 'Confirmar'}   ·   Cancelar: ${cancelButton.text ?? 'Cancelar'}`);
  if (result) void confirmButton.onPress?.();
  else void cancelButton.onPress?.();
};

export const Alert = { alert: alertAsync };

const backHandlers = new Set<(event?: any) => boolean>();
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' && event.key !== 'BrowserBack') return;
    for (const handler of Array.from(backHandlers).reverse()) {
      if (handler(event)) { event.preventDefault(); event.stopPropagation(); return; }
    }
  });
}
export const BackHandler = {
  addEventListener: (_eventName: string, handler: (event?: any) => boolean) => {
    backHandlers.add(handler);
    return { remove: () => backHandlers.delete(handler) };
  },
};

const keyboardListeners = new Set<(event?: any) => void>();
export const Keyboard = {
  addListener: (_eventName: string, listener: (event?: any) => void) => {
    keyboardListeners.add(listener);
    return { remove: () => keyboardListeners.delete(listener) };
  },
  dismiss: () => {
    const active = document.activeElement as HTMLElement | null;
    active?.blur?.();
    for (const listener of keyboardListeners) listener();
  },
};

export function StatusBar(_props: any) { return null; }

// Explicit DOM-backed ScrollView for Electron desktop.
// IMPORTANT: the outer element has a definite viewport-sized scroll box, while
// the inner content is allowed to grow to its intrinsic height. Do not use a
// flex-growing/shrinking RN View as the scroll content: in Electron this can
// shrink the content to the viewport, which hides the lower onboarding fields
// and makes the page impossible to scroll.
const flattenDesktopStyle = (style: any): Record<string, any> =>
  (RNW.StyleSheet.flatten(style) || {}) as Record<string, any>;

export const ScrollView = React.forwardRef<HTMLDivElement, any>(function DesktopScrollView(props, ref) {
  const {
    children, style, contentContainerStyle, horizontal,
    keyboardShouldPersistTaps, keyboardDismissMode,
    showsVerticalScrollIndicator, showsHorizontalScrollIndicator,
    scrollEventThrottle, nestedScrollEnabled, persistentScrollbar, bounces,
    overScrollMode, contentInset, contentOffset, automaticallyAdjustContentInsets,
    onContentSizeChange, onScroll, refreshControl, maintainVisibleContentPosition,
    className, testID, nativeID, accessibilityLabel, accessibilityRole,
    ...domProps
  } = props;
  const outer = flattenDesktopStyle(style);
  const inner = flattenDesktopStyle(contentContainerStyle);
  const horizontalMode = !!horizontal;

  return (
    <div
      {...domProps}
      ref={ref}
      id={nativeID || domProps.id}
      data-testid={testID}
      data-horizontal={horizontalMode ? 'true' : 'false'}
      aria-label={accessibilityLabel}
      role={accessibilityRole}
      tabIndex={0}
      className={`gv-scroll-view${className ? ` ${className}` : ''}`}
      style={{
        boxSizing: 'border-box',
        display: 'block',
        position: outer.position ?? 'relative',
        width: outer.width ?? '100%',
        minWidth: 0,
        minHeight: 0,
        // Keep normal flex sizing for content pages; onboarding overrides this
        // with a definite viewport-height box via its own style.
        flex: outer.flex ?? '1 1 auto',
        alignSelf: outer.alignSelf ?? 'stretch',
        ...outer,
        // Force actual DOM scroll behavior after React Native Web styles.
        overflowY: horizontalMode ? 'hidden' : 'auto',
        overflowX: horizontalMode ? 'auto' : 'hidden',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
      } as React.CSSProperties}
    >
      <div
        className="gv-scroll-content"
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: horizontalMode ? 'row' : 'column',
          alignItems: 'stretch',
          width: inner.width ?? (horizontalMode ? 'max-content' : '100%'),
          minWidth: 0,
          ...inner,
          // Override RN content styles so content never shrinks to the viewport.
          width: horizontalMode ? 'max-content' : (inner.width ?? '100%'),
          flexGrow: 0,
          flexShrink: 0,
          height: 'max-content',
          minHeight: 'max-content',
          boxSizing: 'border-box',
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
});
ScrollView.displayName = 'DesktopScrollView';
