export interface ServerResponse {
  success: boolean
  message?: string
}

export interface ContentGetResponse extends ServerResponse {
  content?: Record<string, unknown>
}

export interface ContentImageListResponse extends ServerResponse {
  images?: string[]
}

export interface ContentDeployResponse extends ServerResponse {
  missingDeployHookURL?: boolean
}

export interface LoginResponse extends ServerResponse {
  token?: string
}
