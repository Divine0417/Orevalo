export function safeNext(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/account'
}

export const PASSWORD_RESET_PATH = '/reset-password'
