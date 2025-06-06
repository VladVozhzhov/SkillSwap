DB_NAME="skill-swap"
DB_USER="postgres"    # change this
DB_HOST="localhost"
DB_PORT="5432"

echo "Creating database '$DB_NAME'..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $DB_NAME"

echo "Running schema setup on '$DB_NAME'..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f init.sql

echo "✅ Done."