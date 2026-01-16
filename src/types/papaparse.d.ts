declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }

  export interface ParseConfig<T> {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean | Record<string, boolean>;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: string;
    step?: (results: ParseResult<T>, parser: any) => void;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: any, file?: File) => void;
    download?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    chunk?: (results: ParseResult<T>, parser: any) => void;
    fastMode?: boolean;
    beforeFirstChunk?: (chunk: string) => string;
    transform?: (value: string, field: string) => any;
    transformHeader?: (header: string) => string;
  }

  export function parse<T>(csv: string | File, config?: ParseConfig<T>): ParseResult<T>;
  export function unparse<T>(data: T[], config?: any): string;
  export function unparse<T>(config: { fields?: string[]; data: T[] }): string;
  export const DEFAULT_CONFIG: ParseConfig<any>;
}

export default papaparse;