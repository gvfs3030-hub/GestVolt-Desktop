export async function getDocumentAsync(_options?: any): Promise<any> {
  const result = await window.gestvolt.chooseImportFile();
  if (result.canceled || !result.path) return { canceled: true, assets: [] };
  return { canceled: false, assets: [{ uri: result.path, name: result.name ?? result.path.split(/[\\/]/).pop(), mimeType: 'application/json' }] };
}
