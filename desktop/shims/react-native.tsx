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

// Explicit DOM-backed ScrollView for Electron desktop. React Native Web accepts
// the CSS `overflow` property, but platform-specific `overflowY` can be dropped
// by its style resolver. That made tall onboarding/forms impossible to scroll.
// This shim is used only by the desktop Vite build; the Android app continues
// to use the native React Native ScrollView.
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
      className={`gv-scroll-view${className ? ` ${className}` : ''}`}
      style={{
        boxSizing: 'border-box',
        minWidth: 0,
        minHeight: 0,
        flex: 1,
        ...outer,
        // Always override RN-specific overflow fields with real DOM CSS.
        overflowY: horizontalMode ? 'hidden' : 'auto',
        overflowX: horizontalMode ? 'auto' : 'hidden',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
      } as React.CSSProperties}
    >
      <RNW.View
        style={[
          { flexGrow: 1, minWidth: 0, flexDirection: horizontalMode ? 'row' : 'column' },
          contentContainerStyle,
        ]}
      >
        {children}
      </RNW.View>
    </div>
  );
});
ScrollView.displayName = 'DesktopScrollView';
