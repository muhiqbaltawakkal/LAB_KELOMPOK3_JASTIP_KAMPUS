#!/bin/sh
set -eu

create_role_and_db() {
  role="$1"
  password="$2"
  database="$3"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
    --set=role_name="$role" --set=role_password="$password" --set=db_name="$database" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'role_name', :'role_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'role_name')\gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'role_name')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db_name')\gexec
SQL
}

create_role_and_db catalog_app "$CATALOG_DB_PASSWORD" catalog_db
create_role_and_db order_app "$ORDER_DB_PASSWORD" order_db
create_role_and_db payment_app "$PAYMENT_DB_PASSWORD" payment_db
create_role_and_db tracking_app "$TRACKING_DB_PASSWORD" tracking_db
