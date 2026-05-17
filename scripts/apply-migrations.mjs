import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
  const content = readFileSync(envPath, 'utf8')

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex)
    const value = trimmed.slice(separatorIndex + 1)
    process.env[key] = value
  }
}

loadEnv()

const connectionString = process.env.SUPABASE_DB_URL
if (!connectionString || connectionString.includes('PEGA_AQUI')) {
  throw new Error('SUPABASE_DB_URL no esta configurada en .env')
}

const migrationsDir = resolve(process.cwd(), 'supabase/migrations')
const migrationFiles = readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
try {
  await client.query(`
    create table if not exists public._asesormaps_migrations (
      filename text primary key,
      applied_at timestamptz default now()
    );
  `)

  const bootstrap = await client.query(`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'profiles'
    ) as has_profiles;
  `)

  if (bootstrap.rows[0]?.has_profiles) {
    await client.query(`
      insert into public._asesormaps_migrations (filename)
      values ('001_initial_schema.sql')
      on conflict do nothing;
    `)
  }

  for (const file of migrationFiles) {
    const alreadyApplied = await client.query(
      'select 1 from public._asesormaps_migrations where filename = $1',
      [file],
    )
    if (alreadyApplied.rowCount) {
      console.log(`Skipped ${file}`)
      continue
    }

    const sql = readFileSync(resolve(migrationsDir, file), 'utf8')
    await client.query('begin')
    try {
      await client.query(sql)
      await client.query(
        'insert into public._asesormaps_migrations (filename) values ($1)',
        [file],
      )
      await client.query('commit')
    } catch (error) {
      await client.query('rollback')
      throw error
    }
    console.log(`Applied ${file}`)
  }
  const { rows } = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'profiles',
        'advisor_profiles',
        'properties',
        'property_images',
        'favorites',
        'leads',
        'property_reports',
        'plans',
        'subscriptions',
        'property_views'
      )
    order by table_name;
  `)

  console.log(`Migration applied. Tables found: ${rows.map((row) => row.table_name).join(', ')}`)
} finally {
  await client.end()
}
