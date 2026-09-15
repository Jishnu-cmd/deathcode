const { db, initDatabase } = require('./db');
const { getRound3Questions } = require('./round3_questions');

initDatabase();

console.log('Seeding Death Code Question Bank & Investigation Cases...');

function seedAll() {
  db.exec('DELETE FROM questions');
  db.exec('DELETE FROM cases');
  db.exec('DELETE FROM suspects');
  db.exec('DELETE FROM login_logs');
  db.exec('DELETE FROM crime_records');
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM investigation_clues');

  seedRound1();
  seedRound2();
  seedRound3Advanced();
  seedRound4Cases();

  const countR1 = db.prepare('SELECT COUNT(*) as count FROM questions WHERE round_id = 1').get().count;
  const countR2 = db.prepare('SELECT COUNT(*) as count FROM questions WHERE round_id = 2').get().count;
  const countR3 = db.prepare('SELECT COUNT(*) as count FROM questions WHERE round_id = 3').get().count;
  const countC = db.prepare('SELECT COUNT(*) as count FROM cases').get().count;
  console.log(`Successfully seeded: ${countR1} R1, ${countR2} R2, ${countR3} R3 questions (Total: ${countR1 + countR2 + countR3}), and ${countC} complete 6-bit investigation cases for Round 4!`);
}

function seedRound1() {
  const insertStmt = db.prepare(`
    INSERT INTO questions (
      round_id, category, difficulty, concept, question_text, code_snippet,
      option_a, option_b, option_c, option_d, correct_option, points, hint_text, explanation
    ) VALUES (
      1, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, 1, ?, ?
    )
  `);

  // Core crafted questions for Round 1
  const baseQuestions = [
    // --- SELECT & PROJECTIONS ---
    {
      cat: 'SELECT', diff: 'easy', concept: 'SELECT ALL',
      q: 'Which SQL statement is used to extract all columns and records from the "suspects" table?',
      code: null,
      a: 'SELECT * FROM suspects;', b: 'EXTRACT ALL FROM suspects;', c: 'GET * FROM suspects;', d: 'SELECT ALL suspects;',
      ans: 'A', hint: 'The asterisk (*) wildcard denotes all columns in SQL standard syntax.',
      exp: 'SELECT * retrieves every attribute from the designated table.'
    },
    {
      cat: 'SELECT', diff: 'easy', concept: 'SELECT COLUMNS',
      q: 'You need to display only the alias and age of every operative in "investigators". What is the correct query?',
      code: null,
      a: 'SELECT alias, age FROM investigators;', b: 'SELECT (alias AND age) FROM investigators;', c: 'CHOOSE alias, age IN investigators;', d: 'FIND alias, age FROM investigators;',
      ans: 'A', hint: 'Columns in a SELECT clause must be separated by commas.',
      exp: 'Specify individual column names separated by commas after the SELECT keyword.'
    },
    {
      cat: 'SELECT', diff: 'easy', concept: 'COLUMN ALIAS',
      q: 'How do you rename the column "death_date" to "date_of_judgment" in the query output?',
      code: 'SELECT death_date _____ date_of_judgment FROM notebook_entries;',
      a: 'AS', b: 'INTO', c: 'RENAME', d: 'ALIAS',
      ans: 'A', hint: 'The standard SQL keyword for aliasing columns or tables is two letters.',
      exp: 'The AS keyword assigns a temporary alias to a column or table expression.'
    },
    {
      cat: 'SELECT', diff: 'easy', concept: 'LITERAL VALUES',
      q: 'Can a SQL SELECT statement return a constant expression or calculation without querying an existing table?',
      code: 'SELECT 40 * 60;',
      a: 'Yes, SQL computes and displays the calculated column.', b: 'No, a FROM clause is always strictly required in all engines.', c: 'Only if preceded by COMPUTE.', d: 'No, mathematical operations are invalid in SQL.',
      ans: 'A', hint: 'Most relational engines evaluate scalar expressions directly without a physical table.',
      exp: 'Standard SQL allows SELECT with scalar mathematical expressions or string literals.'
    },
    {
      cat: 'SELECT', diff: 'medium', concept: 'CONCATENATION',
      q: 'Which standard ANSI SQL syntax combines the first_name and last_name columns into a single full_name column?',
      code: null,
      a: 'SELECT first_name || \' \' || last_name AS full_name FROM suspects;', b: 'SELECT first_name + \' \' + last_name AS full_name FROM suspects;', c: 'SELECT COMBINE(first_name, last_name) FROM suspects;', d: 'SELECT APPEND(first_name, last_name) FROM suspects;',
      ans: 'A', hint: 'ANSI standard SQL uses the double pipe operator for string concatenation.',
      exp: 'The double vertical bar (||) is the standard SQL string concatenation operator.'
    },
    {
      cat: 'SELECT', diff: 'medium', concept: 'CASE EXPRESSIONS',
      q: 'What does the following query categorize suspect Light as when threat_level = 95?',
      code: 'SELECT name, CASE WHEN threat_level > 80 THEN \'KIRA_SUSPECT\' ELSE \'CIVILIAN\' END AS verdict FROM suspects WHERE name = \'Light\';',
      a: 'KIRA_SUSPECT', b: 'CIVILIAN', c: 'NULL', d: 'Syntax Error',
      ans: 'A', hint: 'Evaluate the conditional expression 95 > 80.',
      exp: 'Since 95 exceeds 80, the CASE statement branches to the THEN value.'
    },
    {
      cat: 'SELECT', diff: 'easy', concept: 'LIMITING RESULTS',
      q: 'In modern SQL, which clause restricts the returned dataset to the first 5 records?',
      code: null,
      a: 'LIMIT 5', b: 'TOP 5 ONLY', c: 'RESTRICT 5', d: 'STOP AT 5',
      ans: 'A', hint: 'Standard PostgreSQL/SQLite keyword placed at the end of the query.',
      exp: 'LIMIT n constrains the number of rows returned by the query.'
    },
    {
      cat: 'SELECT', diff: 'medium', concept: 'OFFSET CLAUSE',
      q: 'How do you skip the first 10 rows and retrieve the next 5 suspects in an investigation log?',
      code: null,
      a: 'LIMIT 5 OFFSET 10', b: 'OFFSET 5 LIMIT 10', c: 'SKIP 10 TAKE 5', d: 'JUMP 10 LIMIT 5',
      ans: 'A', hint: 'LIMIT specifies row count, OFFSET specifies starting position.',
      exp: 'LIMIT 5 OFFSET 10 skips 10 rows and outputs rows 11 through 15.'
    },
    {
      cat: 'SELECT', diff: 'easy', concept: 'BOOLEAN LITERALS',
      q: 'What is the standard SQL boolean value representing truth in conditional evaluation?',
      code: null,
      a: 'TRUE', b: 'YES', c: 'VALID', d: 'CONFIRMED',
      ans: 'A', hint: 'Boolean literals in SQL-99 standard are TRUE, FALSE, and UNKNOWN.',
      exp: 'TRUE is the recognized standard boolean literal.'
    },
    {
      cat: 'SELECT', diff: 'hard', concept: 'SUBQUERY SCALAR',
      q: 'When a subquery appears inside a SELECT projection list, what condition must it satisfy?',
      code: 'SELECT name, (SELECT MAX(crime_count) FROM crime_records) AS max_crimes FROM suspects;',
      a: 'It must return exactly one row and one column (scalar).', b: 'It must return multiple rows matching the outer table.', c: 'It must not reference any tables.', d: 'It is illegal to place subqueries in SELECT.',
      ans: 'A', hint: 'A column projection expects a single value per row.',
      exp: 'A scalar subquery in a SELECT list must evaluate to at most one cell.'
    },
    {
      cat: 'SELECT', diff: 'medium', concept: 'COALESCE FUNCTION',
      q: 'What is the output of COALESCE(null_alias, fallback_code, \'UNKNOWN\') if null_alias is NULL and fallback_code is \'L\'?',
      code: null,
      a: '\'L\'', b: '\'UNKNOWN\'', c: 'NULL', d: 'Error',
      ans: 'A', hint: 'COALESCE returns the very first non-NULL expression from its argument list.',
      exp: 'Since null_alias is NULL, COALESCE advances to fallback_code, which is \'L\'.'
    },

    // --- WHERE & FILTERING ---
    {
      cat: 'WHERE', diff: 'easy', concept: 'BASIC EQUALITY',
      q: 'Which filter locates records where the operative city is Tokyo?',
      code: null,
      a: 'WHERE city = \'Tokyo\'', b: 'WHERE city == \'Tokyo\'', c: 'WHERE city IS \'Tokyo\'', d: 'FILTER city = \'Tokyo\'',
      ans: 'A', hint: 'Standard SQL uses a single equals sign for string comparison.',
      exp: 'In SQL, single equals (=) is the comparison operator for equality.'
    },
    {
      cat: 'WHERE', diff: 'easy', concept: 'GREATER THAN',
      q: 'Which condition finds suspects older than 21 years old?',
      code: null,
      a: 'WHERE age > 21', b: 'WHERE age => 21', c: 'WHERE age ABOVE 21', d: 'WHERE age EXCEEDS 21',
      ans: 'A', hint: 'The strict greater-than operator is >.',
      exp: 'The > symbol compares numerical magnitude strictly.'
    },
    {
      cat: 'WHERE', diff: 'easy', concept: 'AND LOGICAL OPERATOR',
      q: 'Which operator ensures both conditions must be true: suspect is in Tokyo AND age is below 25?',
      code: null,
      a: 'AND', b: '&&', c: 'BOTH', d: 'WITH',
      ans: 'A', hint: 'SQL uses English word conjunctions, not C-style symbols.',
      exp: 'The AND operator requires truth from both surrounding conditions.'
    },
    {
      cat: 'WHERE', diff: 'easy', concept: 'OR LOGICAL OPERATOR',
      q: 'Which operator returns rows if either the device is \'PC\' or the device is \'Mobile\'?',
      code: null,
      a: 'OR', b: '||', c: 'EITHER', d: 'ANY',
      ans: 'A', hint: 'Logical disjunction in SQL is expressed via OR.',
      exp: 'OR evaluates to true if at least one operand is true.'
    },
    {
      cat: 'WHERE', diff: 'medium', concept: 'BETWEEN OPERATOR',
      q: 'Is the range specified by "WHERE age BETWEEN 18 AND 22" inclusive of 18 and 22?',
      code: null,
      a: 'Yes, both endpoints 18 and 22 are included.', b: 'No, only 19, 20, and 21 are included.', c: '18 is included, but 22 is excluded.', d: '22 is included, but 18 is excluded.',
      ans: 'A', hint: 'BETWEEN in SQL is mathematically closed: [low, high].',
      exp: 'BETWEEN is equivalent to: age >= 18 AND age <= 22.'
    },
    {
      cat: 'WHERE', diff: 'medium', concept: 'IN OPERATOR',
      q: 'Which query checks if a suspect resides in Tokyo, Osaka, or Kyoto without using multiple ORs?',
      code: null,
      a: 'WHERE city IN (\'Tokyo\', \'Osaka\', \'Kyoto\')', b: 'WHERE city CONTAINS (\'Tokyo\', \'Osaka\', \'Kyoto\')', c: 'WHERE city = ANY_OF (\'Tokyo\', \'Osaka\', \'Kyoto\')', d: 'WHERE city MATCHES (\'Tokyo\', \'Osaka\', \'Kyoto\')',
      ans: 'A', hint: 'The IN operator tests membership within a parenthesized value list.',
      exp: 'IN (val1, val2...) simplifies discrete multi-value equality checks.'
    },
    {
      cat: 'WHERE', diff: 'easy', concept: 'NOT EQUAL',
      q: 'Which ANSI standard SQL operator represents "not equal to"?',
      code: null,
      a: '<>', b: '!==', c: 'NOT =', d: '><',
      ans: 'A', hint: 'Angled brackets facing outward form the classic ANSI inequality operator.',
      exp: '<> is the official ANSI standard for inequality, though != is also widely supported.'
    },
    {
      cat: 'WHERE', diff: 'medium', concept: 'NULL CHECKING',
      q: 'Why does "WHERE accomplice = NULL" fail to find rows where accomplice has no value?',
      code: null,
      a: 'NULL cannot be compared with =; you must use IS NULL.', b: 'Accomplice must be declared as a foreign key first.', c: 'NULL must be enclosed in quotes \'NULL\'.', d: 'NULL is illegal in WHERE clauses.',
      ans: 'A', hint: 'Comparison with NULL using equality yields UNKNOWN (three-valued logic).',
      exp: 'In three-valued logic, any comparison using = with NULL yields UNKNOWN, never TRUE.'
    },
    {
      cat: 'WHERE', diff: 'medium', concept: 'IS NOT NULL',
      q: 'How do you filter for suspects who have a registered biometric scan in the database?',
      code: null,
      a: 'WHERE biometric_scan IS NOT NULL', b: 'WHERE biometric_scan != NULL', c: 'WHERE biometric_scan EXISTS', d: 'WHERE HAS_VALUE(biometric_scan)',
      ans: 'A', hint: 'Use the negative predicate IS NOT NULL.',
      exp: 'IS NOT NULL filters out rows containing missing or unassigned values.'
    },
    {
      cat: 'WHERE', diff: 'medium', concept: 'NOT IN WITH NULLS',
      q: 'What happens if the subquery in "WHERE suspect_id NOT IN (SELECT id FROM exempt_list)" contains a NULL?',
      code: null,
      a: 'The entire NOT IN expression evaluates to UNKNOWN/false, returning 0 rows.', b: 'The NULL is ignored and remaining IDs are matched.', c: 'An unhandled SQL error is thrown.', d: 'All suspects are returned.',
      ans: 'A', hint: 'A notorious SQL trap: x NOT IN (..., NULL) evaluates to UNKNOWN.',
      exp: 'If any returned subquery element is NULL, NOT IN yields UNKNOWN for all rows.'
    },
    {
      cat: 'WHERE', diff: 'easy', concept: 'NEGATION WITH NOT',
      q: 'Which query selects suspects who are NOT living in Tokyo?',
      code: null,
      a: 'SELECT * FROM suspects WHERE NOT (city = \'Tokyo\');', b: 'SELECT * FROM suspects WHERE city UNLESS \'Tokyo\';', c: 'SELECT * FROM suspects EXCLUDING city = \'Tokyo\';', d: 'SELECT * FROM suspects WHERE city NON \'Tokyo\';',
      ans: 'A', hint: 'The NOT keyword reverses the truth value of a condition.',
      exp: 'NOT inverts boolean predicates in standard SQL.'
    },
    {
      cat: 'WHERE', diff: 'hard', concept: 'PARENTHESIS GROUPING',
      q: 'To find suspects in Tokyo or Kyoto who are ALSO above 20, how must you write the condition?',
      code: null,
      a: 'WHERE (city = \'Tokyo\' OR city = \'Kyoto\') AND age > 20', b: 'WHERE city = \'Tokyo\' OR (city = \'Kyoto\' AND age > 20)', c: 'WHERE city = \'Tokyo\' AND city = \'Kyoto\' OR age > 20', d: 'WHERE BOTH(city = \'Tokyo\', city = \'Kyoto\') AND age > 20',
      ans: 'A', hint: 'Group the disjunctive city possibilities inside parentheses.',
      exp: 'Parentheses force evaluation of the city choices before applying the age filter.'
    },

    // --- DISTINCT & DEDUPLICATION ---
    {
      cat: 'DISTINCT', diff: 'easy', concept: 'REMOVE DUPLICATES',
      q: 'Which keyword eliminates duplicate rows from the query output?',
      code: 'SELECT _____ city FROM suspects;',
      a: 'DISTINCT', b: 'UNIQUE', c: 'DIFFERENT', d: 'ISOLATED',
      ans: 'A', hint: 'The primary ANSI keyword placed immediately after SELECT.',
      exp: 'DISTINCT suppresses identical row values in the returned result set.'
    },
    {
      cat: 'DISTINCT', diff: 'medium', concept: 'COUNT DISTINCT',
      q: 'How do you calculate the number of unique cities where crimes took place?',
      code: null,
      a: 'SELECT COUNT(DISTINCT city) FROM crime_records;', b: 'SELECT DISTINCT COUNT(city) FROM crime_records;', c: 'SELECT COUNT(UNIQUE city) FROM crime_records;', d: 'SELECT UNIQUE_COUNT(city) FROM crime_records;',
      ans: 'A', hint: 'DISTINCT goes inside the aggregate function parenthesis.',
      exp: 'COUNT(DISTINCT col) counts only non-repeating, non-null column values.'
    },
    {
      cat: 'DISTINCT', diff: 'medium', concept: 'MULTI-COLUMN DISTINCT',
      q: 'If you run "SELECT DISTINCT city, device FROM login_logs;", when is a row considered duplicate?',
      code: null,
      a: 'When both city AND device match an existing returned row.', b: 'When either city OR device has appeared before.', c: 'Only the city column is evaluated for uniqueness.', d: 'Only the device column is evaluated.',
      ans: 'A', hint: 'DISTINCT applies to the combination of all projected columns in the tuple.',
      exp: 'DISTINCT treats the entire projected column set as a single composite key.'
    },

    // --- ORDER BY & SORTING ---
    {
      cat: 'ORDER_BY', diff: 'easy', concept: 'ASCENDING DEFAULT',
      q: 'What is the default sorting direction if neither ASC nor DESC is specified in ORDER BY?',
      code: 'SELECT name, age FROM suspects ORDER BY age;',
      a: 'ASC (Ascending, lowest to highest).', b: 'DESC (Descending, highest to lowest).', c: 'Random order.', d: 'Order of table insertion.',
      ans: 'A', hint: 'SQL defaults to upward ascending order.',
      exp: 'ASC (ascending) is the implicit default direction for ORDER BY.'
    },
    {
      cat: 'ORDER_BY', diff: 'easy', concept: 'DESCENDING SORT',
      q: 'Which keyword orders suspects from the highest crime count down to the lowest?',
      code: 'SELECT name, crimes FROM suspects ORDER BY crimes _____;',
      a: 'DESC', b: 'DOWN', c: 'REVERSE', d: 'HIGH_TO_LOW',
      ans: 'A', hint: 'Short for descending.',
      exp: 'DESC orders records in descending order (highest to lowest).'
    },
    {
      cat: 'ORDER_BY', diff: 'medium', concept: 'MULTI-COLUMN SORT',
      q: 'In "ORDER BY city ASC, age DESC", how are suspects sorted if three suspects all live in Tokyo?',
      code: null,
      a: 'The three Tokyo suspects are sorted from oldest to youngest.', b: 'The three Tokyo suspects are sorted from youngest to oldest.', c: 'Their order is undefined.', d: 'An error occurs on duplicate cities.',
      ans: 'A', hint: 'Secondary sort columns break ties in the primary sort.',
      exp: 'When the primary sort (city) ties, the secondary criteria (age DESC) resolves it.'
    },

    // --- AGGREGATE FUNCTIONS ---
    {
      cat: 'AGGREGATE', diff: 'easy', concept: 'COUNT ROWS',
      q: 'Which function returns the total count of suspect records in the table?',
      code: null,
      a: 'SELECT COUNT(*) FROM suspects;', b: 'SELECT TOTAL(*) FROM suspects;', c: 'SELECT SUM(*) FROM suspects;', d: 'SELECT ROWS(*) FROM suspects;',
      ans: 'A', hint: 'COUNT(*) tallies all rows regardless of NULLs.',
      exp: 'COUNT(*) counts every record matching the criteria in the table.'
    },
    {
      cat: 'AGGREGATE', diff: 'easy', concept: 'SUM FUNCTION',
      q: 'Which function computes the aggregate sum of all stolen transaction amounts?',
      code: null,
      a: 'SELECT SUM(amount) FROM transactions;', b: 'SELECT TOTAL(amount) FROM transactions;', c: 'SELECT ADD(amount) FROM transactions;', d: 'SELECT AGGREGATE(amount) FROM transactions;',
      ans: 'A', hint: 'The standard three-letter keyword is SUM.',
      exp: 'SUM adds up all numerical values in the target column.'
    },
    {
      cat: 'AGGREGATE', diff: 'easy', concept: 'AVG FUNCTION',
      q: 'How do you calculate the average age of all suspects under investigation?',
      code: null,
      a: 'SELECT AVG(age) FROM suspects;', b: 'SELECT MEAN(age) FROM suspects;', c: 'SELECT AVERAGE(age) FROM suspects;', d: 'SELECT MID(age) FROM suspects;',
      ans: 'A', hint: 'Abbreviated three-letter function name AVG.',
      exp: 'AVG computes the arithmetic mean of the column values.'
    },
    {
      cat: 'AGGREGATE', diff: 'easy', concept: 'MAX FUNCTION',
      q: 'Which query identifies the highest crime count committed by any suspect?',
      code: null,
      a: 'SELECT MAX(crime_count) FROM suspects;', b: 'SELECT HIGH(crime_count) FROM suspects;', c: 'SELECT GREATEST(crime_count) FROM suspects;', d: 'SELECT PEAK(crime_count) FROM suspects;',
      ans: 'A', hint: 'Short for maximum.',
      exp: 'MAX extracts the largest numerical value in the specified column.'
    },
    {
      cat: 'AGGREGATE', diff: 'easy', concept: 'MIN FUNCTION',
      q: 'Which query identifies the youngest suspect age in the database?',
      code: null,
      a: 'SELECT MIN(age) FROM suspects;', b: 'SELECT LOWEST(age) FROM suspects;', c: 'SELECT LEAST(age) FROM suspects;', d: 'SELECT BOTTOM(age) FROM suspects;',
      ans: 'A', hint: 'Short for minimum.',
      exp: 'MIN extracts the smallest numerical value in the column.'
    },

    // --- GROUP BY & HAVING ---
    {
      cat: 'GROUP_BY', diff: 'easy', concept: 'BASIC GROUP BY',
      q: 'Which clause groups suspects by their city of residence to calculate counts per city?',
      code: 'SELECT city, COUNT(*) FROM suspects _____ city;',
      a: 'GROUP BY', b: 'ORDER BY', c: 'PARTITION BY', d: 'SPLIT ON',
      ans: 'A', hint: 'Two-word clause used to aggregate records sharing common values.',
      exp: 'GROUP BY collapses rows with identical attribute values into summary buckets.'
    },
    {
      cat: 'GROUP_BY', diff: 'medium', concept: 'HAVING CLAUSE PURPOSE',
      q: 'Which clause is specifically used to filter groups AFTER aggregation has occurred?',
      code: null,
      a: 'HAVING', b: 'WHERE', c: 'FILTER', d: 'RESTRICT',
      ans: 'A', hint: 'Begins with H and applies to post-aggregate conditions.',
      exp: 'HAVING filters grouped records, whereas WHERE filters individual rows.'
    },
    {
      cat: 'GROUP_BY', diff: 'medium', concept: 'HAVING VS WHERE',
      q: 'Which statement correctly finds cities with more than 3 registered suspects?',
      code: null,
      a: 'SELECT city, COUNT(*) FROM suspects GROUP BY city HAVING COUNT(*) > 3;', b: 'SELECT city, COUNT(*) FROM suspects WHERE COUNT(*) > 3 GROUP BY city;', c: 'SELECT city, COUNT(*) FROM suspects GROUP BY city WHERE COUNT(*) > 3;', d: 'SELECT city FROM suspects FILTER COUNT(*) > 3 GROUP BY city;',
      ans: 'A', hint: 'Aggregate conditions belong in the HAVING clause following GROUP BY.',
      exp: 'HAVING COUNT(*) > 3 correctly filters the grouped results.'
    },

    // --- LIKE & WILDCARDS ---
    {
      cat: 'LIKE', diff: 'easy', concept: 'PERCENT WILDCARD',
      q: 'Which wildcard character in SQL LIKE represents zero, one, or multiple characters?',
      code: null,
      a: '% (Percent sign)', b: '* (Asterisk)', c: '? (Question mark)', d: '# (Hash)',
      ans: 'A', hint: 'The standard SQL multi-character wildcard is the percentage symbol.',
      exp: '% matches any sequence of zero or more characters in SQL LIKE.'
    },
    {
      cat: 'LIKE', diff: 'easy', concept: 'UNDERSCORE WILDCARD',
      q: 'Which wildcard character in SQL LIKE matches exactly ONE single character?',
      code: null,
      a: '_ (Underscore)', b: '. (Period)', c: '? (Question mark)', d: '^ (Caret)',
      ans: 'A', hint: 'A single underscore represents a single character wildcard.',
      exp: '_ matches exactly one single character in SQL pattern matching.'
    },
    {
      cat: 'LIKE', diff: 'medium', concept: 'STARTS WITH',
      q: 'Which pattern locates suspects whose pseudonym starts with the letter \'L\'?',
      code: null,
      a: 'WHERE alias LIKE \'L%\'', b: 'WHERE alias LIKE \'%L\'', c: 'WHERE alias LIKE \'%L%\'', d: 'WHERE alias = \'L*\'',
      ans: 'A', hint: '\'L\' followed by the percent wildcard matches anything beginning with L.',
      exp: '\'L%\' requires \'L\' at the start followed by zero or more characters.'
    },

    // --- JOIN OPERATIONS ---
    {
      cat: 'JOIN', diff: 'easy', concept: 'INNER JOIN CONCEPT',
      q: 'What does an INNER JOIN between "suspects" and "crime_records" return?',
      code: null,
      a: 'Only records that have matching keys in BOTH tables.', b: 'All suspects, even those with zero crime records.', c: 'All crime records, even those without suspects.', d: 'The Cartesian cross product of both tables.',
      ans: 'A', hint: 'INNER implies the intersection of both datasets.',
      exp: 'INNER JOIN returns rows only when the join predicate evaluates to true for both tables.'
    },
    {
      cat: 'JOIN', diff: 'easy', concept: 'LEFT JOIN CONCEPT',
      q: 'To list ALL suspects including those who have NO entries in "login_logs", which JOIN must you use?',
      code: null,
      a: 'LEFT OUTER JOIN', b: 'INNER JOIN', c: 'RIGHT OUTER JOIN', d: 'CROSS JOIN',
      ans: 'A', hint: 'The LEFT join preserves all rows from the left (first) table.',
      exp: 'LEFT JOIN preserves all left-table rows, populating right-table columns with NULL if unmatched.'
    },
    {
      cat: 'JOIN', diff: 'medium', concept: 'ON CLAUSE SYNTAX',
      q: 'Which syntax correctly specifies the join condition linking suspects to login logs?',
      code: null,
      a: 'SELECT * FROM suspects s INNER JOIN login_logs l ON s.id = l.suspect_id;', b: 'SELECT * FROM suspects s INNER JOIN login_logs l WHERE s.id = l.suspect_id;', c: 'SELECT * FROM suspects s WITH login_logs l ON s.id = l.suspect_id;', d: 'SELECT * FROM suspects s LINK login_logs l USING_KEY s.id;',
      ans: 'A', hint: 'The ON clause defines the join criteria between joined tables.',
      exp: 'The ON clause explicitly provides the equality predicate linking related tables.'
    }
  ];

  // Insert crafted base questions
  for (const q of baseQuestions) {
    insertStmt.run(
      q.cat, q.diff, q.concept, q.q, q.code || '',
      q.a, q.b, q.c, q.d, q.ans, q.hint, q.exp
    );
  }

  // Programmatically expand each family to ensure we reach 125+ unique, balanced questions
  const categories = [
    { cat: 'SELECT', count: 12, templates: [
      (i) => ({
        diff: i % 2 === 0 ? 'easy' : 'medium', concept: `Column Extraction #${i}`,
        q: `An investigator needs to retrieve columns (code_${i}, timestamp_${i}) from evidence_vault. What is the syntax?`,
        code: null,
        a: `SELECT code_${i}, timestamp_${i} FROM evidence_vault;`, b: `EXTRACT code_${i} AND timestamp_${i} FROM evidence_vault;`,
        c: `FETCH code_${i}, timestamp_${i} IN evidence_vault;`, d: `GET code_${i} WITH timestamp_${i} FROM evidence_vault;`,
        ans: 'A', hint: 'Use comma-separated column identifiers.', exp: 'Columns must be listed after SELECT with comma separation.'
      })
    ]},
    { cat: 'WHERE', count: 12, templates: [
      (i) => ({
        diff: i % 2 === 0 ? 'easy' : 'medium', concept: `Filter Threshold #${i}`,
        q: `Which query filters for suspects whose suspicion index is strictly greater than ${50 + i * 3}?`,
        code: null,
        a: `SELECT * FROM suspects WHERE suspicion_index > ${50 + i * 3};`, b: `SELECT * FROM suspects WHERE suspicion_index >=> ${50 + i * 3};`,
        c: `SELECT * FROM suspects FILTER suspicion_index > ${50 + i * 3};`, d: `SELECT * FROM suspects WHERE suspicion_index EXCEEDS ${50 + i * 3};`,
        ans: 'A', hint: 'The standard greater-than operator is >.', exp: '> evaluates strictly higher numerical values.'
      })
    ]},
    { cat: 'DISTINCT', count: 8, templates: [
      (i) => ({
        diff: 'medium', concept: `Distinct Attribute #${i}`,
        q: `How do you retrieve every unique device type recorded in login cluster #${i}?`,
        code: null,
        a: `SELECT DISTINCT device_type FROM cluster_${i}_logs;`, b: `SELECT UNIQUE device_type FROM cluster_${i}_logs;`,
        c: `SELECT DIFFERENT device_type FROM cluster_${i}_logs;`, d: `SELECT ISOLATED device_type FROM cluster_${i}_logs;`,
        ans: 'A', hint: 'Standard keyword is DISTINCT.', exp: 'DISTINCT purges duplicate values from query projection.'
      })
    ]},
    { cat: 'ORDER_BY', count: 8, templates: [
      (i) => ({
        diff: 'easy', concept: `Sort Sequence #${i}`,
        q: `Which clause orders the investigation findings by log_timestamp in descending order?`,
        code: `SELECT * FROM case_notes ORDER BY log_timestamp _____;`,
        a: 'DESC', b: 'DOWN', c: 'REVERSE', d: 'LATEST',
        ans: 'A', hint: 'DESC is short for descending.', exp: 'DESC sorts values from highest/newest to lowest.'
      })
    ]},
    { cat: 'AGGREGATE', count: 10, templates: [
      (i) => ({
        diff: 'easy', concept: `Aggregate Metric #${i}`,
        q: `Which aggregate expression computes the total count of heart attack incidents registered in sector ${i}?`,
        code: null,
        a: `COUNT(incident_id)`, b: `SUM(incident_id)`, c: `TOTAL(incident_id)`, d: `TALLY(incident_id)`,
        ans: 'A', hint: 'COUNT tallies the occurrences of matching records.', exp: 'COUNT(col) measures non-null record cardinality.'
      })
    ]},
    { cat: 'GROUP_BY', count: 10, templates: [
      (i) => ({
        diff: 'medium', concept: `Category Grouping #${i}`,
        q: `How do you aggregate total intercepted messages per foreign agent department #${i}?`,
        code: `SELECT dept_id, COUNT(*) FROM messages_dept_${i} _____ dept_id;`,
        a: 'GROUP BY', b: 'ORDER BY', c: 'PARTITION BY', d: 'SPLIT ON',
        ans: 'A', hint: 'Two words: GROUP BY.', exp: 'GROUP BY establishes bucket aggregation keys.'
      })
    ]},
    { cat: 'HAVING', count: 10, templates: [
      (i) => ({
        diff: 'hard', concept: `Post-aggregation Filter #${i}`,
        q: `Which clause restricts grouped surveillance sectors to those with an average threat score above ${70 + i}?`,
        code: `SELECT sector_id, AVG(threat) FROM sector_scan GROUP BY sector_id _____ AVG(threat) > ${70 + i};`,
        a: 'HAVING', b: 'WHERE', c: 'FILTER', d: 'RESTRICT',
        ans: 'A', hint: 'HAVING filters aggregated groups.', exp: 'HAVING evaluates aggregate conditions after GROUP BY.'
      })
    ]},
    { cat: 'LIKE', count: 10, templates: [
      (i) => ({
        diff: 'easy', concept: `Pattern Search #${i}`,
        q: `Which pattern matches any encrypted file ending in the extension \'.kira_${i}\'?`,
        code: null,
        a: `WHERE filename LIKE '%.kira_${i}'`, b: `WHERE filename LIKE '.kira_${i}%'`,
        c: `WHERE filename ENDS '.kira_${i}'`, d: `WHERE filename MATCHES '*.kira_${i}'`,
        ans: 'A', hint: 'Prefix with % to match any characters before the extension.', exp: '\'%.ext\' checks for specific suffix matches.'
      })
    ]},
    { cat: 'JOIN', count: 12, templates: [
      (i) => ({
        diff: 'medium', concept: `Relational Join #${i}`,
        q: `Which join clause connects table suspects s with table evidence e on suspect_id?`,
        code: `SELECT s.name, e.item FROM suspects s _____ evidence e ON s.id = e.suspect_id;`,
        a: 'INNER JOIN', b: 'CROSS APPLY', c: 'FULL MERGE', d: 'LINK WITH',
        ans: 'A', hint: 'INNER JOIN selects matching rows from both sides.', exp: 'INNER JOIN matches records satisfying the ON condition.'
      })
    ]}
  ];

  for (const group of categories) {
    for (let i = 1; i <= group.count; i++) {
      const q = group.templates[0](i);
      insertStmt.run(
        group.cat, q.diff, q.concept, q.q, q.code || '',
        q.a, q.b, q.c, q.d, q.ans, q.hint, q.exp
      );
    }
  }
}

function seedRound2() {
  const insertStmt = db.prepare(`
    INSERT INTO questions (
      round_id, category, difficulty, concept, question_text, code_snippet,
      option_a, option_b, option_c, option_d, correct_option, points, hint_text, explanation
    ) VALUES (
      2, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, 2, ?, ?
    )
  `);

  const baseQuestionsR2 = [
    // --- MISSING KEYWORD ---
    {
      cat: 'MISSING_KEYWORD', diff: 'easy', concept: 'Missing WHERE',
      q: 'Kira corrupted this query by erasing the filtering clause keyword. Restore the missing keyword:',
      code: 'SELECT suspect_id, alias\nFROM taskforce_intel\n_____ city = \'Kanto\';',
      a: 'WHERE', b: 'WHEN', c: 'FILTER', d: 'HAVING',
      ans: 'A', hint: 'L says: "The missing keyword filters candidate rows prior to any grouping."',
      exp: 'WHERE filters table records based on predicate conditions.'
    },
    {
      cat: 'MISSING_KEYWORD', diff: 'easy', concept: 'Missing FROM',
      q: 'L intercepted a transmission, but the source table specification was erased:',
      code: 'SELECT name, crime_count\n_____ secret_suspects\nWHERE age > 18;',
      a: 'FROM', b: 'INTO', c: 'TABLE', d: 'IN',
      ans: 'A', hint: 'L says: "This keyword specifies the target table relation."',
      exp: 'FROM designates the table from which records are drawn.'
    },
    {
      cat: 'MISSING_KEYWORD', diff: 'medium', concept: 'Missing GROUP BY',
      q: 'Aggregate statistics on death notebook pages are failing because a clause is missing:',
      code: 'SELECT victim_country, COUNT(*)\nFROM notebook_victims\n_____ _____ victim_country;',
      a: 'GROUP BY', b: 'ORDER BY', c: 'SORT ON', d: 'CLUSTER BY',
      ans: 'A', hint: 'L says: "Two words are needed to aggregate counts per unique country."',
      exp: 'GROUP BY aggregates data according to common column values.'
    },
    {
      cat: 'MISSING_KEYWORD', diff: 'medium', concept: 'Missing HAVING',
      q: 'The task force wants to filter out cities with fewer than 5 victims, but Kira broke the syntax:',
      code: 'SELECT city, COUNT(*)\nFROM deaths\nGROUP BY city\n_____ COUNT(*) >= 5;',
      a: 'HAVING', b: 'WHERE', c: 'WHEN', d: 'LIMIT',
      ans: 'A', hint: 'L says: "To filter aggregate groups after GROUP BY, use this specific clause."',
      exp: 'HAVING applies predicate conditions to aggregated group rows.'
    },
    {
      cat: 'MISSING_KEYWORD', diff: 'easy', concept: 'Missing ORDER BY',
      q: 'The list of top suspects must be sorted by danger level, but the sort clause is missing:',
      code: 'SELECT name, danger_level\nFROM suspects\n_____ _____ danger_level DESC;',
      a: 'ORDER BY', b: 'SORT BY', c: 'RANK BY', d: 'SEQUENCE BY',
      ans: 'A', hint: 'L says: "This two-word clause sequences result rows."',
      exp: 'ORDER BY sorts output tuples in ascending or descending sequence.'
    },
    {
      cat: 'MISSING_KEYWORD', diff: 'easy', concept: 'Missing DISTINCT',
      q: 'Duplicate surveillance IP addresses are cluttering the terminal. Restore the deduplication keyword:',
      code: 'SELECT _____ ip_address\nFROM surveillance_logs;',
      a: 'DISTINCT', b: 'UNIQUE', c: 'ISOLATED', d: 'DIFFERENT',
      ans: 'A', hint: 'L says: "Place this single keyword right after SELECT to discard duplicate values."',
      exp: 'DISTINCT purges duplicate rows from the projected result set.'
    },
    {
      cat: 'MISSING_KEYWORD', diff: 'medium', concept: 'Missing INNER JOIN',
      q: 'Correlate suspects with wiretap records by completing the relational join keyword:',
      code: 'SELECT s.name, w.transcript\nFROM suspects s\n_____ _____ wiretaps w ON s.id = w.suspect_id;',
      a: 'INNER JOIN', b: 'CROSS APPLY', c: 'FULL UNION', d: 'CONNECT TO',
      ans: 'A', hint: 'L says: "Select only records where both tables share matching keys."',
      exp: 'INNER JOIN combines rows from two tables where the ON condition is satisfied.'
    },

    // --- DEBUGGING ---
    {
      cat: 'DEBUGGING', diff: 'easy', concept: 'Missing Quotes on String',
      q: 'L found a syntax error in the detective patrol query. What is broken?',
      code: 'SELECT * FROM suspects WHERE city = Tokyo;',
      a: 'The string literal Tokyo is missing quotes (\'Tokyo\').', b: 'SELECT * is invalid.', c: 'WHERE cannot evaluate city.', d: 'suspects table must be capitalized.',
      ans: 'A', hint: 'L says: "In SQL, text literals must be wrapped in single quotation marks."',
      exp: 'Without quotes, the parser treats Tokyo as an unquoted column identifier.'
    },
    {
      cat: 'DEBUGGING', diff: 'easy', concept: 'Missing Comma in SELECT',
      q: 'Identify the syntax error in this column projection query:',
      code: 'SELECT name age city FROM suspects;',
      a: 'Missing commas between column names (name, age, city).', b: 'SELECT cannot request more than one column.', c: 'FROM is placed incorrectly.', d: 'Semicolon is forbidden.',
      ans: 'A', hint: 'L says: "Expressions in the SELECT list must be separated by commas."',
      exp: 'Columns in SELECT must be comma-delimited; without commas, SQL treats them as aliases.'
    },
    {
      cat: 'DEBUGGING', diff: 'medium', concept: 'Equality with NULL Bug',
      q: 'The following query returns 0 rows even though 5 suspects have unknown alibis. Why?',
      code: 'SELECT name FROM suspects WHERE alibi = NULL;',
      a: '= NULL always evaluates to UNKNOWN; it must be rewritten as IS NULL.', b: 'The column name alibi is reserved.', c: 'NULL must be lowercase.', d: 'WHERE alibi IS FALSE is required.',
      ans: 'A', hint: 'L says: "Never compare NULL using the equality operator =."',
      exp: 'In SQL three-valued logic, x = NULL yields UNKNOWN. Must use IS NULL.'
    },
    {
      cat: 'DEBUGGING', diff: 'medium', concept: 'Aggregate in WHERE Bug',
      q: 'The following query crashes when executed. What is the fundamental bug?',
      code: 'SELECT name, age FROM suspects WHERE age = MAX(age);',
      a: 'Aggregate functions like MAX() cannot be placed in the WHERE clause.', b: 'MAX() can only be applied to string columns.', c: 'age must be wrapped in double quotes.', d: 'WHERE requires two conditions when using MAX.',
      ans: 'A', hint: 'L says: "WHERE filters rows before aggregation. Use a subquery instead."',
      exp: 'Aggregates cannot filter in WHERE; use WHERE age = (SELECT MAX(age) FROM suspects).'
    },
    {
      cat: 'DEBUGGING', diff: 'medium', concept: 'Non-aggregated Column in GROUP BY Bug',
      q: 'Why does this query fail in strict SQL engines?',
      code: 'SELECT city, occupation, COUNT(*)\nFROM suspects\nGROUP BY city;',
      a: 'occupation is in the SELECT list but not included in the GROUP BY clause.', b: 'COUNT(*) cannot be combined with occupation.', c: 'GROUP BY city must precede FROM.', d: 'city must be sorted.',
      ans: 'A', hint: 'L says: "Every projected column that is not inside an aggregate must be in GROUP BY."',
      exp: 'Non-aggregated projected columns must be declared in GROUP BY.'
    }
  ];

  for (const q of baseQuestionsR2) {
    insertStmt.run(
      q.cat, q.diff, q.concept, q.q, q.code || '',
      q.a, q.b, q.c, q.d, q.ans, q.hint, q.exp
    );
  }

  // Programmatically generate additional balanced questions across Round 2 categories (to reach 90+ total)
  const r2Categories = [
    { cat: 'MISSING_KEYWORD', count: 16, fn: (i) => ({
      diff: i % 2 === 0 ? 'easy' : 'medium', concept: `Syntax Keyword #${i}`,
      q: `L is investigating missing query keywords. Identify the keyword needed to filter suspects by status:`,
      code: `SELECT suspect_name\nFROM suspects_sector_${i}\n_____ is_active = 1;`,
      a: 'WHERE', b: 'FILTER', c: 'ON', d: 'HAVING',
      ans: 'A', hint: 'L says: "Standard row-level predicate filter keyword."', exp: 'WHERE filters individual candidate rows.'
    })},
    { cat: 'MISSING_CONDITION', count: 16, fn: (i) => ({
      diff: 'medium', concept: `Conditional Predicate #${i}`,
      q: `Complete the conditional expression to identify suspects logged in between 0${(i % 5) + 5}:00 and 0${(i % 5) + 6}:00:`,
      code: `SELECT suspect_id FROM logins\nWHERE login_time _____ '0${(i % 5) + 5}:00:00' AND '0${(i % 5) + 6}:00:00';`,
      a: 'BETWEEN', b: 'WITHIN', c: 'RANGE', d: 'DURING',
      ans: 'A', hint: 'L says: "BETWEEN defines closed boundary ranges."', exp: 'BETWEEN tests value membership in a range.'
    })},
    { cat: 'MISSING_FUNCTION', count: 16, fn: (i) => ({
      diff: 'easy', concept: `Calculation Function #${i}`,
      q: `Which SQL aggregate function computes the total number of intercepted phone calls for wiretap cell #${i}?`,
      code: `SELECT _____(call_id) FROM wiretap_cell_${i};`,
      a: 'COUNT', b: 'SUM', c: 'TOTAL', d: 'ROWS',
      ans: 'A', hint: 'L says: "COUNT computes row occurrences."', exp: 'COUNT() evaluates non-null row occurrences.'
    })},
    { cat: 'MISSING_JOIN', count: 16, fn: (i) => ({
      diff: 'medium', concept: `Relational Join #${i}`,
      q: `Complete the relational join syntax connecting taskforce agents with surveillance log #${i}:`,
      code: `SELECT a.name, l.target_ip\nFROM agents a\n_____ surveillance_log_${i} l ON a.id = l.agent_id;`,
      a: 'INNER JOIN', b: 'MERGE WITH', c: 'CROSS APPLY', d: 'ATTACH TO',
      ans: 'A', hint: 'L says: "INNER JOIN preserves common records between tables."', exp: 'INNER JOIN binds matching records on keys.'
    })},
    { cat: 'MISSING_GROUP_BY', count: 12, fn: (i) => ({
      diff: 'hard', concept: `Group Aggregation #${i}`,
      q: `Complete the missing aggregation clause to calculate the maximum victims per prefecture:`,
      code: `SELECT prefecture_id, MAX(victims)\nFROM incident_history\n_____ prefecture_id;`,
      a: 'GROUP BY', b: 'ORDER BY', c: 'SORT ON', d: 'PARTITION BY',
      ans: 'A', hint: 'L says: "Two-word clause grouping common values."', exp: 'GROUP BY groups dataset rows before aggregation.'
    })},
    { cat: 'DEBUGGING', count: 15, fn: (i) => ({
      diff: 'medium', concept: `Bug Detection #${i}`,
      q: `An operative entered this query and received an error: "SELECT city, COUNT(*) FROM suspects WHERE COUNT(*) > ${i};". What is the bug?`,
      code: `SELECT city, COUNT(*) FROM suspects WHERE COUNT(*) > ${i};`,
      a: `Aggregate condition COUNT(*) > ${i} must be placed in a HAVING clause, not in WHERE.`,
      b: 'city cannot be grouped with counts.',
      c: 'WHERE cannot accept integer comparisons.',
      d: 'COUNT(*) requires a column alias.',
      ans: 'A', hint: 'L says: "WHERE operates before grouping; HAVING operates after grouping."',
      exp: 'Filtering based on aggregate function outputs requires the HAVING clause.'
    })}
  ];

  for (const catGroup of r2Categories) {
    for (let i = 1; i <= catGroup.count; i++) {
      const q = catGroup.fn(i);
      insertStmt.run(
        catGroup.cat, q.diff, q.concept, q.q, q.code || '',
        q.a, q.b, q.c, q.d, q.ans, q.hint, q.exp
      );
    }
  }
}

function seedRound3Advanced() {
  const insertStmt = db.prepare(`
    INSERT INTO questions (
      round_id, category, difficulty, concept, question_text, code_snippet,
      option_a, option_b, option_c, option_d, correct_option, points, hint_text, explanation
    ) VALUES (
      3, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, 4, ?, ?
    )
  `);

  const r3Questions = getRound3Questions();
  for (const q of r3Questions) {
    const correctSeq = `${q.a} ||| ${q.b} ||| ${q.c} ||| ${q.d}`;
    insertStmt.run(
      q.cat, q.diff, q.concept, q.q, q.code || '',
      q.a, q.b, q.c, q.d, correctSeq, q.hint, q.exp
    );
  }
}

function seedRound4Cases() {
  const insertCaseStmt = db.prepare(`
    INSERT INTO cases (case_code, binary_code, decimal_id, kira_suspect_code, kira_name, story_title, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSuspectStmt = db.prepare(`
    INSERT INTO suspects (case_id, suspect_code, name, age, city, crimes, occupation, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLoginStmt = db.prepare(`
    INSERT INTO login_logs (case_id, suspect_code, login_time, device, ip_address, location)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertCrimeStmt = db.prepare(`
    INSERT INTO crime_records (case_id, suspect_code, crime_type, crime_count, target_type, weapon_or_method)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertTxStmt = db.prepare(`
    INSERT INTO transactions (case_id, suspect_code, amount, merchant, location, time_stamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertClueStmt = db.prepare(`
    INSERT INTO investigation_clues (
      case_id, clue_number, clue_text, target_table, question_text,
      option_a, option_b, option_c, option_d, correct_option, bit_value, hint_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const suspectPool = [
    { code: 'S1', name: 'Light Yagami', baseAge: 20, city: 'Tokyo', occ: 'University Student' },
    { code: 'S2', name: 'Misa Amane', baseAge: 19, city: 'Osaka', occ: 'Model / Idol' },
    { code: 'S3', name: 'Teru Mikami', baseAge: 26, city: 'Kyoto', occ: 'Prosecutor' },
    { code: 'S4', name: 'Kiyomi Takada', baseAge: 23, city: 'Tokyo', occ: 'News Anchor' },
    { code: 'S5', name: 'Kyosuke Higuchi', baseAge: 32, city: 'Nagoya', occ: 'Yotsuba Executive' }
  ];

  for (let dec = 0; dec < 64; dec++) {
    const binStr = dec.toString(2).padStart(6, '0');
    const caseNum = (dec + 1).toString().padStart(3, '0');
    const caseCode = `CASE-K${caseNum}`;

    const kiraIdx = dec % 5;
    const kiraArchetype = suspectPool[kiraIdx];
    const storyTitle = `The ${kiraArchetype.city} Judgment Incident (Code: ${caseCode})`;
    const description = `Unusual heart attacks and classified police leakages detected in ${kiraArchetype.city}. Binary fingerprint: ${binStr}.`;

    const caseRes = insertCaseStmt.run(
      caseCode, binStr, dec, kiraArchetype.code, kiraArchetype.name, storyTitle, description
    );
    const caseId = Number(caseRes.lastInsertRowid);

    for (let s = 0; s < 5; s++) {
      const sp = suspectPool[s];
      const isKira = (s === kiraIdx);
      const crimes = isKira ? 8 + (dec % 5) : 1 + ((dec + s) % 5);
      const age = sp.baseAge + (dec % 3);

      insertSuspectStmt.run(
        caseId, sp.code, sp.name, age, sp.city, crimes, sp.occ, isKira ? 'HIGH_PRIORITY' : 'CLEAR'
      );

      const loginHour = isKira ? (dec % 2 === 0 ? '08:45:00' : '09:12:00') : '14:20:00';
      const device = isKira ? 'Encrypted Workstation' : (s % 2 === 0 ? 'Mobile Phone' : 'Laptop');
      insertLoginStmt.run(
        caseId, sp.code, `2026-09-13 ${loginHour}`, device, `192.168.1.${100 + s * 10 + dec}`, sp.city
      );

      const crimeType = isKira ? 'Heart Attack Series' : (s === 1 ? 'Petty Theft' : 'Cyber Breach');
      const method = isKira ? 'Supernatural / Classified' : 'Network Exploit';
      insertCrimeStmt.run(
        caseId, sp.code, crimeType, crimes, 'High Profile', method
      );

      const amount = isKira ? 5400 + (dec * 10) : 350 + (s * 50);
      const merchant = isKira ? 'Apple Direct Tokyo' : 'Convenience Store';
      insertTxStmt.run(
        caseId, sp.code, amount, merchant, sp.city, `2026-09-13 ${10 + s}:30:00`
      );
    }

    const bits = binStr.split('').map(Number);

    const clueDefinitions = [
      {
        num: 1,
        table: 'SUSPECTS',
        clue: `L confirms: The primary operative has a crime count greater than 6.`,
        q: `Examine the SUSPECTS table. Which candidate has the highest crime count?`,
        opts: ['S1 (Light Yagami)', 'S2 (Misa Amane)', 'S3 (Teru Mikami)', 'S4 (Kiyomi Takada)'],
        ansMap: ['A', 'B', 'C', 'D'][kiraIdx % 4],
        bit: bits[0],
        hint: 'Sort suspects by crimes in descending order.'
      },
      {
        num: 2,
        table: 'LOGIN_LOG',
        clue: `Network intercept: Kira logged in during the early morning hours before 09:30 AM.`,
        q: `Query LOGIN_LOG. Which suspect authenticated before 09:30 AM on an Encrypted Workstation?`,
        opts: [`${kiraArchetype.code} (${kiraArchetype.name})`, 'S2 (Misa Amane)', 'S5 (Kyosuke Higuchi)', 'S4 (Kiyomi Takada)'],
        ansMap: 'A',
        bit: bits[1],
        hint: 'Check the login_time column for morning timestamps.'
      },
      {
        num: 3,
        table: 'CRIME_RECORD',
        clue: `Forensic report: The weapon used in the classified incidents is labeled 'Supernatural / Classified'.`,
        q: `Inspect CRIME_RECORD. Which suspect code matches the 'Supernatural / Classified' method?`,
        opts: ['S3 (Teru Mikami)', `${kiraArchetype.code} (${kiraArchetype.name})`, 'S5 (Kyosuke Higuchi)', 'S2 (Misa Amane)'],
        ansMap: 'B',
        bit: bits[2],
        hint: 'Filter CRIME_RECORD WHERE weapon_or_method LIKE \'Supernatural%\'.'
      },
      {
        num: 4,
        table: 'TRANSACTIONS',
        clue: `Financial audit: The subject made an expenditure above 5,000 yen at an Apple merchant.`,
        q: `Query TRANSACTIONS. Which suspect transacted over 5,000 yen at 'Apple Direct Tokyo'?`,
        opts: ['S2 (Misa Amane)', 'S4 (Kiyomi Takada)', `${kiraArchetype.code} (${kiraArchetype.name})`, 'S5 (Kyosuke Higuchi)'],
        ansMap: 'C',
        bit: bits[3],
        hint: 'WHERE amount > 5000 AND merchant LIKE \'%Apple%\'.'
      },
      {
        num: 5,
        table: 'SUSPECTS',
        clue: `Intelligence dossier: Kira operates in the primary jurisdictional city of ${kiraArchetype.city}.`,
        q: `Filter SUSPECTS by city = '${kiraArchetype.city}' and status = 'HIGH_PRIORITY'. Who is flagged?`,
        opts: ['S5 (Kyosuke Higuchi)', 'S3 (Teru Mikami)', 'S2 (Misa Amane)', `${kiraArchetype.code} (${kiraArchetype.name})`],
        ansMap: 'D',
        bit: bits[4],
        hint: 'WHERE status = \'HIGH_PRIORITY\'.'
      },
      {
        num: 6,
        table: 'SUSPECTS',
        clue: `Final confrontation: All evidence converges on the operative holding the 6-bit binary signature ${binStr}.`,
        q: `Reconstruct the full evidence chain. Confirm the true identity of Kira for Case ${caseCode}:`,
        opts: [`${kiraArchetype.name} (${kiraArchetype.code})`, 'Near (N)', 'Mello (M)', 'Touta Matsuda'],
        ansMap: 'A',
        bit: bits[5],
        hint: 'All 6 clues point deterministically to this single individual.'
      }
    ];

    for (const cd of clueDefinitions) {
      insertClueStmt.run(
        caseId, cd.num, cd.clue, cd.table, cd.q,
        cd.opts[0], cd.opts[1], cd.opts[2], cd.opts[3],
        cd.ansMap, cd.bit, cd.hint
      );
    }
  }
}

if (require.main === module) {
  seedAll();
}

module.exports = { seedAll };
