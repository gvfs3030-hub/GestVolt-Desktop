const exportedPaths = new Map<string, string>();
export const documentDirectory = 'gestvolt-local://documents/';
export const EncodingType = { UTF8: 'utf8' } as const;

export async function writeAsStringAsync(uri: string, contents: string, _options?: any): Promise<void> {
  const filename = decodeURIComponent(uri.split('/').pop() || 'gestvolt-export.txt');
  const result = await window.gestvolt.writeExport(filename, contents);
  exportedPaths.set(uri, result.path);
}

export async function readAsStringAsync(uri: string, _options?: any): Promise<string> {
  const filePath = exportedPaths.get(uri) ?? uri;
  return window.gestvolt.readTextFile(filePath);
}

export function resolveExportPath(uri: string): string | undefined { return exportedPaths.get(uri); }
