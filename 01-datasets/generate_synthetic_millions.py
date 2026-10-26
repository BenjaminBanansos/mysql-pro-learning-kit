#!/usr/bin/env python3
"""
High-Speed Real-World Synthetic Data Generator for MySQL Pro Learning Kit.
Generates 1,000,000+ realistic relational & JSON data points in seconds
using buffered streaming writes with zero third-party dependencies.
"""

import sys
import os
import csv
import random
import time
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

COUNTRIES = ["USA", "CAN", "GBR", "DEU", "FRA", "AUS", "JPN", "IND", "BRA", "SGP"]
CITIES = {
    "USA": ["New York", "San Francisco", "Austin", "Seattle", "Chicago"],
    "CAN": ["Toronto", "Vancouver", "Montreal"],
    "GBR": ["London", "Manchester", "Edinburgh"],
    "DEU": ["Berlin", "Munich", "Frankfurt"],
    "IND": ["Bangalore", "Mumbai", "Delhi", "Hyderabad"],
    "SGP": ["Singapore"]
}
CATEGORIES = ["Electronics", "Home & Kitchen", "Fitness", "Books", "Fashion", "Beauty", "Automotive", "Cloud Services"]
ORDER_STATUSES = ["COMPLETED", "COMPLETED", "COMPLETED", "PROCESSING", "SHIPPED", "CANCELLED", "REFUNDED"]
PAYMENT_METHODS = ["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "APPLE_PAY", "CRYPTO", "BANK_TRANSFER"]
EVENT_TYPES = ["page_view", "search", "add_to_cart", "remove_from_cart", "checkout_step", "promo_click", "api_call"]
DEVICE_TYPES = ["mobile_ios", "mobile_android", "desktop_chrome", "desktop_safari", "tablet"]

def random_date(start_date, end_date):
    delta = end_date - start_date
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start_date + timedelta(seconds=random_second)

def generate_customers(num_rows=100000):
    filepath = os.path.join(DATA_DIR, "customers.csv")
    print(f"[*] Generating {num_rows:,} Customers -> {filepath}...")
    start_time = time.time()
    
    start_dt = datetime(2021, 1, 1)
    end_dt = datetime(2024, 1, 1)
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["customer_id", "email", "first_name", "last_name", "country", "city", "tier", "created_at"])
        
        tiers = ["STANDARD", "SILVER", "GOLD", "PLATINUM"]
        first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Robin", "Casey", "Riley", "Benjamin", "Elena", "Liam", "Noah", "Emma"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Chen", "Patel", "Muller", "Tanaka"]
        
        batch = []
        for i in range(1, num_rows + 1):
            country = random.choice(COUNTRIES)
            city_list = CITIES.get(country, ["Capital City"])
            city = random.choice(city_list)
            created = random_date(start_dt, end_dt).strftime("%Y-%m-%d %H:%M:%S")
            tier = random.choices(tiers, weights=[60, 25, 10, 5])[0]
            
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            email = f"{fn.lower()}.{ln.lower()}.{i}@example.com"
            
            batch.append([i, email, fn, ln, country, city, tier, created])
            
            if len(batch) >= 10000:
                writer.writerows(batch)
                batch = []
        if batch:
            writer.writerows(batch)
            
    print(f"[✓] Customers generated in {time.time() - start_time:.2f}s.")

def generate_products(num_rows=10000):
    filepath = os.path.join(DATA_DIR, "products.csv")
    print(f"[*] Generating {num_rows:,} Products -> {filepath}...")
    start_time = time.time()
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["product_id", "sku", "name", "category", "base_price", "cost_price", "stock_quantity", "is_active"])
        
        batch = []
        for i in range(1, num_rows + 1):
            cat = random.choice(CATEGORIES)
            sku = f"SKU-{cat[:3].upper()}-{i:06d}"
            name = f"Enterprise {cat} Model #{i}"
            cost = round(random.uniform(5.0, 800.0), 2)
            margin = random.uniform(1.2, 2.5)
            price = round(cost * margin, 2)
            stock = random.randint(0, 5000)
            is_active = 1 if random.random() > 0.05 else 0
            
            batch.append([i, sku, name, cat, price, cost, stock, is_active])
            if len(batch) >= 5000:
                writer.writerows(batch)
                batch = []
        if batch:
            writer.writerows(batch)
    print(f"[✓] Products generated in {time.time() - start_time:.2f}s.")

def generate_orders_and_items(num_orders=1000000, num_customers=100000, num_products=10000):
    orders_path = os.path.join(DATA_DIR, "orders.csv")
    items_path = os.path.join(DATA_DIR, "order_items.csv")
    print(f"[*] Generating {num_orders:,} Orders and ~2.5M Order Items...")
    start_time = time.time()
    
    start_dt = datetime(2022, 1, 1)
    end_dt = datetime(2025, 1, 1)
    
    with open(orders_path, "w", newline="", encoding="utf-8") as f_ord, \
         open(items_path, "w", newline="", encoding="utf-8") as f_items:
        
        ord_writer = csv.writer(f_ord)
        item_writer = csv.writer(f_items)
        
        ord_writer.writerow(["order_id", "customer_id", "order_date", "status", "payment_method", "total_amount", "discount_amount", "tax_amount"])
        item_writer.writerow(["item_id", "order_id", "product_id", "quantity", "unit_price", "subtotal"])
        
        item_id_counter = 1
        ord_batch = []
        item_batch = []
        
        for ord_id in range(1, num_orders + 1):
            cust_id = random.randint(1, num_customers)
            ord_date = random_date(start_dt, end_dt).strftime("%Y-%m-%d %H:%M:%S")
            status = random.choice(ORDER_STATUSES)
            pm = random.choice(PAYMENT_METHODS)
            
            num_items = random.choices([1, 2, 3, 4, 5, 8], weights=[45, 25, 15, 8, 5, 2])[0]
            order_total = 0.0
            
            for _ in range(num_items):
                prod_id = random.randint(1, num_products)
                qty = random.choices([1, 2, 3, 5], weights=[70, 20, 7, 3])[0]
                unit_price = round(random.uniform(10.0, 500.0), 2)
                subtotal = round(qty * unit_price, 2)
                order_total += subtotal
                
                item_batch.append([item_id_counter, ord_id, prod_id, qty, unit_price, subtotal])
                item_id_counter += 1
            
            discount = round(order_total * random.choice([0.0, 0.0, 0.0, 0.05, 0.10, 0.20]), 2)
            tax = round((order_total - discount) * 0.08, 2)
            final_total = round(order_total - discount + tax, 2)
            
            ord_batch.append([ord_id, cust_id, ord_date, status, pm, final_total, discount, tax])
            
            if len(ord_batch) >= 10000:
                ord_writer.writerows(ord_batch)
                item_writer.writerows(item_batch)
                ord_batch = []
                item_batch = []
                if ord_id % 200000 == 0:
                    print(f"   -> Progress: {ord_id:,} / {num_orders:,} orders written...")
                    
        if ord_batch:
            ord_writer.writerows(ord_batch)
            item_writer.writerows(item_batch)
            
    print(f"[✓] Orders & Order Items generated in {time.time() - start_time:.2f}s ({item_id_counter - 1:,} items created).")

def generate_telemetry_events(num_events=1000000, num_customers=100000):
    filepath = os.path.join(DATA_DIR, "user_events.csv")
    print(f"[*] Generating {num_events:,} Clickstream / JSON Telemetry Events...")
    start_time = time.time()
    
    start_dt = datetime(2024, 1, 1)
    end_dt = datetime(2025, 1, 1)
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["event_id", "customer_id", "event_type", "event_time", "payload"])
        
        batch = []
        for i in range(1, num_events + 1):
            cust_id = random.randint(1, num_customers) if random.random() > 0.15 else "\\N"
            event_type = random.choice(EVENT_TYPES)
            event_time = random_date(start_dt, end_dt).strftime("%Y-%m-%d %H:%M:%S")
            device = random.choice(DEVICE_TYPES)
            session_id = f"sess_{random.randint(100000, 999999)}"
            ip_addr = f"192.168.{random.randint(1, 254)}.{random.randint(1, 254)}"
            
            # Realistic JSON payload
            if event_type == "search":
                payload = f'{{"session_id":"{session_id}","ip":"{ip_addr}","device":"{device}","query":"{random.choice(["laptop", "shoes", "wireless mouse", "headphones", "desk lamp"])}","results_count":{random.randint(0, 45)}}}'
            elif event_type == "add_to_cart":
                payload = f'{{"session_id":"{session_id}","ip":"{ip_addr}","device":"{device}","product_id":{random.randint(1, 10000)},"qty":{random.randint(1, 3)},"source":"recommendation_engine"}}'
            else:
                payload = f'{{"session_id":"{session_id}","ip":"{ip_addr}","device":"{device}","response_ms":{random.randint(12, 450)},"status_code":200}}'
                
            batch.append([i, cust_id, event_type, event_time, payload])
            
            if len(batch) >= 10000:
                writer.writerows(batch)
                batch = []
                if i % 250000 == 0:
                    print(f"   -> Progress: {i:,} / {num_events:,} events written...")
        if batch:
            writer.writerows(batch)
            
    print(f"[✓] Telemetry events generated in {time.time() - start_time:.2f}s.")

def generate_financial_ledger(num_transactions=1000000):
    filepath = os.path.join(DATA_DIR, "financial_transactions.csv")
    print(f"[*] Generating {num_transactions:,} Financial Ledger Transactions (ACID benchmark)...")
    start_time = time.time()
    
    start_dt = datetime(2023, 1, 1)
    end_dt = datetime(2025, 1, 1)
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["txn_id", "from_account_id", "to_account_id", "amount", "currency", "status", "txn_type", "is_flagged", "created_at"])
        
        types = ["TRANSFER", "PAYMENT", "WITHDRAWAL", "DEPOSIT", "FEE"]
        statuses = ["SETTLED", "PENDING", "REVERSED", "FAILED"]
        currencies = ["USD", "EUR", "GBP", "JPY", "CAD"]
        
        batch = []
        for i in range(1, num_transactions + 1):
            from_acc = random.randint(1000, 50000)
            to_acc = random.randint(1000, 50000)
            while to_acc == from_acc:
                to_acc = random.randint(1000, 50000)
                
            amount = round(random.expovariate(1/150.0) + 1.0, 2)
            cur = random.choices(currencies, weights=[70, 15, 8, 4, 3])[0]
            status = random.choices(statuses, weights=[85, 8, 4, 3])[0]
            t_type = random.choice(types)
            is_flagged = 1 if (amount > 10000 or (random.random() < 0.005)) else 0
            created_at = random_date(start_dt, end_dt).strftime("%Y-%m-%d %H:%M:%S")
            
            batch.append([i, from_acc, to_acc, amount, cur, status, t_type, is_flagged, created_at])
            
            if len(batch) >= 10000:
                writer.writerows(batch)
                batch = []
                if i % 250000 == 0:
                    print(f"   -> Progress: {i:,} / {num_transactions:,} transactions written...")
        if batch:
            writer.writerows(batch)
            
    print(f"[✓] Financial Ledger generated in {time.time() - start_time:.2f}s.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate millions of rows for MySQL Pro Kit")
    parser.add_argument("--scale", choices=["sample", "standard", "massive"], default="standard",
                        help="sample: ~100k total rows; standard: ~4.6M total rows; massive: ~10M total rows")
    args = parser.parse_args()
    
    if args.scale == "sample":
        cust_cnt, prod_cnt, ord_cnt, evt_cnt, txn_cnt = 10000, 1000, 50000, 50000, 50000
    elif args.scale == "massive":
        cust_cnt, prod_cnt, ord_cnt, evt_cnt, txn_cnt = 500000, 25000, 3000000, 3000000, 3000000
    else: # standard
        cust_cnt, prod_cnt, ord_cnt, evt_cnt, txn_cnt = 100000, 10000, 1000000, 1000000, 1000000
        
    print(f"==================================================")
    print(f"  MySQL Pro Learning Kit - Data Point Generator   ")
    print(f"  Mode: {args.scale.upper()} | Output: {DATA_DIR}")
    print(f"==================================================")
    
    total_start = time.time()
    generate_customers(cust_cnt)
    generate_products(prod_cnt)
    generate_orders_and_items(ord_cnt, cust_cnt, prod_cnt)
    generate_telemetry_events(evt_cnt, cust_cnt)
    generate_financial_ledger(txn_cnt)
    
    print(f"\n[DONE] All datasets successfully written to CSV in {time.time() - total_start:.2f}s.")
    print(f"Use '02-schemas/04_load_data_scripts.sql' to ingest into MySQL in under 60 seconds!")
