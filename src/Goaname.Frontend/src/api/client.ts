export async function readErrorMessage(response: Response): Promise<string> {
  const body = await response.text();
  if (!body) {
    return `Request failed (${response.status})`;
  }

  try {
    const parsed = JSON.parse(body) as {
      title?: string;
      detail?: string;
      errors?: Record<string, string[]>;
    };

    if (parsed.detail) {
      return parsed.detail;
    }

    if (parsed.errors) {
      const firstError = Object.values(parsed.errors).flat()[0];
      if (firstError) {
        return firstError;
      }
    }

    if (parsed.title) {
      return parsed.title;
    }
  } catch {
    // Plain-text error body
  }

  return body;
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.text();
  if (!body) {
    return undefined as T;
  }

  return JSON.parse(body) as T;
}
