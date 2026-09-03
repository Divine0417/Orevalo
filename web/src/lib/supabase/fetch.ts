export async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(input, init)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}
