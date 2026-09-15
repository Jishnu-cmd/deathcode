// Round 3 Question Bank: Arrange Missing Keywords in Order
// Each challenge provides SQL code with blanks [ 1 ], [ 2 ], [ 3 ], [ 4 ]
// and 4 missing keywords (option_a, option_b, option_c, option_d) that match slots 1..4.

function getRound3Questions() {
  const list = [];

  // ==========================================
  // 1. WINDOW FUNCTIONS (12 Challenges)
  // ==========================================
  const windowBases = [
    {
      cat: 'WINDOW_FUNCTION', diff: 'medium', concept: 'Window Partition & Order',
      q: 'Near is tracking Kira\'s login timeline. Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to partition logins by suspect and order them chronologically:',
      code: `SELECT suspect_code, login_time,
       [ 1 ]() [ 2 ] (
         [ 3 ] suspect_code
         [ 4 ] login_time DESC
       ) as login_seq
FROM login_logs;`,
      a: 'ROW_NUMBER', b: 'OVER', c: 'PARTITION BY', d: 'ORDER BY',
      hint: 'Window specification starts with OVER, partitioned by suspect and ordered chronologically.',
      exp: 'ROW_NUMBER() OVER (PARTITION BY suspect_code ORDER BY login_time DESC) assigns sequential numbers within each partition.'
    },
    {
      cat: 'WINDOW_FUNCTION', diff: 'hard', concept: 'Dense Ranking Crime Severity',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to calculate unbroken crime severity ranks per city:',
      code: `SELECT city, suspect_code, crimes,
       [ 1 ]() [ 2 ] (
         [ 3 ] city
         [ 4 ] crimes DESC
       ) as unbroken_rank
FROM suspects;`,
      a: 'DENSE_RANK', b: 'OVER', c: 'PARTITION BY', d: 'ORDER BY',
      hint: 'DENSE_RANK ensures no ranks are skipped after tied values.',
      exp: 'DENSE_RANK() OVER (PARTITION BY city ORDER BY crimes DESC) computes dense ranks within each city partition.'
    },
    {
      cat: 'WINDOW_FUNCTION', diff: 'hard', concept: 'Lag Navigation for Prior Timestamp',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to retrieve each suspect\'s prior login timestamp in their session:',
      code: `SELECT suspect_code, login_time,
       [ 1 ](login_time) [ 2 ] (
         [ 3 ] suspect_code
         [ 4 ] login_time ASC
       ) as previous_login
FROM login_logs;`,
      a: 'LAG', b: 'OVER', c: 'PARTITION BY', d: 'ORDER BY',
      hint: 'LAG accesses prior row values within the specified partition and order.',
      exp: 'LAG(login_time) OVER (PARTITION BY suspect_code ORDER BY login_time ASC) accesses the preceding login row.'
    },
    {
      cat: 'WINDOW_FUNCTION', diff: 'hard', concept: 'Lead Navigation for Subsequent Crime',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to peek at the next incident method in the timeline:',
      code: `SELECT suspect_code, weapon_or_method,
       [ 1 ](weapon_or_method) [ 2 ] (
         [ 3 ] suspect_code
         [ 4 ] id ASC
       ) as next_incident_method
FROM crime_records;`,
      a: 'LEAD', b: 'OVER', c: 'PARTITION BY', d: 'ORDER BY',
      hint: 'LEAD looks forward into subsequent records within the partition.',
      exp: 'LEAD(weapon_or_method) OVER (PARTITION BY suspect_code ORDER BY id ASC) returns the following row.'
    },
    {
      cat: 'WINDOW_FUNCTION', diff: 'medium', concept: 'Running Cumulative Transaction Sum',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to compute a cumulative financial balance per suspect:',
      code: `SELECT suspect_code, amount,
       [ 1 ](amount) [ 2 ] (
         [ 3 ] suspect_code
         [ 4 ] time_stamp ASC
       ) as running_total
FROM transactions;`,
      a: 'SUM', b: 'OVER', c: 'PARTITION BY', d: 'ORDER BY',
      hint: 'Aggregate SUM becomes a window cumulative sum when combined with OVER, PARTITION BY, and ORDER BY.',
      exp: 'SUM(amount) OVER (PARTITION BY suspect_code ORDER BY time_stamp ASC) calculates cumulative running sum.'
    },
    {
      cat: 'WINDOW_FUNCTION', diff: 'medium', concept: 'Standard Rank with Gap Jumps',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to calculate traditional competition ranks that skip positions on ties:',
      code: `SELECT suspect_code, crime_count,
       [ 1 ]() [ 2 ] (
         [ 3 ] crime_count
         [ 4 ]
       ) as competition_rank
FROM crime_records;`,
      a: 'RANK', b: 'OVER', c: 'ORDER BY', d: 'DESC',
      hint: 'Standard RANK() skips positions when values tie.',
      exp: 'RANK() OVER (ORDER BY crime_count DESC) assigns 1, 1, 3 for tied first places.'
    }
  ];

  list.push(...windowBases);
  // Expand Window Functions to 12
  for (let i = 1; i <= 6; i++) {
    list.push({
      cat: 'WINDOW_FUNCTION', diff: i % 2 === 0 ? 'medium' : 'hard', concept: `Partition Window Tracking #${i}`,
      q: `Surveillance Sector #${i} Stream: Reconstruct the query tracking transaction outliers per sector:`,
      code: `SELECT suspect_code, amount,
       [ 1 ](amount) [ 2 ] (
         [ 3 ] location
         [ 4 ] time_stamp DESC
       ) as max_location_expenditure
FROM transactions;`,
      a: 'MAX', b: 'OVER', c: 'PARTITION BY', d: 'ORDER BY',
      hint: 'MAX with OVER computes maximum value per partition.',
      exp: 'MAX(amount) OVER (PARTITION BY location ORDER BY time_stamp DESC) inspects location peaks.'
    });
  }

  // ==========================================
  // 2. SUBQUERIES & CTES (12 Challenges)
  // ==========================================
  const cteBases = [
    {
      cat: 'SUBQUERY_CTE', diff: 'medium', concept: 'CTE Definition and Filtering',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to establish a Common Table Expression and filter its output:',
      code: `[ 1 ] HighRiskSuspects AS (
  [ 2 ] * FROM suspects WHERE crimes >= 5
)
SELECT * FROM HighRiskSuspects
[ 3 ] city = 'Tokyo'
[ 4 ] crimes DESC;`,
      a: 'WITH', b: 'SELECT', c: 'WHERE', d: 'ORDER BY',
      hint: 'CTEs commence with WITH, contain a SELECT, and the outer query filters with WHERE and sorts with ORDER BY.',
      exp: 'WITH establishes the CTE, SELECT projects inner rows, WHERE filters outer result, ORDER BY sorts.'
    },
    {
      cat: 'SUBQUERY_CTE', diff: 'hard', concept: 'Correlated EXISTS Subquery',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to test whether suspect records have matching criminal alibis:',
      code: `SELECT s.name, s.suspect_code FROM suspects s
[ 1 ] [ 2 ] (
  [ 3 ] 1 FROM crime_records c
  [ 4 ] c.suspect_code = s.suspect_code
);`,
      a: 'WHERE', b: 'EXISTS', c: 'SELECT', d: 'WHERE',
      hint: 'WHERE EXISTS introduces the correlated existence subquery containing SELECT 1 ... WHERE match.',
      exp: 'WHERE EXISTS (SELECT 1 FROM crime_records c WHERE c.suspect_code = s.suspect_code) short-circuits on first match.'
    },
    {
      cat: 'SUBQUERY_CTE', diff: 'medium', concept: 'Subquery in IN Operator',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to filter suspects belonging to high-frequency login terminals:',
      code: `SELECT * FROM suspects
[ 1 ] suspect_code [ 2 ] (
  [ 3 ] suspect_code FROM login_logs
  [ 4 ] device = 'DESKTOP_SECURE'
);`,
      a: 'WHERE', b: 'IN', c: 'SELECT', d: 'WHERE',
      hint: 'WHERE col IN (SELECT col FROM table WHERE condition) identifies set membership.',
      exp: 'WHERE suspect_code IN (SELECT ...) filters parent records whose key matches the inner projection.'
    },
    {
      cat: 'SUBQUERY_CTE', diff: 'hard', concept: 'Aggregated CTE with Having Filter',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to build a summary CTE grouping suspects with excessive logins:',
      code: `[ 1 ] Spikes AS (
  SELECT suspect_code, COUNT(*) as hits FROM login_logs
  [ 2 ] suspect_code
  [ 3 ] COUNT(*) > 5
)
SELECT * FROM Spikes [ 4 ] hits DESC;`,
      a: 'WITH', b: 'GROUP BY', c: 'HAVING', d: 'ORDER BY',
      hint: 'WITH starts the CTE, GROUP BY aggregates, HAVING restricts groups, ORDER BY sorts.',
      exp: 'WITH defines CTE; inside, GROUP BY and HAVING isolate high counts; outer query orders.'
    },
    {
      cat: 'SUBQUERY_CTE', diff: 'hard', concept: 'Scalar Subquery Comparison in WHERE',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to isolate suspects whose crimes exceed the national average:',
      code: `SELECT suspect_code, crimes FROM suspects
[ 1 ] crimes > (
  [ 2 ] [ 3 ](crimes)
  [ 4 ] suspects
);`,
      a: 'WHERE', b: 'SELECT', c: 'AVG', d: 'FROM',
      hint: 'WHERE col > (SELECT AVG(col) FROM tbl) compares each record to the scalar subquery mean.',
      exp: 'The scalar subquery (SELECT AVG(crimes) FROM suspects) evaluates first, then outer WHERE filters.'
    },
    {
      cat: 'SUBQUERY_CTE', diff: 'medium', concept: 'Multi-CTE Chaining',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to link two consecutive CTE pipelines in a single statement:',
      code: `[ 1 ] KantoGroup [ 2 ] (
  SELECT * FROM suspects WHERE city = 'Kanto'
),
HighThreat AS (
  [ 3 ] * FROM KantoGroup WHERE crimes > 2
)
SELECT * FROM HighThreat [ 4 ] crimes DESC;`,
      a: 'WITH', b: 'AS', c: 'SELECT', d: 'ORDER BY',
      hint: 'WITH initiates CTEs; multiple CTEs are separated by comma using name AS (query); outer query sorts with ORDER BY.',
      exp: 'WITH CTE1 AS (...), CTE2 AS (...) links relational pipelines sequentially.'
    }
  ];

  list.push(...cteBases);
  // Expand CTEs to 12
  for (let i = 1; i <= 6; i++) {
    list.push({
      cat: 'SUBQUERY_CTE', diff: 'medium', concept: `CTE Channel Reassembly #${i}`,
      q: `Wiretap Decoder #${i}: Reconstruct the encrypted CTE analyzing financial movement:`,
      code: `[ 1 ] HighTx AS (
  [ 2 ] suspect_code, amount FROM transactions WHERE amount > ${10000 + i * 5000}
)
SELECT * FROM HighTx
[ 3 ] amount > ${20000 + i * 5000}
[ 4 ] amount DESC;`,
      a: 'WITH', b: 'SELECT', c: 'WHERE', d: 'ORDER BY',
      hint: 'WITH initiates the expression, SELECT extracts values, WHERE conditions output, ORDER BY sorts.',
      exp: 'Standard syntax: WITH name AS (SELECT ...) SELECT * FROM name WHERE ... ORDER BY ...'
    });
  }

  // ==========================================
  // 3. COMPLEX JOINS (12 Challenges)
  // ==========================================
  const joinBases = [
    {
      cat: 'COMPLEX_JOIN', diff: 'hard', concept: 'Left Anti-Join for Unmatched Records',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to identify all suspects who have NEVER logged into the terminal network:',
      code: `SELECT s.suspect_code, s.name FROM suspects s
[ 1 ] login_logs l
[ 2 ] s.suspect_code = l.suspect_code
[ 3 ] l.suspect_code [ 4 ];`,
      a: 'LEFT JOIN', b: 'ON', c: 'WHERE', d: 'IS NULL',
      hint: 'An anti-join uses LEFT JOIN ... ON, filtered by WHERE foreign_key IS NULL.',
      exp: 'LEFT JOIN retains all left rows; WHERE l.suspect_code IS NULL discards matches, isolating orphans.'
    },
    {
      cat: 'COMPLEX_JOIN', diff: 'medium', concept: 'Inner Join with Multiple Filters',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to link suspects with their verified crime records in Kanto:',
      code: `SELECT s.name, c.crime_type FROM suspects s
[ 1 ] crime_records c
[ 2 ] s.suspect_code = c.suspect_code
[ 3 ] s.city = 'Kanto'
[ 4 ] s.name ASC;`,
      a: 'INNER JOIN', b: 'ON', c: 'WHERE', d: 'ORDER BY',
      hint: 'INNER JOIN pairs records ON foreign key; WHERE filters and ORDER BY arranges output.',
      exp: 'INNER JOIN ... ON ... WHERE ... ORDER BY ... is the canonical relational matching pattern.'
    },
    {
      cat: 'COMPLEX_JOIN', diff: 'hard', concept: 'Self-Join Detecting Same-City Operatives',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to find pairs of different suspects operating in the identical city:',
      code: `SELECT a.name, b.name, a.city FROM suspects a
[ 1 ] suspects b
[ 2 ] a.city = b.city AND a.id < b.id
[ 3 ] a.city
[ 4 ] a.name ASC;`,
      a: 'JOIN', b: 'ON', c: 'ORDER BY', d: 'LIMIT',
      hint: 'Self-join attaches a table to itself using aliases a and b, joined ON condition.',
      exp: 'Joining suspects a to suspects b ON city matches pairs without duplicate mirror rows.'
    },
    {
      cat: 'COMPLEX_JOIN', diff: 'medium', concept: 'Multi-Table Relational Chain',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to join suspects to both crime records and transactions in sequence:',
      code: `SELECT s.suspect_code, c.crime_type, t.amount FROM suspects s
[ 1 ] crime_records c [ 2 ] s.suspect_code = c.suspect_code
[ 3 ] transactions t [ 4 ] s.suspect_code = t.suspect_code;`,
      a: 'JOIN', b: 'ON', c: 'JOIN', d: 'ON',
      hint: 'Sequential table joins repeat JOIN tbl ON condition for each related table.',
      exp: 'Each subsequent table requires its own JOIN declaration followed by an ON predicate.'
    },
    {
      cat: 'COMPLEX_JOIN', diff: 'medium', concept: 'Filtered Left Join with Limit',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to retrieve suspect financial activity with transaction constraints:',
      code: `SELECT s.name, t.amount FROM suspects s
[ 1 ] transactions t [ 2 ] s.suspect_code = t.suspect_code
[ 3 ] t.amount > 25000
[ 4 ] 5;`,
      a: 'LEFT JOIN', b: 'ON', c: 'WHERE', d: 'LIMIT',
      hint: 'LEFT JOIN followed by ON, WHERE filter, and ending with LIMIT clause.',
      exp: 'LEFT JOIN ... ON ... WHERE ... LIMIT ... preserves suspect rows meeting threshold.'
    },
    {
      cat: 'COMPLEX_JOIN', diff: 'hard', concept: 'Cross Join Cartesian Product Analysis',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to generate all theoretical combinations between surveillance sectors and dates:',
      code: `SELECT s.city, d.target_type FROM suspects s
[ 1 ] crime_records d
[ 2 ] s.city = 'Tokyo'
[ 3 ] s.city [ 4 ];`,
      a: 'CROSS JOIN', b: 'WHERE', c: 'ORDER BY', d: 'ASC',
      hint: 'CROSS JOIN produces all pairwise permutations without needing an ON clause.',
      exp: 'CROSS JOIN pairs every row of table 1 with every row of table 2.'
    }
  ];

  list.push(...joinBases);
  // Expand Joins to 12
  for (let i = 1; i <= 6; i++) {
    list.push({
      cat: 'COMPLEX_JOIN', diff: 'hard', concept: `Wiretap Link Forensics #${i}`,
      q: `Forensic Joint Inspection #${i}: Reconstruct the query isolating suspects who have zero transactions in registry #${i}:`,
      code: `SELECT s.suspect_code, s.name FROM suspects s
[ 1 ] transactions t
[ 2 ] s.suspect_code = t.suspect_code
[ 3 ] t.id [ 4 ];`,
      a: 'LEFT JOIN', b: 'ON', c: 'WHERE', d: 'IS NULL',
      hint: 'Anti-join pattern: LEFT JOIN ... ON ... WHERE right_table.id IS NULL.',
      exp: 'Preserves left records with NULL right keys to find unmatched rows.'
    });
  }

  // ==========================================
  // 4. CONDITIONAL LOGIC (10 Challenges)
  // ==========================================
  const condBases = [
    {
      cat: 'CONDITIONAL_LOGIC', diff: 'medium', concept: 'CASE WHEN Classification',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to categorize suspects into threat tiers based on their crime records:',
      code: `SELECT suspect_code,
  [ 1 ]
    [ 2 ] crimes >= 6 [ 3 ] 'CRITICAL_KIRA_THREAT'
    ELSE 'STANDARD_SUSPECT'
  [ 4 ] as threat_level
FROM suspects;`,
      a: 'CASE', b: 'WHEN', c: 'THEN', d: 'END',
      hint: 'Conditional branching syntax: CASE WHEN condition THEN value ELSE fallback END.',
      exp: 'CASE expressions evaluate conditions sequentially and return the THEN branch value upon match.'
    },
    {
      cat: 'CONDITIONAL_LOGIC', diff: 'medium', concept: 'Multi-Condition CASE Expression',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to classify suspects into three distinct risk tiers:',
      code: `SELECT suspect_code,
  [ 1 ]
    [ 2 ] age < 25 [ 3 ] 'YOUTH_PROFILE'
    WHEN age >= 25 THEN 'MATURE_PROFILE'
  [ 4 ] as age_tier
FROM suspects;`,
      a: 'CASE', b: 'WHEN', c: 'THEN', d: 'END',
      hint: 'A CASE statement must start with CASE, use WHEN/THEN branches, and conclude with END.',
      exp: 'CASE opens expression; WHEN evaluates predicate; THEN provides result; END closes block.'
    },
    {
      cat: 'CONDITIONAL_LOGIC', diff: 'hard', concept: 'Conditional Aggregation SUM CASE',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to count heart attack casualties in a single aggregation scan:',
      code: `SELECT city,
  SUM( [ 1 ] [ 2 ] crime_type = 'HEART_ATTACK' [ 3 ] 1 ELSE 0 [ 4 ] ) as heart_attacks
FROM crime_records
GROUP BY city;`,
      a: 'CASE', b: 'WHEN', c: 'THEN', d: 'END',
      hint: 'Inside SUM(), wrap CASE WHEN condition THEN 1 ELSE 0 END.',
      exp: 'SUM(CASE WHEN ... THEN 1 ELSE 0 END) tallies specific occurrences conditionally per group.'
    },
    {
      cat: 'CONDITIONAL_LOGIC', diff: 'medium', concept: 'Fallback Value Resolution with COALESCE',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to resolve null suspect occupations with default and ordering:',
      code: `SELECT suspect_code,
  [ 1 ](occupation, 'UNKNOWN_STATUS') as resolved_job
FROM suspects
[ 2 ] city = 'Tokyo'
[ 3 ] resolved_job [ 4 ];`,
      a: 'COALESCE', b: 'WHERE', c: 'ORDER BY', d: 'ASC',
      hint: 'COALESCE returns the first non-null parameter; query filters with WHERE and sorts with ORDER BY.',
      exp: 'COALESCE replaces NULLs with the first non-null argument in the sequence.'
    }
  ];

  list.push(...condBases);
  // Expand Conditional Logic to 10
  for (let i = 1; i <= 6; i++) {
    list.push({
      cat: 'CONDITIONAL_LOGIC', diff: 'medium', concept: `Conditional Threat Assessment #${i}`,
      q: `Surveillance Classifier #${i}: Reconstruct the conditional syntax scoring suspect risk:`,
      code: `SELECT suspect_code,
  [ 1 ]
    [ 2 ] crimes > ${i * 2} [ 3 ] 'HIGH_PRIORITY'
    ELSE 'NORMAL_PRIORITY'
  [ 4 ] as priority_code
FROM suspects;`,
      a: 'CASE', b: 'WHEN', c: 'THEN', d: 'END',
      hint: 'CASE begins expression, WHEN specifies condition, THEN gives outcome, END terminates.',
      exp: 'Standard CASE WHEN THEN END expression syntax.'
    });
  }

  // ==========================================
  // 5. SET OPERATIONS (8 Challenges)
  // ==========================================
  const setBases = [
    {
      cat: 'SET_OPERATIONS', diff: 'medium', concept: 'UNION ALL Set Combination',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to merge suspect locations across two surveillance units without deduplication:',
      code: `SELECT location FROM login_logs
[ 1 ] [ 2 ]
SELECT location FROM transactions
[ 3 ] location [ 4 ] 20;`,
      a: 'UNION', b: 'ALL', c: 'ORDER BY', d: 'LIMIT',
      hint: 'UNION ALL concatenates datasets preserving duplicates; ORDER BY and LIMIT sort and cap.',
      exp: 'UNION ALL joins row sets without the overhead of deduplication.'
    },
    {
      cat: 'SET_OPERATIONS', diff: 'hard', concept: 'INTERSECT Common Suspect Isolation',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to find suspect codes present in BOTH crime records AND login logs:',
      code: `SELECT suspect_code FROM crime_records
[ 1 ]
SELECT suspect_code FROM login_logs
[ 2 ] suspect_code [ 3 ] [ 4 ] 10;`,
      a: 'INTERSECT', b: 'ORDER BY', c: 'DESC', d: 'LIMIT',
      hint: 'INTERSECT finds rows common to both result sets; ORDER BY DESC LIMIT sorts and caps.',
      exp: 'INTERSECT evaluates mathematical set intersection (A ∩ B).'
    },
    {
      cat: 'SET_OPERATIONS', diff: 'hard', concept: 'EXCEPT Set Difference Isolation',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to extract suspects registered in Tokyo who have NO alibis in the alibi table:',
      code: `SELECT suspect_code FROM suspects WHERE city = 'Tokyo'
[ 1 ]
SELECT suspect_code FROM alibi_records
[ 2 ] suspect_code [ 3 ] [ 4 ] 15;`,
      a: 'EXCEPT', b: 'ORDER BY', c: 'ASC', d: 'LIMIT',
      hint: 'EXCEPT subtracts matching rows from the second query from the first query (A - B).',
      exp: 'EXCEPT performs set difference, removing second-query matches from the primary result set.'
    },
    {
      cat: 'SET_OPERATIONS', diff: 'medium', concept: 'UNION Deduplication with Ordering',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to generate a deduplicated list of all active cities sorted alphabetically:',
      code: `SELECT city FROM suspects
[ 1 ]
SELECT location as city FROM login_logs
[ 2 ] city [ 3 ] [ 4 ] 25;`,
      a: 'UNION', b: 'ORDER BY', c: 'ASC', d: 'LIMIT',
      hint: 'UNION purges duplicates between the queries, followed by ORDER BY ASC LIMIT.',
      exp: 'UNION automatically applies set distinct deduplication across both operand queries.'
    }
  ];

  list.push(...setBases);
  // Expand Set Operations to 8
  for (let i = 1; i <= 4; i++) {
    list.push({
      cat: 'SET_OPERATIONS', diff: 'medium', concept: `Set Channel Deduction #${i}`,
      q: `Network Set Analyzer #${i}: Reconstruct the query subtracting inactive devices from terminal pool:`,
      code: `SELECT device FROM login_logs
[ 1 ]
SELECT device FROM decommissioned_devices
[ 2 ] device [ 3 ] [ 4 ] 5;`,
      a: 'EXCEPT', b: 'ORDER BY', c: 'DESC', d: 'LIMIT',
      hint: 'EXCEPT removes decommissioned devices; ORDER BY DESC LIMIT sorts descending.',
      exp: 'EXCEPT removes items found in the second query from the first.'
    });
  }

  // ==========================================
  // 6. GROUP & HAVING (10 Challenges)
  // ==========================================
  const groupBases = [
    {
      cat: 'GROUP_HAVING', diff: 'medium', concept: 'Group By with Having and Sort',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to find cities containing at least 3 high-threat suspects, ordered by frequency:',
      code: `SELECT city, COUNT(*) as total_suspects
FROM suspects
[ 1 ] city
[ 2 ] COUNT(*) >= 3
[ 3 ] total_suspects [ 4 ];`,
      a: 'GROUP BY', b: 'HAVING', c: 'ORDER BY', d: 'DESC',
      hint: 'GROUP BY forms clusters; HAVING filters aggregated groups; ORDER BY DESC arranges descending.',
      exp: 'GROUP BY establishes grouping; HAVING filters aggregate metrics; ORDER BY DESC sorts.'
    },
    {
      cat: 'GROUP_HAVING', diff: 'hard', concept: 'Pre-Filter and Post-Filter Pipeline',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to filter individual transactions before grouping and filter total amounts after:',
      code: `SELECT merchant, SUM(amount) as total_spent
FROM transactions
[ 1 ] amount >= 500
[ 2 ] merchant
[ 3 ] SUM(amount) > 100000
[ 4 ] total_spent DESC;`,
      a: 'WHERE', b: 'GROUP BY', c: 'HAVING', d: 'ORDER BY',
      hint: 'WHERE filters individual records before grouping; GROUP BY clusters; HAVING filters groups; ORDER BY sorts.',
      exp: 'WHERE filters row inputs; GROUP BY clusters; HAVING filters group sums; ORDER BY sorts final output.'
    },
    {
      cat: 'GROUP_HAVING', diff: 'medium', concept: 'Distinct Counting within Groups',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to group devices by unique suspect users and sort by user count:',
      code: `SELECT device, COUNT(DISTINCT suspect_code) as unique_users
FROM login_logs
[ 1 ] device
[ 2 ] COUNT(DISTINCT suspect_code) > 1
[ 3 ] unique_users [ 4 ];`,
      a: 'GROUP BY', b: 'HAVING', c: 'ORDER BY', d: 'DESC',
      hint: 'GROUP BY device, HAVING condition on distinct count, ORDER BY unique_users DESC.',
      exp: 'GROUP BY forms buckets; HAVING restricts multi-user devices; ORDER BY DESC orders.'
    },
    {
      cat: 'GROUP_HAVING', diff: 'medium', concept: 'Average Metric Threshold Filter',
      q: 'Arrange the missing keywords in order ([ 1 ], [ 2 ], [ 3 ], [ 4 ]) to find crime categories whose average victim count exceeds 2:',
      code: `SELECT target_type, AVG(crime_count) as avg_count
FROM crime_records
[ 1 ] target_type
[ 2 ] AVG(crime_count) > 2
[ 3 ] avg_count [ 4 ];`,
      a: 'GROUP BY', b: 'HAVING', c: 'ORDER BY', d: 'DESC',
      hint: 'GROUP BY target_type, HAVING checks aggregate average, ORDER BY DESC sorts descending.',
      exp: 'HAVING evaluates aggregate functions like AVG() that cannot be placed in a WHERE clause.'
    }
  ];

  list.push(...groupBases);
  // Expand Group/Having to 10
  for (let i = 1; i <= 6; i++) {
    list.push({
      cat: 'GROUP_HAVING', diff: 'medium', concept: `Cluster Aggregation Forensics #${i}`,
      q: `Surveillance Cluster #${i}: Reconstruct the aggregation query isolating locations with suspicious login volume:`,
      code: `SELECT location, COUNT(*) as login_vol
FROM login_logs
[ 1 ] location
[ 2 ] COUNT(*) >= ${3 + i}
[ 3 ] login_vol [ 4 ];`,
      a: 'GROUP BY', b: 'HAVING', c: 'ORDER BY', d: 'DESC',
      hint: 'GROUP BY defines location clusters; HAVING filters on volume; ORDER BY DESC sorts highest first.',
      exp: 'Standard syntax: GROUP BY col HAVING COUNT(*) >= N ORDER BY alias DESC.'
    });
  }

  return list;
}

module.exports = {
  getRound3Questions
};
