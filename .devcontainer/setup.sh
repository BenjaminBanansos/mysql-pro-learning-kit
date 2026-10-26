#!/usr/bin/env bash
set -e

echo "=========================================================================="
echo "  🚀 Starting MySQL Pro Learning Kit Cloud Environment (Codespaces)      "
echo "=========================================================================="

cd "$(dirname "$0")/.."

# 1. Generate standard dataset files if they don't exist
if [ ! -f "01-datasets/orders.csv" ]; then
    echo "[*] Generating initial synthetic dataset records (1M+ rows)..."
    python3 01-datasets/generate_synthetic_millions.py --scale standard
fi

# 2. Boot Docker containers
echo "[*] Launching MySQL 8.0 & Adminer Web GUI containers via Docker..."
docker compose up -d

# 3. Wait for MySQL to become fully ready
echo "[*] Waiting for MySQL 8.0 engine to initialize..."
until docker exec mysql-pro-lab mysqladmin ping -h "localhost" -u root -proot_password_123 --silent > /dev/null 2>&1; do
    printf "."
    sleep 2
done
echo ""
echo "[✓] MySQL 8.0 engine is ready and accepting connections!"

# 4. Ingest all course schemas into MySQL
echo "[*] Ingesting enterprise schemas..."
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/01_ecommerce_cloud_schema.sql 2>/dev/null || true
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/02_financial_ledger_schema.sql 2>/dev/null || true
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/03_partitioned_analytics_schema.sql 2>/dev/null || true
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/05_aws_open_data_schema.sql 2>/dev/null || true
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/06_cloud_elite_datasets_schema.sql 2>/dev/null || true
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/04_load_data_scripts.sql 2>/dev/null || true

# 5. Display Welcome Banner
echo ""
echo "=========================================================================="
echo "  🎉 SUCCESS: Cloud MySQL 8.0 Lab is Fully Loaded & Ready!                "
echo "=========================================================================="
echo "  • MySQL 8.0 Server:  localhost:3306"
echo "    - Database:        analytics_db & cloud_big_data_db"
echo "    - Root Password:   root_password_123"
echo "    - Student User:    pro_student / student_secure_pass"
echo ""
echo "  • Adminer Web GUI:   Check the 'Ports' tab in VS Code and click '8080'!"
echo "    - System:          MySQL"
echo "    - Server:          mysql-pro"
echo "    - Username:        root"
echo "    - Password:        root_password_123"
echo ""
echo "  • Quick Cloud Connectors:"
echo "    python3 01-datasets/cloud_public_datasets_connector.py --list"
echo "=========================================================================="
