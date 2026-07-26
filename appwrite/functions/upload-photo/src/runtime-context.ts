export type FunctionRequest = {
  bodyJson: Record<string, unknown>;
  headers: Record<string, string>;
};

export type FunctionResponse = {
  json: (body: unknown, statusCode?: number) => unknown;
};

export type FunctionContext = {
  req: FunctionRequest;
  res: FunctionResponse;
  log: (message: string) => void;
  error: (message: string) => void;
};
