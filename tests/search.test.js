'use strict';

const {
  stem,
  tokenize,
  parseQuery,
  parseFilterDate,
  parseNumericFilter,
  fieldMatch,
  evaluate,
} = require('../assets/js/search.js');

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
  test('skips rule whose result is too short, falls through to next matching rule', () =>
    expect(stem('sings')).toBe('sing'));
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
  test('keeps 2-char non-stop-word token', () => expect(tokenize('ok', false)).toEqual(['ok']));
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
  test('exact 0 sets both to 0', () => expect(run('0')).toEqual({ minW: 0, maxW: 0 }));
  test('no match leaves object empty', () => expect(run('abc')).toEqual({}));
});

describe('fieldMatch', () => {
  const doc = { topic: 'linux', tags: ['javascript', 'css'], author: 'jane doe', type: 'tutorial' };

  test('topic matches exact value', () => expect(fieldMatch('topic', 'linux', doc)).toBe(true));
  test('topic matches by prefix', () => expect(fieldMatch('topic', 'lin', doc)).toBe(true));
  test('topic does not match a non-prefix substring', () => expect(fieldMatch('topic', 'nux', doc)).toBe(false));
  test('topic does not match value longer than topic', () => expect(fieldMatch('topic', 'linuxes', doc)).toBe(false));
  test('site aliases to topic (prefix)', () => expect(fieldMatch('site', 'lin', doc)).toBe(true));

  test('tag matches exact value', () => expect(fieldMatch('tag', 'css', doc)).toBe(true));
  test('tag matches by prefix of any tag', () => expect(fieldMatch('tag', 'java', doc)).toBe(true));
  test('tag does not match a non-prefix substring', () => expect(fieldMatch('tag', 'script', doc)).toBe(false));
  test('tags aliases to tag', () => expect(fieldMatch('tags', 'css', doc)).toBe(true));
  test('tag filter never matches when doc has no tags', () =>
    expect(fieldMatch('tag', 'css', { topic: '', tags: [], author: '', type: '' })).toBe(false));

  test('author matches by substring', () => expect(fieldMatch('author', 'doe', doc)).toBe(true));
  test('author does not match absent substring', () => expect(fieldMatch('author', 'smith', doc)).toBe(false));

  test('type matches by substring', () => expect(fieldMatch('type', 'tut', doc)).toBe(true));
  test('type does not match absent substring', () => expect(fieldMatch('type', 'guide', doc)).toBe(false));

  test('unknown field does not filter (returns true)', () => expect(fieldMatch('color', 'red', doc)).toBe(true));
});

describe('parseQuery - AST structure', () => {
  test('single term → term node', () =>
    expect(parseQuery('linux')).toEqual({ op: 'term', term: stem('linux'), raw: 'linux' }));

  test('adjacent terms → implicit AND', () => {
    const p = parseQuery('linux docker');
    expect(p.op).toBe('and');
    expect(p.nodes.map((n) => n.term)).toEqual([stem('linux'), stem('docker')]);
  });

  test('&& is an explicit AND, equivalent to the word AND', () => {
    expect(parseQuery('linux && docker')).toEqual(parseQuery('linux AND docker'));
    expect(parseQuery('linux && docker').op).toBe('and');
  });

  test('|| is an OR, equivalent to the word OR', () => {
    expect(parseQuery('linux || docker')).toEqual(parseQuery('linux OR docker'));
    expect(parseQuery('linux OR docker').op).toBe('or');
  });

  test('- and NOT both produce a not node', () => {
    expect(parseQuery('-linux')).toEqual({ op: 'not', node: { op: 'term', term: stem('linux'), raw: 'linux' } });
    expect(parseQuery('NOT linux')).toEqual(parseQuery('-linux'));
  });

  test('double/single quotes → phrase node', () => {
    expect(parseQuery('"machine learning"')).toEqual({ op: 'phrase', value: 'machine learning' });
    expect(parseQuery("'machine learning'")).toEqual({ op: 'phrase', value: 'machine learning' });
  });

  test('topic:value → field node (value lowercased)', () =>
    expect(parseQuery('topic:JavaScript')).toEqual({ op: 'field', kind: 'topic', value: 'javascript' }));

  test('site: aliases to a topic field', () =>
    expect(parseQuery('site:linux')).toEqual({ op: 'field', kind: 'topic', value: 'linux' }));

  test('nested grouping: (a || b) && c', () => {
    const p = parseQuery('(python OR ruby) security');
    expect(p.op).toBe('and');
    expect(p.nodes[0].op).toBe('or');
    expect(p.nodes[1]).toEqual({ op: 'term', term: stem('security'), raw: 'security' });
  });

  test('paren does not leak into a field value', () =>
    expect(parseQuery('(topic:alpha OR topic:beta)')).toEqual({
      op: 'or',
      nodes: [
        { op: 'field', kind: 'topic', value: 'alpha' },
        { op: 'field', kind: 'topic', value: 'beta' },
      ],
    }));

  test('hyphenated term → implicit AND of its word tokens', () => {
    const p = parseQuery('machine-learning');
    expect(p.op).toBe('and');
    expect(p.nodes.map((n) => n.term)).toEqual([stem('machine'), stem('learning')]);
  });

  test('unknown field falls back to a text term', () =>
    expect(parseQuery('color:red')).toEqual({ op: 'term', term: stem('red'), raw: 'red' }));

  test('empty and whitespace-only → null', () => {
    expect(parseQuery('')).toBeNull();
    expect(parseQuery('   ')).toBeNull();
  });
});

describe('parseQuery - filter atoms', () => {
  test('after:2024 → after date field', () =>
    expect(parseQuery('after:2024')).toEqual({ op: 'field', kind: 'after', date: new Date(2024, 0, 1, 0, 0, 0, 0) }));
  test('before:2024 → before date field', () =>
    expect(parseQuery('before:2024')).toEqual({
      op: 'field',
      kind: 'before',
      date: new Date(2024, 11, 31, 23, 59, 59, 999),
    }));
  test('is:featured → featured field', () =>
    expect(parseQuery('is:featured')).toEqual({ op: 'field', kind: 'featured' }));
  test('is:post → istype field', () =>
    expect(parseQuery('is:post')).toEqual({ op: 'field', kind: 'istype', value: 'post' }));
  test('has:image → hasimage field', () => expect(parseQuery('has:image')).toEqual({ op: 'field', kind: 'hasimage' }));
  test('words:>500 → num field wordsMin', () =>
    expect(parseQuery('words:>500')).toEqual({ op: 'field', kind: 'num', metric: 'words', min: 501, max: undefined }));
  test('time:<=5 → num field timeMax', () =>
    expect(parseQuery('time:<=5')).toEqual({ op: 'field', kind: 'num', metric: 'time', min: undefined, max: 5 }));
  test('invalid after date falls back to a term', () =>
    expect(parseQuery('after:notadate')).toEqual({ op: 'term', term: stem('notadate'), raw: 'notadate' }));
});

// Doc view mirroring what scoreDoc builds.
function makeDoc(f) {
  f = f || {};
  const text = (f.text || '').toLowerCase();
  const set = {};
  tokenize(text, true).forEach((t) => (set[t] = 1));
  return {
    topic: (f.topic || '').toLowerCase(),
    tags: (f.tags || []).map((x) => x.toLowerCase()),
    author: (f.author || '').toLowerCase(),
    type: (f.type || 'post').toLowerCase(),
    title: (f.title || '').toLowerCase(),
    titleTokens: tokenize(f.title || '', false),
    url: (f.url || '').toLowerCase(),
    text: text,
    date: f.date_iso ? new Date(f.date_iso) : null,
    featured: !!f.featured,
    image: f.image || '',
    wordCount: f.word_count || 0,
    readingTime: f.reading_time || 0,
    tm(t) {
      if (set[t]) return true;
      for (const k in set) if (k.indexOf(t) === 0) return true;
      return text.indexOf(t) !== -1;
    },
  };
}
function match(query, fields) {
  const d = makeDoc(fields);
  return evaluate(parseQuery(query), d, d.tm);
}

describe('evaluate - boolean matching', () => {
  test('AND requires all terms', () => {
    expect(match('linux docker', { text: 'linux docker guide' })).toBe(true);
    expect(match('linux && docker', { text: 'linux guide' })).toBe(false);
  });

  test('OR requires any term', () => {
    expect(match('linux || windows', { text: 'windows tips' })).toBe(true);
    expect(match('linux OR windows', { text: 'macos notes' })).toBe(false);
  });

  test('NOT excludes matches', () => {
    expect(match('linux -docker', { text: 'linux guide' })).toBe(true);
    expect(match('linux -docker', { text: 'linux docker' })).toBe(false);
  });

  test('grouping controls precedence', () => {
    expect(match('(linux || windows) && guide', { text: 'windows guide' })).toBe(true);
    expect(match('(linux || windows) && guide', { text: 'windows tips' })).toBe(false);
  });

  test('nested boolean with field operands: (a && topic:b) || topic:c', () => {
    const q = '(linux && topic:alp) || topic:beta';
    expect(match(q, { topic: 'alpha', text: 'linux setup guide' })).toBe(true); // left branch (term + topic prefix)
    expect(match(q, { topic: 'beta', text: 'unrelated' })).toBe(true); // right branch
    expect(match(q, { topic: 'alpha', text: 'no keyword here' })).toBe(false); // neither
  });

  test('phrase matches contiguous text only', () => {
    expect(match('"machine learning"', { text: 'deep machine learning models' })).toBe(true);
    expect(match('"machine learning"', { text: 'learning a machine' })).toBe(false);
  });

  test('excluded phrase', () => {
    expect(match('-"machine learning"', { text: 'deep learning' })).toBe(true);
    expect(match('-"machine learning"', { text: 'a machine learning course' })).toBe(false);
  });

  test('matching is case-insensitive for terms and fields', () => {
    expect(match('LINUX', { text: 'linux guide' })).toBe(true);
    expect(match('Topic:Alp', { topic: 'alpha' })).toBe(true);
  });

  test('topic/tag filters match by prefix', () => {
    expect(match('topic:alp', { topic: 'alpha' })).toBe(true);
    expect(match('topic:xyz', { topic: 'alpha' })).toBe(false);
    expect(match('tag:java', { tags: ['javascript', 'css'] })).toBe(true);
    expect(match('tag:py', { tags: ['javascript'] })).toBe(false);
  });

  test('author/type filters match by substring', () => {
    expect(match('author:doe', { author: 'Jane Doe' })).toBe(true);
    expect(match('type:tut', { type: 'tutorial' })).toBe(true);
    expect(match('type:guide', { type: 'tutorial' })).toBe(false);
  });

  test('date range filters', () => {
    expect(match('after:2024', { date_iso: '2025-03-01' })).toBe(true);
    expect(match('after:2024', { date_iso: '2023-03-01' })).toBe(false);
    expect(match('after:2024 before:2024', { date_iso: '2024-06-01' })).toBe(true);
    expect(match('after:2024 before:2024', { date_iso: '2025-06-01' })).toBe(false);
  });

  test('is/has filters', () => {
    expect(match('is:featured', { featured: true })).toBe(true);
    expect(match('is:featured', { featured: false })).toBe(false);
    expect(match('is:post', { type: 'post' })).toBe(true);
    expect(match('is:video', { type: 'post' })).toBe(false);
    expect(match('has:image', { image: '/x.png' })).toBe(true);
    expect(match('has:image', { image: '' })).toBe(false);
    expect(match('has:image', { image: '/assets/social-preview.png' })).toBe(false);
  });

  test('numeric filters', () => {
    expect(match('words:>500', { word_count: 600 })).toBe(true);
    expect(match('words:>500', { word_count: 100 })).toBe(false);
    expect(match('words:200-800', { word_count: 500 })).toBe(true);
    expect(match('time:<=5', { reading_time: 3 })).toBe(true);
    expect(match('time:<=5', { reading_time: 9 })).toBe(false);
  });

  test('intitle/inurl filters', () => {
    expect(match('intitle:linux', { title: 'Linux Guide' })).toBe(true);
    expect(match('intitle:run', { title: 'Running Fast' })).toBe(true);
    expect(match('intitle:linux', { title: 'Windows Guide' })).toBe(false);
    expect(match('inurl:blog', { url: '/blog/post' })).toBe(true);
    expect(match('inurl:blog', { url: '/about' })).toBe(false);
  });

  test('null AST matches everything', () => {
    const d = makeDoc({ text: 'anything' });
    expect(evaluate(parseQuery(''), d, d.tm)).toBe(true);
  });
});

describe('evaluate - operator precedence', () => {
  // AND binds tighter than OR: "a OR b c" === "a OR (b AND c)"
  test('a OR b c → a OR (b AND c)', () => {
    expect(match('linux OR windows macos', { text: 'linux only' })).toBe(true);
    expect(match('linux OR windows macos', { text: 'windows macos' })).toBe(true);
    expect(match('linux OR windows macos', { text: 'windows only' })).toBe(false);
  });

  // "a b OR c" === "(a AND b) OR c"
  test('a b OR c → (a AND b) OR c', () => {
    expect(match('linux docker OR windows', { text: 'windows' })).toBe(true);
    expect(match('linux docker OR windows', { text: 'linux docker' })).toBe(true);
    expect(match('linux docker OR windows', { text: 'linux' })).toBe(false);
  });

  test('&& / || / word forms are interchangeable', () => {
    expect(match('linux && docker', { text: 'linux docker' })).toBe(
      match('linux AND docker', { text: 'linux docker' }),
    );
    expect(match('linux || docker', { text: 'docker' })).toBe(match('linux OR docker', { text: 'docker' }));
  });

  test('deep nesting resolves correctly', () => {
    const q = '((linux || windows) && (docker || podman))';
    expect(match(q, { text: 'windows podman' })).toBe(true);
    expect(match(q, { text: 'windows only' })).toBe(false);
    expect(match(q, { text: 'linux docker' })).toBe(true);
  });

  test('redundant parentheses are transparent', () => {
    expect(match('((linux))', { text: 'linux' })).toBe(true);
    expect(match('(((linux)))', { text: 'macos' })).toBe(false);
  });
});

describe('evaluate - negation edge cases', () => {
  test('pure negation matches docs lacking the term', () => {
    expect(match('-docker', { text: 'linux guide' })).toBe(true);
    expect(match('-docker', { text: 'docker guide' })).toBe(false);
  });

  test('double negation cancels', () => {
    expect(match('--linux', { text: 'linux' })).toBe(true);
    expect(match('--linux', { text: 'macos' })).toBe(false);
    expect(match('NOT NOT linux', { text: 'linux' })).toBe(true);
  });

  test('De Morgan: -(a || b) === -a AND -b', () => {
    expect(match('-(linux || windows)', { text: 'linux' })).toBe(false);
    expect(match('-(linux || windows)', { text: 'macos notes' })).toBe(true);
  });

  test('negated field filter', () => {
    expect(match('-topic:alp', { topic: 'alpha' })).toBe(false);
    expect(match('-topic:alp', { topic: 'beta' })).toBe(true);
  });

  test('negated boolean filter', () => {
    expect(match('-is:featured', { featured: true })).toBe(false);
    expect(match('-is:featured', { featured: false })).toBe(true);
  });
});

describe('evaluate - combined operators', () => {
  test('term + phrase + field + exclusion', () => {
    const q = 'linux "best practices" topic:alpha -windows';
    expect(match(q, { text: 'linux best practices tips', topic: 'alpha' })).toBe(true);
    expect(match(q, { text: 'linux best practices windows', topic: 'alpha' })).toBe(false);
    expect(match(q, { text: 'linux tips', topic: 'alpha' })).toBe(false);
    expect(match(q, { text: 'linux best practices', topic: 'beta' })).toBe(false);
  });

  test('multiple phrases are ANDed', () => {
    expect(match('"deep learning" "neural nets"', { text: 'deep learning and neural nets' })).toBe(true);
    expect(match('"deep learning" "neural nets"', { text: 'deep learning only' })).toBe(false);
  });

  test('field-only query (no free-text terms)', () => {
    expect(match('topic:alpha is:featured', { topic: 'alpha', featured: true })).toBe(true);
    expect(match('topic:alpha is:featured', { topic: 'alpha', featured: false })).toBe(false);
  });
});

describe('evaluate - stemming and case', () => {
  test('plural query matches singular doc via stemming', () => {
    expect(match('containers', { text: 'container runtime' })).toBe(true);
  });

  test('uppercase operators and mixed-case terms', () => {
    expect(match('LINUX AND DOCKER', { text: 'linux docker' })).toBe(true);
    expect(match('Linux Or Windows', { text: 'windows' })).toBe(true);
  });

  test('a word merely containing OR/AND is not an operator', () => {
    // "ANDROID" must be a term, not the AND operator
    expect(match('android', { text: 'android phone' })).toBe(true);
    expect(parseQuery('ANDROID phone').op).toBe('and');
    expect(parseQuery('ANDROID phone').nodes.map((n) => n.term)).toEqual([stem('android'), stem('phone')]);
  });
});

describe('parseQuery - malformed input never throws', () => {
  const weird = [
    '(((',
    'a)b',
    ')(',
    '()',
    '( )',
    'AND',
    'OR',
    'NOT',
    '-',
    '&&',
    '||',
    'linux AND',
    'AND linux',
    'a OR OR b',
    'linux && && docker',
    '- linux',
    '"unclosed phrase',
    '""',
    "''",
    '"   "',
    '(linux OR)',
    '(OR linux)',
    'topic:',
  ];
  test.each(weird)('parses %j without throwing', (q) => {
    expect(() => parseQuery(q)).not.toThrow();
  });

  test('empty group does not drop following terms: "linux () docker"', () => {
    expect(match('linux () docker', { text: 'linux docker guide' })).toBe(true);
    expect(match('linux () docker', { text: 'linux only' })).toBe(false);
  });

  test('stray operators are ignored', () => {
    expect(match('a OR OR b', { text: 'b here' })).toBe(true);
    expect(match('linux && && docker', { text: 'linux docker' })).toBe(true);
  });

  test('unbalanced parens are lenient', () => {
    expect(match('(linux && docker', { text: 'linux docker' })).toBe(true);
    expect(match('linux && docker)', { text: 'linux docker' })).toBe(true);
  });

  test('all-stopword or sub-token query yields a null AST (matches all)', () => {
    expect(parseQuery('the is a')).toBeNull();
    expect(parseQuery('x')).toBeNull();
  });
});
