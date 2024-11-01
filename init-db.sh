#!/bin/bash
set -e

# Connect to the default postgres database and create new databases if they do not exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
  SELECT 'CREATE DATABASE orders' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'orders')\gexec
  SELECT 'CREATE DATABASE inventory' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inventory')\gexec
EOSQL
