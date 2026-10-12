declare module '*.png' {
  const src: string;
  export default src;
}

declare module 'expo-sqlite' {
  export interface SQLiteDatabase {
    execAsync(source: string): Promise<void>;
    runAsync(source: string, ...params: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
    getFirstAsync<T = any>(source: string, ...params: any[]): Promise<T | null>;
    getAllAsync<T = any>(source: string, ...params: any[]): Promise<T[]>;
    withTransactionAsync(task: () => Promise<void>): Promise<void>;
  }
  export function openDatabaseAsync(name: string): Promise<SQLiteDatabase>;
}

declare module 'expo-secure-store' {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string, options?: any): Promise<void>;
}

declare module 'expo-crypto' {
  export function randomUUID(): string;
}

declare module 'expo-document-picker' {
  export function getDocumentAsync(options?: any): Promise<any>;
}

declare module 'expo-file-system/legacy' {
  export const documentDirectory: string;
  export const EncodingType: { UTF8: string };
  export function writeAsStringAsync(uri: string, contents: string, options?: any): Promise<void>;
  export function readAsStringAsync(uri: string, options?: any): Promise<string>;
}

declare module 'expo-sharing' {
  export function isAvailableAsync(): Promise<boolean>;
  export function shareAsync(uri: string, options?: any): Promise<void>;
}

interface Window {
  gestvolt: {
    loadDatabase: () => Promise<{ bytes: ArrayBuffer | null; encryptionAvailable: boolean; location: string }>;
    saveDatabase: (bytes: Uint8Array) => Promise<{ encryptionAvailable: boolean }>;
    loadSqlWasm: () => Promise<ArrayBuffer>;

    writeExport: (filename: string, contents: string) => Promise<{ path: string }>;
    readTextFile: (filePath: string) => Promise<string>;
    chooseImportFile: () => Promise<{ canceled: boolean; path?: string; name?: string }>;
    revealFile: (filePath: string) => Promise<void>;
    showMessage: (title: string, message: string) => Promise<void>;
    getStorageInfo: () => Promise<{ encryptionAvailable: boolean; dataDirectory: string }>;
  };
}
