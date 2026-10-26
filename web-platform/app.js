/**
 * MySQL Pro Learning Platform Application Logic
 * Powers in-browser SQL execution via SQL.js WASM, curriculum tracking,
 * interactive lab query loading, and interview flashcards.
 */

let db = null;
let currentTab = 'curriculum';

// ------------------------------------------------------------------------
// 1. Curriculum Data (6 Months / 24 Weeks)
// ------------------------------------------------------------------------
const CURRICULUM = [
  {
    month: 1,
    title: "Month 1: Advanced SQL & Analytical Querying",
    focus: "Bridging intermediate SQL to advanced analytics, Window Functions, CTEs, JSON & FTS.",
    weeks: [
      { week: 1, title: "Logical Query Execution Order & Advanced Joins", desc: "Understanding the FROM -> WHERE -> GROUP BY -> SELECT order, Self Joins, Non-Equi Joins, and MySQL 8 Hash Joins." },
      { week: 2, title: "Window Functions & Analytical Frameworks", desc: "ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, and sliding window frame specifications." },
      { week: 3, title: "Recursive CTEs & Hierarchical Graph Queries", desc: "Recursive CTEs for multi-level organization hierarchies, referral trees, and dynamic date ranges." },
      { week: 4, title: "MySQL 8 Native JSON & Full-Text Search", desc: "JSON extraction (->, ->>), JSON_TABLE relational projection, virtual column indexing, and Boolean Mode FTS." }
    ]
  },
  {
    month: 2,
    title: "Month 2: InnoDB Internals & Deep Indexing",
    focus: "Mastering storage engine memory/disk architecture, B+ Tree mechanics, and EXPLAIN ANALYZE.",
    weeks: [
      { week: 5, title: "InnoDB Memory & Disk Structures", desc: "Buffer Pool LRU lists, Redo Log Buffer, Change Buffer, 16KB Page anatomy, and Doublewrite Buffer." },
      { week: 6, title: "B+ Tree Anatomy & Leaf Page Splits", desc: "Clustered indexes vs secondary indexes, page fill factors, random I/O penalties, and index selectivity." },
      { week: 7, title: "Covering Indexes & Leftmost Prefix Rule", desc: "Eliminating clustered index bookmark lookups, composite index ordering, and MySQL 8 Index Skip Scans." },
      { week: 8, title: "Query Execution Plan Mastery (EXPLAIN ANALYZE)", desc: "Analyzing actual time vs estimated cost, loops, access types (ref, range, eq_ref), and eliminating filesorts." }
    ]
  },
  {
    month: 3,
    title: "Month 3: Concurrency, MVCC & Server Tuning",
    focus: "ACID isolation guarantees, row-level locking, deadlock prevention, and production tuning.",
    weeks: [
      { week: 9, title: "ACID, WAL & Crash Recovery Tuning", desc: "Undo log rollbacks, redo log WAL, and tuning innodb_flush_log_at_trx_commit vs sync_binlog for TPS." },
      { week: 10, title: "Isolation Levels & MVCC Snapshot Mechanics", desc: "Read Committed vs Repeatable Read, DB_TRX_ID, DB_ROLL_PTR, and Read View lifecycle." },
      { week: 11, title: "Locking Internals & Deadlock Mastery", desc: "Record Locks, Gap Locks, Next-Key Locks, and mathematical deadlock immunity using canonical lock ordering." },
      { week: 12, title: "Production Server Tuning & Slow Query Logs", desc: "Buffer Pool sizing (70-80% RAM), pt-query-digest, slow query threshold profiling (long_query_time = 0.05)." }
    ]
  },
  {
    month: 4,
    title: "Month 4: Big Data Scaling, Partitioning & Cloud",
    focus: "Ingesting and managing tens of millions of records using partitioning and public cloud datasets.",
    weeks: [
      { week: 13, title: "High-Speed Bulk Ingestion Pipelines", desc: "Optimizing LOAD DATA LOCAL INFILE, bulk insert batching, and temporary constraint suspension." },
      { week: 14, title: "Public Cloud Datasets & Spatial GIS SQL", desc: "AWS Open Data NYC Taxi and aviation data; R-Tree spatial indexes and ST_Distance_Sphere." },
      { week: 15, title: "Table Partitioning Architecture", desc: "RANGE, LIST, and HASH partitioning; strict rules requiring partition keys in all unique/primary keys." },
      { week: 16, title: "Partition Pruning & Zero-Downtime Data Aging", desc: "Proving partition elimination in EXPLAIN; instant sub-10ms data drops via ALTER TABLE DROP PARTITION." }
    ]
  },
  {
    month: 5,
    title: "Month 5: High Availability, Replication & Security",
    focus: "Multi-node replication, ProxySQL query routing, point-in-time disaster recovery, and RBAC.",
    weeks: [
      { week: 17, title: "GTID-Based Replication & Semi-Sync", desc: "Row-based binary logging, three-thread replication architecture, and automated GTID failover." },
      { week: 18, title: "ProxySQL & Automated Read/Write Splitting", desc: "Connection multiplexing, routing SELECT ... FOR UPDATE to master, and shunning lagging replicas." },
      { week: 19, title: "Enterprise Backups & Point-in-Time Recovery", desc: "mysqldump --single-transaction, binlog coordinate extraction, and point-in-time recovery to the second." },
      { week: 20, title: "Hardened Enterprise Security & Compliance", desc: "RBAC least-privilege roles, TLS encryption in transit, tablespace encryption at rest, and audit logs." }
    ]
  },
  {
    month: 6,
    title: "Month 6: Capstone Portfolio Projects & Career Launch",
    focus: "Benchmarking 3 production projects, GitHub showcase publishing, resume polishing, and interview drills.",
    weeks: [
      { week: 21, title: "Project 1: Multi-Tenant E-Commerce Analytics", desc: "Covering index 100x speedup verification, cohort retention heatmap, and automated MySQL event rollups." },
      { week: 22, title: "Project 2: ACID Financial Ledger & Fraud Suite", desc: "Deadlock stress testing under 50 threads, zero-negative balances, and sliding-window AML fraud detection." },
      { week: 23, title: "Project 3: Cloud HA & ProxySQL Load Testing", desc: "Multi-threaded benchmark runner measuring QPS, p50, p95, p99 latencies under load." },
      { week: 24, title: "Portfolio Launch, Resume Bullets & Mock Drills", desc: "Packaging GitHub repos, publishing LinkedIn technical breakdown, and drilling all 50 Pro interview Q&As." }
    ]
  }
];

// ------------------------------------------------------------------------
// 2. Pre-Made Sample Queries
// ------------------------------------------------------------------------
const SAMPLE_QUERIES = [
  {
    label: "Top 3 Products by Category (Window Function)",
    sql: `-- Top 3 Best-Selling Products per Category using DENSE_RANK()
WITH product_sales AS (
    SELECT 
        p.category,
        p.name AS product_name,
        ROUND(SUM(oi.subtotal), 2) AS total_revenue
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.category, p.product_id, p.name
),
ranked_products AS (
    SELECT 
        category,
        product_name,
        total_revenue,
        DENSE_RANK() OVER (PARTITION BY category ORDER BY total_revenue DESC) as rnk
    FROM product_sales
)
SELECT category, rnk, product_name, total_revenue
FROM ranked_products
WHERE rnk <= 3
ORDER BY category, rnk;`
  },
  {
    label: "Running Total & MoM Growth (LAG)",
    sql: `-- Monthly Revenue and Month-over-Month Growth using LAG()
WITH monthly_revenue AS (
    SELECT 
        substr(order_date, 1, 7) AS sales_month,
        ROUND(SUM(total_amount), 2) AS current_rev
    FROM orders
    GROUP BY substr(order_date, 1, 7)
),
lagged_rev AS (
    SELECT 
        sales_month,
        current_rev,
        LAG(current_rev, 1) OVER (ORDER BY sales_month) AS prev_rev
    FROM monthly_revenue
)
SELECT 
    sales_month,
    current_rev,
    prev_rev,
    ROUND(current_rev - prev_rev, 2) AS dollar_growth,
    ROUND(((current_rev - prev_rev) / prev_rev) * 100, 2) AS pct_growth
FROM lagged_rev
ORDER BY sales_month;`
  },
  {
    label: "Customer RFM Quartile Scoring (NTILE)",
    sql: `-- Customer RFM Segmentation using NTILE(4) Quartiles
WITH customer_aggregates AS (
    SELECT 
        customer_id,
        COUNT(order_id) AS total_orders,
        ROUND(SUM(total_amount), 2) AS total_spent
    FROM orders
    GROUP BY customer_id
)
SELECT 
    customer_id,
    total_orders,
    total_spent,
    NTILE(4) OVER (ORDER BY total_orders ASC) AS frequency_score,
    NTILE(4) OVER (ORDER BY total_spent ASC) AS monetary_score
FROM customer_aggregates
ORDER BY total_spent DESC
LIMIT 15;`
  },
  {
    label: "Deadlock-Immune Safe Transfer Simulation",
    sql: `-- Simulating Canonical Lock Ordering (LEAST / GREATEST)
-- Locks Account min before Account max to guarantee 0 deadlocks!
SELECT 
    account_id,
    customer_id,
    current_balance,
    status
FROM accounts
WHERE account_id IN (1, 2)
ORDER BY account_id ASC;`
  }
];

// ------------------------------------------------------------------------
// 3. Hands-On Labs Data
// ------------------------------------------------------------------------
const LABS = [
  {
    id: "lab1",
    title: "Lab 01: Window Functions & Recursive CTEs",
    badge: "Analytics",
    summary: "Production-grade analytical SQL patterns covering DENSE_RANK, LAG, NTILE quartiles, and moving averages.",
    sql: `-- Lab 1 Query: 7-Day Centered Moving Sales Average
SELECT 
    order_date,
    ROUND(total_amount, 2) AS order_total,
    ROUND(AVG(total_amount) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING
    ), 2) AS moving_avg_window
FROM orders
LIMIT 20;`
  },
  {
    id: "lab2",
    title: "Lab 02: Covering Index & EXPLAIN Optimization",
    badge: "100x Speedup",
    summary: "Demonstrates eliminating clustered index bookmark lookups, reducing query cost from 14,200 to 12.4.",
    sql: `-- Lab 2 Query: Customer Order Status Lookup
-- In production, adding INDEX (customer_id, order_date, total_amount) turns this into a pure covering index!
SELECT order_id, customer_id, order_date, status, total_amount
FROM orders
WHERE customer_id = 15
ORDER BY order_date DESC;`
  },
  {
    id: "lab3",
    title: "Lab 03: Concurrency, Deadlocks & Canonical Ordering",
    badge: "ACID Concurrency",
    summary: "Reproduction of MySQL Error 1213 deadlocks and mathematical prevention using LEAST/GREATEST lock ordering.",
    sql: `-- Lab 3 Demonstration: Canonical Lock Sequence
-- Both concurrent workers lock Account 1 first, then Account 2.
SELECT account_id, current_balance, 'LOCKED' as lock_status
FROM accounts 
WHERE account_id IN (LEAST(10, 50), GREATEST(10, 50))
ORDER BY account_id ASC;`
  },
  {
    id: "lab4",
    title: "Lab 04: Big Data Table Partitioning & Pruning",
    badge: "10M+ Scale",
    summary: "RANGE & HASH partitioning mechanics and instant sub-10ms historical data purging via DROP PARTITION.",
    sql: `-- Lab 4 Demonstration: Querying Target Time Ranges
SELECT 
    substr(order_date, 1, 4) as order_year,
    COUNT(*) as orders_count,
    ROUND(SUM(total_amount), 2) as annual_revenue
FROM orders
GROUP BY substr(order_date, 1, 4)
ORDER BY order_year;`
  }
];

// ------------------------------------------------------------------------
// 4. 50 Pro Interview Flashcards Sample
// ------------------------------------------------------------------------
const FLASHCARDS = [
  {
    category: "internals",
    categoryLabel: "InnoDB Internals",
    q: "What is the Doublewrite Buffer in InnoDB and why does it exist?",
    a: "Operating systems write data in 4KB chunks, while InnoDB pages are 16KB. If a crash occurs during a write, a 'torn page' results. The Doublewrite Buffer writes the 16KB page contiguously to a reserved area of disk first before writing to the actual .ibd file, allowing flawless crash recovery if a torn page occurs."
  },
  {
    category: "internals",
    categoryLabel: "InnoDB Internals",
    q: "What is the physical sequence of events during a COMMIT in MySQL?",
    a: "1. Redo log buffer is flushed and synced to disk (satisfying Durability). 2. Binary log is synced using 2PC. 3. Undo log is marked as inactive (available for purge). 4. Memory buffer pool page is marked dirty and written to disk asynchronously later."
  },
  {
    category: "indexing",
    categoryLabel: "Indexing & Cost",
    q: "Why does a 'Covering Index' provide a 10x-100x performance leap?",
    a: "A covering index satisfies all columns in SELECT, WHERE, and ORDER BY directly from the secondary index B+ Tree leaf pages in memory. It skips the expensive secondary-to-clustered bookmark lookup (which otherwise causes random disk I/O)."
  },
  {
    category: "indexing",
    categoryLabel: "Indexing & Cost",
    q: "Explain the Leftmost Prefix Rule and how MySQL 8 Index Skip Scan modifies it.",
    a: "For index (A, B), queries on B alone normally cannot use the index. MySQL 8 Index Skip Scan allows the optimizer to skip A if A has very low cardinality (e.g. status or gender), executing sub-scans for each distinct value of A."
  },
  {
    category: "concurrency",
    categoryLabel: "MVCC & Locking",
    q: "How does InnoDB prevent Phantom Reads in Repeatable Read isolation?",
    a: "Through Next-Key Locking (the combination of a Record Lock on index entries and a Gap Lock on the space before each entry). This blocks concurrent INSERT statements from inserting rows into the locked gap."
  },
  {
    category: "concurrency",
    categoryLabel: "MVCC & Locking",
    q: "What is the canonical solution to eliminate database deadlocks?",
    a: "Deterministic Canonical Lock Ordering (Dijkstra's Resource Hierarchy). Ensure every transaction locks resources in the exact same global order (e.g., LEAST(acc1, acc2) then GREATEST(acc1, acc2)). Cycles in the lock wait graph become mathematically impossible."
  },
  {
    category: "scaling",
    categoryLabel: "Scaling & HA",
    q: "What is the core architectural restriction on MySQL Partition Keys?",
    a: "Every unique key on the table (including the PRIMARY KEY) MUST include every column used in the partitioning expression. You cannot partition by (order_date) if your primary key is solely (order_id)."
  },
  {
    category: "scaling",
    categoryLabel: "Scaling & HA",
    q: "How does ProxySQL perform intelligent read/write query splitting?",
    a: "ProxySQL evaluates SQL statements against regex rules. Statements starting with '^SELECT.*FOR UPDATE' and writes (INSERT, UPDATE) route to Hostgroup 10 (Master), while regular '^SELECT' routes to Hostgroup 20 (Read Replicas)."
  }
];

// ------------------------------------------------------------------------
// 5. In-Memory Database Initialization (SQL.js)
// ------------------------------------------------------------------------
async function initDatabase() {
  const statusBadge = document.getElementById('db-status-badge');
  try {
    statusBadge.innerText = "Loading WASM...";
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    db = new SQL.Database();
    statusBadge.innerText = "Seeding Tables...";

    // Create Schemas
    db.run(`
      CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        country TEXT,
        city TEXT,
        tier TEXT,
        created_at TEXT
      );

      CREATE TABLE products (
        product_id INTEGER PRIMARY KEY,
        sku TEXT UNIQUE,
        name TEXT,
        category TEXT,
        base_price REAL,
        cost_price REAL,
        stock_quantity INTEGER
      );

      CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT,
        status TEXT,
        payment_method TEXT,
        total_amount REAL
      );

      CREATE TABLE order_items (
        item_id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        unit_price REAL,
        subtotal REAL
      );

      CREATE TABLE accounts (
        account_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        current_balance REAL,
        status TEXT
      );
    `);

    // Seed Customers
    const countries = ["USA", "GBR", "DEU", "CAN", "FRA", "IND", "AUS", "SGP"];
    const tiers = ["STANDARD", "SILVER", "GOLD", "PLATINUM"];
    for (let i = 1; i <= 50; i++) {
      const c = countries[i % countries.length];
      const t = tiers[i % tiers.length];
      db.run(`INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, [
        i, `user.${i}@example.com`, `FirstName${i}`, `LastName${i}`, c, "Metro City", t, `2023-0${(i % 9) + 1}-15`
      ]);
    }

    // Seed Products
    const categories = ["Electronics", "Fitness", "Home & Kitchen", "Books", "Fashion"];
    for (let i = 1; i <= 25; i++) {
      const cat = categories[i % categories.length];
      const cost = (15 + (i * 7.5)).toFixed(2);
      const price = (cost * 1.5).toFixed(2);
      db.run(`INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?);`, [
        i, `SKU-${cat.substring(0,3).toUpperCase()}-${i}`, `Enterprise ${cat} Model ${i}`, cat, price, cost, 100 + i
      ]);
    }

    // Seed Orders & Items
    let itemId = 1;
    for (let ordId = 1; ordId <= 150; ordId++) {
      const custId = (ordId % 50) + 1;
      const m = (ordId % 12) + 1;
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const ordDate = `2023-${monthStr}-10 14:30:00`;
      const numItems = (ordId % 3) + 1;
      let total = 0;

      for (let k = 0; k < numItems; k++) {
        const prodId = ((ordId + k) % 25) + 1;
        const qty = (k % 2) + 1;
        const unitPrice = 45.00 + (prodId * 2);
        const sub = qty * unitPrice;
        total += sub;

        db.run(`INSERT INTO order_items VALUES (?, ?, ?, ?, ?, ?);`, [
          itemId++, ordId, prodId, qty, unitPrice, sub
        ]);
      }

      db.run(`INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?);`, [
        ordId, custId, ordDate, 'COMPLETED', 'CREDIT_CARD', total.toFixed(2)
      ]);
    }

    // Seed Accounts
    for (let accId = 1; accId <= 50; accId++) {
      db.run(`INSERT INTO accounts VALUES (?, ?, ?, ?);`, [
        accId, accId, (1500.00 + (accId * 125)).toFixed(2), 'ACTIVE'
      ]);
    }

    statusBadge.innerText = "Active (5 Tables Loaded)";
    renderSchemaExplorer();
  } catch (err) {
    statusBadge.innerText = "WASM Load Error";
    console.error("Database initialization failed:", err);
  }
}

// ------------------------------------------------------------------------
// 6. Schema Tree & Quick Sample Buttons
// ------------------------------------------------------------------------
function renderSchemaExplorer() {
  const treeContainer = document.getElementById('schema-tree');
  if (!db) return;

  const tables = [
    { name: "customers", count: 50, cols: ["customer_id (PK)", "email", "country", "tier"] },
    { name: "products", count: 25, cols: ["product_id (PK)", "sku", "category", "base_price"] },
    { name: "orders", count: 150, cols: ["order_id (PK)", "customer_id", "order_date", "total_amount"] },
    { name: "order_items", count: 250, cols: ["item_id (PK)", "order_id", "product_id", "subtotal"] },
    { name: "accounts", count: 50, cols: ["account_id (PK)", "customer_id", "current_balance"] }
  ];

  treeContainer.innerHTML = tables.map(t => `
    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-200">
        <span class="flex items-center"><i class="fa-solid fa-table text-cyan-400 mr-1.5"></i>${t.name}</span>
        <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">${t.count} rows</span>
      </div>
      <div class="text-[11px] text-slate-400 font-mono truncate">
        ${t.cols.join(", ")}
      </div>
    </div>
  `).join("");

  // Sample Query Buttons
  const buttonsContainer = document.getElementById('sample-query-buttons');
  buttonsContainer.innerHTML = SAMPLE_QUERIES.map((sq, idx) => `
    <button onclick="loadSampleQuery(${idx})" class="text-left px-2.5 py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 hover:text-cyan-400 text-xs text-slate-300 transition-colors truncate">
      <i class="fa-solid fa-angle-right text-cyan-500 mr-1.5 text-[10px]"></i>${sq.label}
    </button>
  `).join("");
}

function loadSampleQuery(idx) {
  const sq = SAMPLE_QUERIES[idx];
  if (!sq) return;
  document.getElementById('sql-editor').value = sq.sql;
  executeSQLQuery();
}

function clearEditor() {
  document.getElementById('sql-editor').value = "";
}

// ------------------------------------------------------------------------
// 7. Query Execution & Table Rendering
// ------------------------------------------------------------------------
function executeSQLQuery() {
  const editor = document.getElementById('sql-editor');
  const alertBox = document.getElementById('query-alert');
  const statsBox = document.getElementById('query-stats');
  const resultContainer = document.getElementById('result-table-container');

  const query = editor.value.trim();
  if (!query) return;

  alertBox.classList.add('hidden');
  
  if (!db) {
    alertBox.className = "p-3 rounded-lg text-xs font-mono bg-red-950/80 border border-red-800 text-red-300 block";
    alertBox.innerText = "Error: Database engine is still initializing. Please wait a second.";
    return;
  }

  const startTime = performance.now();
  try {
    const results = db.exec(query);
    const duration = (performance.now() - startTime).toFixed(2);

    if (results.length === 0) {
      statsBox.innerText = `0 rows affected (${duration} ms)`;
      resultContainer.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-sm">
          <i class="fa-solid fa-circle-check text-emerald-400 text-xl mb-2"></i>
          <div>Statement executed successfully. No tabular output returned.</div>
        </div>
      `;
      return;
    }

    const { columns, values } = results[0];
    statsBox.innerText = `${values.length} rows returned (${duration} ms)`;

    // Render HTML Table
    let tableHTML = `
      <table class="w-full text-left text-xs font-mono border-collapse">
        <thead>
          <tr class="bg-slate-800 text-cyan-400 border-b border-slate-700">
            ${columns.map(c => `<th class="p-2.5 font-semibold">${c}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
    `;

    tableHTML += values.map((row, rIdx) => `
      <tr class="${rIdx % 2 === 0 ? 'bg-slate-950/60' : 'bg-slate-900/60'} hover:bg-slate-800/50">
        ${row.map(val => `<td class="p-2.5 text-slate-200">${val !== null ? val : '<span class="text-slate-600">NULL</span>'}</td>`).join("")}
      </tr>
    `).join("");

    tableHTML += `</tbody></table>`;
    resultContainer.innerHTML = tableHTML;

  } catch (err) {
    statsBox.innerText = "Execution failed";
    alertBox.className = "p-3 rounded-lg text-xs font-mono bg-red-950/80 border border-red-800 text-red-300 block";
    alertBox.innerText = `SQL Error: ${err.message}`;
  }
}

// ------------------------------------------------------------------------
// 8. Curriculum Tracker & Rendering
// ------------------------------------------------------------------------
function renderCurriculum() {
  const container = document.getElementById('curriculum-container');
  const savedProgress = JSON.parse(localStorage.getItem('mysql_pro_progress') || '{}');

  container.innerHTML = CURRICULUM.map(m => `
    <div class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-md">
      <div class="bg-slate-800/70 p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Month ${m.month}</span>
          <h3 class="text-base font-bold text-white mt-0.5">${m.title}</h3>
        </div>
        <span class="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 font-mono">4 Weeks</span>
      </div>
      <div class="p-4 space-y-3">
        <p class="text-xs text-slate-400">${m.focus}</p>
        <div class="space-y-2.5 pt-2">
          ${m.weeks.map(w => {
            const isDone = !!savedProgress[`w_${w.week}`];
            return `
              <div class="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <input type="checkbox" id="w_${w.week}" ${isDone ? 'checked' : ''} onchange="toggleWeekProgress(${w.week})" 
                  class="mt-1 h-4 w-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-900 cursor-pointer">
                <label for="w_${w.week}" class="cursor-pointer text-xs space-y-1">
                  <div class="font-semibold text-slate-200 ${isDone ? 'line-through text-slate-500' : ''}">
                    Week ${w.week}: ${w.title}
                  </div>
                  <div class="text-[11px] text-slate-400 leading-relaxed">${w.desc}</div>
                </label>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `).join("");

  updateProgressStats();
}

function toggleWeekProgress(weekNum) {
  const savedProgress = JSON.parse(localStorage.getItem('mysql_pro_progress') || '{}');
  savedProgress[`w_${weekNum}`] = !savedProgress[`w_${weekNum}`];
  localStorage.setItem('mysql_pro_progress', JSON.stringify(savedProgress));
  renderCurriculum();
}

function updateProgressStats() {
  const savedProgress = JSON.parse(localStorage.getItem('mysql_pro_progress') || '{}');
  const completed = Object.values(savedProgress).filter(Boolean).length;
  const pct = Math.round((completed / 24) * 100);

  document.getElementById('header-progress').innerText = `${pct}%`;
  document.getElementById('tracker-status').innerText = `${completed} / 24 Weeks Completed (${pct}%)`;
  document.getElementById('tracker-bar').style.width = `${pct}%`;
}

// ------------------------------------------------------------------------
// 9. Hands-On Labs Renderer
// ------------------------------------------------------------------------
let activeLabId = "lab1";

function renderLabs() {
  const listContainer = document.getElementById('lab-list-buttons');
  listContainer.innerHTML = LABS.map(l => `
    <button onclick="selectLab('${l.id}')" class="w-full text-left p-3.5 rounded-xl border transition-all ${activeLabId === l.id ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">${l.badge}</span>
      </div>
      <div class="text-sm font-bold mt-1 text-slate-200">${l.title}</div>
      <div class="text-xs text-slate-400 mt-1 line-clamp-2">${l.summary}</div>
    </button>
  `).join("");

  const lab = LABS.find(l => l.id === activeLabId) || LABS[0];
  const detailContainer = document.getElementById('lab-detail-view');
  detailContainer.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">${lab.badge} Lab</span>
          <h3 class="text-xl font-bold text-white mt-1">${lab.title}</h3>
        </div>
        <button onclick="sendLabToPlayground('${lab.id}')" class="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md transition-all flex items-center">
          <i class="fa-solid fa-play mr-1.5"></i>Run in SQL Playground
        </button>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">${lab.summary}</p>
      <div class="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
        <pre>${lab.sql}</pre>
      </div>
    </div>
  `;
}

function selectLab(labId) {
  activeLabId = labId;
  renderLabs();
}

function sendLabToPlayground(labId) {
  const lab = LABS.find(l => l.id === labId);
  if (!lab) return;
  document.getElementById('sql-editor').value = lab.sql;
  switchTab('playground');
  executeSQLQuery();
}

// ------------------------------------------------------------------------
// 10. Portfolio Capstones & Resume Bullets
// ------------------------------------------------------------------------
const PORTFOLIO_PROJECTS = [
  {
    title: "Project 1: Multi-Tenant E-Commerce Analytics",
    scale: "5,000,000+ Orders & JSON Telemetry",
    highlight: "100x Query Speedup (1,850ms -> 18ms)",
    desc: "Engineered covering composite indexes and generated virtual columns for JSON clickstream telemetry, powering real-time cohort retention heatmaps and automated materialized rollups."
  },
  {
    title: "Project 2: Ultra-High-Throughput ACID Ledger",
    scale: "1,000,000+ Double-Entry Transactions",
    highlight: "100% Deadlock-Free Guarantee",
    desc: "Implemented atomic stored procedures with canonical lock ordering (LEAST/GREATEST), eliminating Error 1213 deadlocks under 50 concurrent threads with sliding-window AML fraud detection."
  },
  {
    title: "Project 3: Cloud HA & ProxySQL Read/Write Split",
    scale: "5,000 Client Connections Multiplexed",
    highlight: "20x Concurrency Boost, < 3s Failover",
    desc: "Configured ProxySQL layer routing SELECT FOR UPDATE to master and load-balancing reads across GTID read replicas with automated replication lag mitigation."
  }
];

const RESUME_BULLETS = [
  "Engineered covering composite indexes across 5,000,000+ records, slashing p99 query latency by 118x (from 1,420ms to 12ms) and eliminating clustered index bookmark lookups.",
  "Designed a high-throughput double-entry financial ledger supporting 1,000,000+ transactions; eliminated Error 1213 deadlocks under 50 concurrent threads via deterministic canonical lock ordering.",
  "Implemented RANGE and HASH table partitioning on a 10M+ row dataset, leveraging Partition Pruning to eliminate unneeded I/O scans and enabling sub-10ms data purging without tablespace bloat.",
  "Architected high-availability cloud database with ProxySQL read/write query splitting, connection pooling 5,000 application client connections with 75% primary CPU offload."
];

function renderPortfolio() {
  const container = document.getElementById('portfolio-cards');
  container.innerHTML = PORTFOLIO_PROJECTS.map(p => `
    <div class="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
      <div class="space-y-2">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">${p.scale}</span>
        <h4 class="text-base font-bold text-white">${p.title}</h4>
        <div class="text-xs font-semibold text-emerald-400 flex items-center">
          <i class="fa-solid fa-bolt mr-1.5"></i>${p.highlight}
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${p.desc}</p>
      </div>
    </div>
  `).join("");

  const bulletsContainer = document.getElementById('resume-bullets-list');
  bulletsContainer.innerHTML = RESUME_BULLETS.map(b => `
    <div class="flex items-start space-x-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
      <i class="fa-solid fa-circle-check text-cyan-400 mt-0.5 text-xs"></i>
      <span class="text-xs text-slate-200 leading-relaxed">${b}</span>
    </div>
  `).join("");
}

// ------------------------------------------------------------------------
// 11. Interview Flashcards
// ------------------------------------------------------------------------
let activeCategory = 'all';

function renderFlashcards() {
  const container = document.getElementById('flashcard-container');
  const filtered = activeCategory === 'all' ? FLASHCARDS : FLASHCARDS.filter(f => f.category === activeCategory);

  container.innerHTML = filtered.map((fc, idx) => `
    <div class="flashcard-card bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3 cursor-pointer" onclick="toggleFlashcardAnswer(${idx})">
      <div class="flex justify-between items-center text-xs">
        <span class="font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900">${fc.categoryLabel}</span>
        <span class="text-slate-500 font-mono text-[11px]">Click to flip</span>
      </div>
      <h4 class="text-sm font-bold text-white">${fc.q}</h4>
      <div id="fc-ans-${idx}" class="hidden pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
        ${fc.a}
      </div>
    </div>
  `).join("");
}

function toggleFlashcardAnswer(idx) {
  const ans = document.getElementById(`fc-ans-${idx}`);
  if (ans) {
    ans.classList.toggle('hidden');
  }
}

function filterFlashcards(cat) {
  activeCategory = cat;
  document.querySelectorAll('.fc-filter-btn').forEach(btn => btn.classList.remove('active', 'bg-cyan-600', 'text-white'));
  event.target.classList.add('active', 'bg-cyan-600', 'text-white');
  renderFlashcards();
}

// ------------------------------------------------------------------------
// 12. Tab Switcher
// ------------------------------------------------------------------------
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  const activeContent = document.getElementById(`view-${tabId}`);
  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) activeBtn.classList.add('active');

  if (tabId === 'playground' && !document.getElementById('sql-editor').value) {
    loadSampleQuery(0);
  }
}

// ------------------------------------------------------------------------
// 13. Keyboard Shortcuts & Boot
// ------------------------------------------------------------------------
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (currentTab === 'playground') {
      executeSQLQuery();
    }
  }
});

// App Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  renderCurriculum();
  renderLabs();
  renderPortfolio();
  renderFlashcards();
});
