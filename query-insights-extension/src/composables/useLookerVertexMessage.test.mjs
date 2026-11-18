import test from 'node:test';
import assert from 'node:assert/strict';
import { useLookerVertexMessage } from './useLookerVertexMessage.js';

const captureSQL = async (temperature) => {
  let captured = '';
  const sdk = {
    ok: async (p) => p,
    create_sql_query: async ({ sql }) => {
      captured = sql;
      return { slug: 's' };
    },
    run_sql_query: async () => [{ generated_content: 'ok' }],
  };
  const { sendMessage } = useLookerVertexMessage(sdk);
  await sendMessage({}, ['a:1'], 'summarize', temperature, '');
  return captured;
};

const stripSingleQuotedLiterals = (sql) => sql.replace(/'(?:[^'\\]|\\.)*'/gs, '<STR>');

test('coerces and validates temperature against SQL injection and edge cases', async () => {
  const payload =
    '0.2 AS temperature,1024 AS max_output_tokens,0.98 AS top_p,' +
    'TRUE AS flatten_json_output,1 AS top_k)) UNION ALL SELECT 1337 FROM secret --';

  const attackedSql = stripSingleQuotedLiterals(await captureSQL(payload));
  assert.equal(attackedSql.includes('UNION ALL'), false);
  assert.equal(attackedSql.includes('1337'), false);
  assert.match(attackedSql, /\b0\.2 AS temperature,/);

  assert.match(stripSingleQuotedLiterals(await captureSQL(0)), /\b0 AS temperature,/);
  assert.match(stripSingleQuotedLiterals(await captureSQL('0.7')), /\b0\.7 AS temperature,/);

  for (const invalid of ['', '   ', null, undefined, NaN, Infinity, -Infinity, true, false, [], {}]) {
    assert.match(
      stripSingleQuotedLiterals(await captureSQL(invalid)),
      /\b0\.2 AS temperature,/,
      `expected fallback 0.2 for ${String(invalid)}`
    );
  }
});
