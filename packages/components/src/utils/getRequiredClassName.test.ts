import { describe, expect, it } from 'vitest';
import { getRequiredClassName } from './getRequiredClassName';

describe('getRequiredClassName', () => {
  it('returns the matching class name when present', () => {
    expect(getRequiredClassName({ root: 'root_hash' }, 'root')).toBe('root_hash');
  });

  it('throws when the CSS module class is missing', () => {
    expect(() => getRequiredClassName({}, 'root')).toThrowError('Missing CSS module class: root');
  });
});
