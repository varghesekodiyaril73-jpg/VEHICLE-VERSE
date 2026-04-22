-- Run this in your PgAdmin Query Tool connected to 'db_project' database

-- 1. Grant usage on public schema
GRANT ALL ON SCHEMA public TO db_project;

-- 2. Grant create privilege on database
GRANT ALL PRIVILEGES ON DATABASE db_project TO db_project;

-- 3. Make db_project owner of public schema (optional but recommended for this setup)
ALTER SCHEMA public OWNER TO db_project;
