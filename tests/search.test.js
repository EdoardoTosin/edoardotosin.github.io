'use strict';

const { stem, tokenize, parseQuery, parseFilterDate, parseNumericFilter } = require('../assets/js/search.js');

describe('stem', () => {
  test('strips -ations suffix', () => expect(stem('regulations')).toBe('regulate'));
  // rule /nesses?$/ matches "nesse"/"nesses", not bare "ness"
  test('strips -nesses suffix', () => expect(stem('sadnesses')).toBe('sad'));
  test('strips -ment suffix', () => expect(stem('movement')).toBe('move'));
  // rule /ities?$/ matches "itie"/"ities", not bare "ity"
  test('strips -ities suffix', () => expect(stem('activities')).toBe('activy'));
  test('strips -ing suffix', () => expect(stem('running')).toBe('runn'));
  test('strips -er suffix', () => expect(stem('runner')).toBe('runn'));
  test('strips -ies suffix', () => expect(stem('companies')).toBe('company'));
  test('strips -ied suffix', () => expect(stem('tried')).toBe('try'));
  test('strips -ed suffix', () => expect(stem('jumped')).toBe('jump'));
  test('strips -ly suffix', () => expect(stem('quickly')).toBe('quick'));
  test('strips trailing -s', () => expect(stem('cats')).toBe('cat'));
  test('strips -iers suffix', () => expect(stem('carriers')).toBe('carry'));
  test('strips -ier suffix', () => expect(stem('carrier')).toBe('carry'));
  test('leaves short word intact', () => expect(stem('go')).toBe('go'));
  test('leaves 3-char word intact', () => expect(stem('cat')).toBe('cat'));
});

describe('tokenize', () => {
  test('splits on non-word chars', () => expect(tokenize('hello world', false)).toEqual(['hello', 'world']));
  test('removes stop words', () => expect(tokenize('the quick brown fox', false)).toEqual(['quick', 'brown', 'fox']));
  test('removes single-char tokens', () => expect(tokenize('a b c dog', false)).toEqual(['dog']));
  test('stems when doStem=true', () => expect(tokenize('running dogs', true)).toEqual(['runn', 'dog']));
  test('does not stem when doStem=false', () => expect(tokenize('running dogs', false)).toEqual(['running', 'dogs']));
  test('returns [] for empty string', () => expect(tokenize('', false)).toEqual([]));
  test('returns [] for null', () => expect(tokenize(null, false)).toEqual([]));
  test('returns [] for undefined', () => expect(tokenize(undefined, false)).toEqual([]));
  test('returns [] when all tokens are stop words', () => expect(tokenize('the is a', false)).toEqual([]));
});

describe('parseFilterDate', () => {
  describe('year only', () => {
    test('start of 2024 → Jan 1 00:00:00.000', () => {
      const d = parseFilterDate('2024', true);
      expect(d).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0));
    });
    test('end of 2024 → Dec 31 23:59:59.999', () => {
      const d = parseFilterDate('2024', false);
      expect(d).toEqual(new Date(2024, 11, 31, 23, 59, 59, 999));
    });
  });

  describe('year-month', () => {
    test('start of 2024-06 → Jun 1 00:00:00.000', () => {
      const d = parseFilterDate('2024-06', true);
      expect(d).toEqual(new Date(2024, 5, 1, 0, 0, 0, 0));
    });
    test('end of 2024-06 → Jun 30 23:59:59.999', () => {
      const d = parseFilterDate('2024-06', false);
      expect(d).toEqual(new Date(2024, 5, 30, 23, 59, 59, 999));
    });
  });

  describe('full date', () => {
    test('start of 2024-06-15 → Jun 15 00:00:00.000', () => {
      const d = parseFilterDate('2024-06-15', true);
      expect(d).toEqual(new Date(2024, 5, 15, 0, 0, 0, 0));
    });
    test('end of 2024-06-15 → Jun 15 23:59:59.999', () => {
      const d = parseFilterDate('2024-06-15', false);
      expect(d).toEqual(new Date(2024, 5, 15, 23, 59, 59, 999));
    });
  });

  describe('february end-of-month', () => {
    test('end of 2024-02 (leap year) → Feb 29', () => {
      const d = parseFilterDate('2024-02', false);
      expect(d).toEqual(new Date(2024, 1, 29, 23, 59, 59, 999));
    });
    test('end of 2023-02 (non-leap) → Feb 28', () => {
      const d = parseFilterDate('2023-02', false);
      expect(d).toEqual(new Date(2023, 1, 28, 23, 59, 59, 999));
    });
  });

  test('invalid value returns null', () => {
    expect(parseFilterDate('notadate', true)).toBeNull();
  });
});

describe('parseNumericFilter', () => {
  function run(val) {
    const f = {};
    parseNumericFilter(val, 'minW', 'maxW', f);
    return f;
  }

  test('>500 sets minW=501', () => expect(run('>500')).toEqual({ minW: 501 }));
  test('<500 sets maxW=499', () => expect(run('<500')).toEqual({ maxW: 499 }));
  test('>=500 sets minW=500', () => expect(run('>=500')).toEqual({ minW: 500 }));
  test('<=500 sets maxW=500', () => expect(run('<=500')).toEqual({ maxW: 500 }));
  test('200-800 sets both', () => expect(run('200-800')).toEqual({ minW: 200, maxW: 800 }));
  test('exact 500 sets both equal', () => expect(run('500')).toEqual({ minW: 500, maxW: 500 }));
  test('no match leaves object empty', () => expect(run('abc')).toEqual({}));
});

describe('parseQuery - phrase search', () => {
  test('"double-quote phrase" → phrases', () => {
    const p = parseQuery('"machine learning"');
    expect(p.phrases).toContain('machine learning');
  });

  test("'single-quote phrase' → phrases", () => {
    const p = parseQuery("'machine learning'");
    expect(p.phrases).toContain('machine learning');
  });

  test('-"double-quote" → excludePhrases', () => {
    const p = parseQuery('-"machine learning"');
    expect(p.excludePhrases).toContain('machine learning');
    expect(p.excludes).toHaveLength(0);
  });

  test("-'single-quote' → excludePhrases", () => {
    const p = parseQuery("-'machine learning'");
    expect(p.excludePhrases).toContain('machine learning');
    expect(p.excludes).toHaveLength(0);
  });
});

describe('parseQuery - minus / exclude', () => {
  test('-word at start excludes', () => {
    const p = parseQuery('-python');
    expect(p.excludes.length).toBeGreaterThan(0);
  });

  test('-word after space excludes', () => {
    const p = parseQuery('javascript -python');
    expect(p.excludes).toContain(stem('python'));
  });

  test('hyphenated word does NOT add to excludes', () => {
    const p = parseQuery('machine-learning');
    expect(p.excludes).toHaveLength(0);
  });

  test('hyphenated word keeps terms', () => {
    const p = parseQuery('machine-learning');
    // "machine-learning" is a single token after split on non-word; terms should include it
    expect(p.terms.length).toBeGreaterThan(0);
  });
});

describe('parseQuery - field filters', () => {
  test('topic:value sets fields.topic', () => {
    expect(parseQuery('topic:javascript').fields).toMatchObject({ topic: 'javascript' });
  });

  test('tag:value sets fields.tag', () => {
    expect(parseQuery('tag:css').fields).toMatchObject({ tag: 'css' });
  });

  test('site:value aliases to fields.topic', () => {
    expect(parseQuery('site:mysite').fields).toMatchObject({ topic: 'mysite' });
  });

  test('intitle:word stemmed into filters.inTitle', () => {
    const p = parseQuery('intitle:running');
    expect(p.filters.inTitle).toContain(stem('running'));
  });

  test('inurl:path unstemmed into filters.inUrl', () => {
    const p = parseQuery('inurl:about');
    expect(p.filters.inUrl).toContain('about');
  });
});

describe('parseQuery - date filters', () => {
  test('after:2024 → filters.after = Jan 1 2024 00:00:00.000', () => {
    const p = parseQuery('after:2024');
    expect(p.filters.after).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0));
  });

  test('before:2024 → filters.before = Dec 31 2024 23:59:59.999', () => {
    const p = parseQuery('before:2024');
    expect(p.filters.before).toEqual(new Date(2024, 11, 31, 23, 59, 59, 999));
  });

  test('after:2024 before:2024 targets only year 2024', () => {
    const p = parseQuery('after:2024 before:2024');
    expect(p.filters.after.getFullYear()).toBe(2024);
    expect(p.filters.before.getFullYear()).toBe(2024);
    expect(p.filters.after).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0));
    expect(p.filters.before).toEqual(new Date(2024, 11, 31, 23, 59, 59, 999));
  });

  test('after:2024-06 → filters.after = Jun 1 2024', () => {
    const p = parseQuery('after:2024-06');
    expect(p.filters.after).toEqual(new Date(2024, 5, 1, 0, 0, 0, 0));
  });

  test('before:2024-06 → filters.before = Jun 30 2024 end of day', () => {
    const p = parseQuery('before:2024-06');
    expect(p.filters.before).toEqual(new Date(2024, 5, 30, 23, 59, 59, 999));
  });

  test('after:2024-06-15 → filters.after = Jun 15 2024 start', () => {
    const p = parseQuery('after:2024-06-15');
    expect(p.filters.after).toEqual(new Date(2024, 5, 15, 0, 0, 0, 0));
  });
});

describe('parseQuery - type/feature filters', () => {
  test('is:featured → filters.isFeatured=true', () => {
    expect(parseQuery('is:featured').filters.isFeatured).toBe(true);
  });

  test('is:post → filters.isType="post"', () => {
    expect(parseQuery('is:post').filters.isType).toBe('post');
  });

  test('has:image → filters.hasImage=true', () => {
    expect(parseQuery('has:image').filters.hasImage).toBe(true);
  });
});

describe('parseQuery - numeric filters', () => {
  test('words:>500 sets wordsMin=501', () => {
    expect(parseQuery('words:>500').filters.wordsMin).toBe(501);
  });

  test('words:<=500 sets wordsMax=500', () => {
    expect(parseQuery('words:<=500').filters.wordsMax).toBe(500);
  });

  test('words:200-800 sets both bounds', () => {
    const f = parseQuery('words:200-800').filters;
    expect(f.wordsMin).toBe(200);
    expect(f.wordsMax).toBe(800);
  });

  test('time:<=5 sets timeMax=5', () => {
    expect(parseQuery('time:<=5').filters.timeMax).toBe(5);
  });

  test('time:>10 sets timeMin=11', () => {
    expect(parseQuery('time:>10').filters.timeMin).toBe(11);
  });
});

describe('parseQuery - OR groups', () => {
  test('a OR b → orGroups with two single-term groups', () => {
    const p = parseQuery('react OR vue');
    expect(p.orGroups).not.toBeNull();
    const flat = p.orGroups.flat();
    expect(flat).toContain(stem('react'));
    expect(flat).toContain(stem('vue'));
  });

  test('(a OR b) inline group → orGroups', () => {
    const p = parseQuery('(python OR javascript)');
    expect(p.orGroups).not.toBeNull();
    const flat = p.orGroups.flat();
    expect(flat).toContain(stem('python'));
    expect(flat).toContain(stem('javascript'));
  });

  test('AND keyword is stripped', () => {
    const p = parseQuery('react AND redux');
    expect(p.terms).toContain(stem('react'));
    expect(p.terms).toContain(stem('redux'));
    expect(p.orGroups).toBeNull();
  });
});

describe('parseQuery - edge cases', () => {
  test('empty string → empty result', () => {
    const p = parseQuery('');
    expect(p.terms).toEqual([]);
    expect(p.orGroups).toBeNull();
    expect(p.phrases).toEqual([]);
    expect(p.excludes).toEqual([]);
  });

  test('whitespace-only → empty result', () => {
    const p = parseQuery('   ');
    expect(p.terms).toEqual([]);
    expect(p.orGroups).toBeNull();
  });

  test('single-word parens without OR → terms, no orGroups', () => {
    const p = parseQuery('(python)');
    expect(p.orGroups).toBeNull();
    expect(p.terms).toContain(stem('python'));
  });

  test('has: with unknown value → hasImage stays null', () => {
    expect(parseQuery('has:video').filters.hasImage).toBeNull();
  });

  test('uppercase field name is normalised (AFTER: → after:)', () => {
    const p = parseQuery('AFTER:2024');
    expect(p.filters.after).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0));
  });
});

describe('parseQuery - combined operators', () => {
  test('complex query parses all parts correctly', () => {
    const p = parseQuery("topic:javascript 'async await' -callback after:2023 words:>500");
    expect(p.fields).toMatchObject({ topic: 'javascript' });
    expect(p.phrases).toContain('async await');
    expect(p.excludes).toContain(stem('callback'));
    expect(p.filters.after).toEqual(new Date(2023, 0, 1, 0, 0, 0, 0));
    expect(p.filters.wordsMin).toBe(501);
  });
});
