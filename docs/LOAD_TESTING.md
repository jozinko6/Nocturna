# Load Testing Guide

## Test Files
- `tests/load/combat.bench.ts` — Combat engine benchmarks
- `tests/load/economy.bench.ts` — Economy calculation benchmarks

## Running Load Tests
```bash
# Run all load tests
npx vitest run tests/load/

# Run combat benchmarks
npx vitest run tests/load/combat.bench.ts --reporter=verbose

# Run economy benchmarks
npx vitest run tests/load/economy.bench.ts --reporter=verbose
```

## Performance Targets
| Operation | Target | Description |
|-----------|--------|-------------|
| 1000 battles | <2s | Full combat resolution |
| 10000 stat calcs | <500ms | Training calculations |
| 100 dungeon encounters | <1s | PvE resolution |

## Baseline Metrics
Record baseline before each release:
```bash
npx vitest run tests/load/ --reporter=verbose 2>&1 | tee load-baseline-$(date +%Y%m%d).txt
```

## Scaling Considerations
- Combat is CPU-bound (pure math)
- Economy calculations are synchronous
- Consider worker threads for >1000 concurrent battles
- Database queries are main bottleneck for game actions
