# Auction System

## Overview
Player-to-player marketplace using buy-now model (no bidding in v1).

## Listing
- Max 5 active listings (trust level dependent)
- Max 20 new listings per day
- Duration: 6-48 hours
- Min price: 10 gold

## Fees
- Listing fee: max(5, 1% of total)
- Sale fee: 5% of total

## Trust Levels
- Level 0: verified email, 3 days old, level 5
- Level 1: 7 days, level 10, 5 transactions
- Level 2: 30 days, level 20, 20 transactions
- Level 3: 90 days, level 30, 50 transactions

## Fraud Protection
- Self-purchase prevention
- Repeated transaction detection
- Price manipulation limits
- New account cooldown
- Wash trading detection

## Item Binding
- tradable: can be listed
- bind_on_equips: binds when equipped
- bind_on_pickup: cannot be traded
- non_tradable: quest/event items

## Technical
- Atomic transactions for all purchases
- Material ledger for material trades
- Currency ledger for gold
- Idempotency keys on all operations
