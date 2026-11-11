#!/usr/bin/env python3
"""
Utility script to inspect the HeartCare SQL Database.
Usage:
    ./.venv/bin/python scripts/view_db.py
"""

import os
import sqlite3
import sys

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "heartcare.db")

def main():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database file not found at: {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("=" * 70)
    print(" 🏥 HEARTCARE SQL DATABASE STATUS & STORED DATA")
    print("=" * 70)
    print(f"📍 Database file: {DB_PATH}")
    print(f"📦 File size: {os.path.getsize(DB_PATH):,} bytes\n")

    # Table counts
    for table in ["patients", "encounters", "predictions"]:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  • Table '{table}': {count} total records")

    print("\n" + "-" * 70)
    print(" 👤 REGISTERED PATIENTS")
    print("-" * 70)
    cursor.execute("""
        SELECT p.patient_id, p.name, COUNT(e.id) as visit_count, p.created_at
        FROM patients p
        LEFT JOIN encounters e ON e.patient_id = p.id
        GROUP BY p.id
        ORDER BY p.updated_at DESC;
    """)
    rows = cursor.fetchall()
    if not rows:
        print("  (No patients recorded yet)")
    else:
        print(f"  {'PATIENT ID':<15} {'NAME':<22} {'VISITS':<8} {'CREATED AT'}")
        print("  " + "-" * 66)
        for r in rows:
            print(f"  {r[0]:<15} {r[1]:<22} {r[2]:<8} {str(r[3])[:19]}")

    print("\n" + "-" * 70)
    print(" 🔬 LATEST CLINICAL PREDICTIONS & ENCOUNTERS (Top 10)")
    print("-" * 70)
    cursor.execute("""
        SELECT 
            p.patient_id,
            p.name,
            e.trestbps,
            e.chol,
            e.thalach,
            pr.predicted_class,
            pr.probability_percentage,
            pr.risk_tier,
            e.recorded_at
        FROM predictions pr
        JOIN encounters e ON e.id = pr.encounter_id
        JOIN patients p ON p.id = e.patient_id
        ORDER BY e.recorded_at DESC
        LIMIT 10;
    """)
    enc_rows = cursor.fetchall()
    if not enc_rows:
        print("  (No encounters recorded yet)")
    else:
        print(f"  {'PATIENT ID':<12} {'NAME':<16} {'BP':<6} {'CHOL':<6} {'MAX HR':<8} {'CLASS':<7} {'PROB %':<8} {'TIER':<13}")
        print("  " + "-" * 82)
        for r in enc_rows:
            pred_badge = "Class 1" if r[5] == 1 else "Class 0"
            prob_str = f"{r[6]:.1f}%" if r[6] is not None else "N/A"
            print(f"  {r[0]:<12} {r[1]:<16} {int(r[2]):<6} {int(r[3]):<6} {int(r[4]):<8} {pred_badge:<7} {prob_str:<8} {r[7]:<13}")

    print("\n" + "=" * 70 + "\n")
    conn.close()

if __name__ == "__main__":
    main()
