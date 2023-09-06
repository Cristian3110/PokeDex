// interface for our custom provide

export interface HttpAdapter {
  get<T>(url: string): Promise<T>;
}
