import { describe, expect, it } from 'vitest'
import { PASSWORD_RESET_PATH, safeNext } from './auth'

describe('safeNext', () => {
  it('allows internal paths', () => {
    expect(safeNext('/account')).toBe('/account')
    expect(safeNext('/admin/applications?status=new')).toBe('/admin/applications?status=new')
  })

  it('blocks external and protocol-relative redirects', () => {
    expect(safeNext('https://example.com')).toBe('/account')
    expect(safeNext('//example.com')).toBe('/account')
    expect(safeNext('account')).toBe('/account')
  })
})

describe('password reset destination', () => {
  it('uses the reset-password completion route', () => {
    expect(PASSWORD_RESET_PATH).toBe('/reset-password')
  })
})
