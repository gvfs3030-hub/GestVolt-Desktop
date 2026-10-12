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
