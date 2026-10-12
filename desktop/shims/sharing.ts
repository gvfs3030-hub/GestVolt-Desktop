import { resolveExportPath } from './filesystem';
export async function isAvailableAsync(): Promise<boolean> { return true; }
export async function shareAsync(uri: string, _options?: any): Promise<void> {
  const path = resolveExportPath(uri);
  if (!path) throw new Error('O arquivo exportado não foi localizado.');
  await window.gestvolt.revealFile(path);
  await window.gestvolt.showMessage('Arquivo criado', `O arquivo foi salvo em:\n${path}\n\nA pasta foi aberta para você localizar o arquivo.`);
}
