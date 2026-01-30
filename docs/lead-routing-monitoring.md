# Lead Routing Monitoring & Observability

**Version**: 1.0
**Last Updated**: 2026-01-31
**Owner**: Engineering Team

---

## Overview

This document defines monitoring, alerting, and observability for the atomic lead routing system. It covers:

- Key metrics to track
- Dashboard configurations
- Alert thresholds and escalation
- Log aggregation and analysis
- Performance SLIs/SLOs

---

## Service Level Objectives (SLOs)

### Availability SLO: 99.9% (43 minutes downtime/month)

**Definition**: Lead routing service successfully processes routing requests

**Measurement**:
```sql
SELECT
  COUNT(CASE WHEN routing_result = 'success' THEN 1 END)::FLOAT /
  NULLIF(COUNT(*), 0) * 100 AS success_rate_percent
FROM lead_routing_logs
WHERE created_at > NOW() - INTERVAL '30 days';
```

**Target**: ≥ 99.9% success rate

### Latency SLO: p95 < 2 seconds

**Definition**: 95% of routing operations complete within 2 seconds

**Measurement**:
```sql
SELECT
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY routing_duration_ms) AS p95_latency_ms
FROM (
  SELECT
    EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000 AS routing_duration_ms
  FROM leads
  WHERE routing_status = 'routed'
    AND created_at > NOW() - INTERVAL '1 hour'
) AS routing_times;
```

**Target**: p95 < 2000ms

### Retry Queue SLO: < 100 pending items

**Definition**: Retry queue does not accumulate backlog

**Measurement**:
```sql
SELECT COUNT(*) AS retry_queue_depth
FROM lead_routing_queue
WHERE next_retry_at <= NOW()
  AND processed_at IS NULL;
```

**Target**: < 100 items at any time

---

## Key Metrics

### 1. Routing Success Rate

**Query**:
```sql
SELECT
  DATE_TRUNC('hour', created_at) AS hour,
  routing_result,
  COUNT(*) AS count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('hour', created_at)) AS percentage
FROM lead_routing_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour, routing_result
ORDER BY hour DESC, routing_result;
```

**Visualization**: Stacked bar chart (success/duplicate/failed)

**Alert Threshold**: < 95% success rate for 15 minutes

### 2. Retry Queue Depth

**Query**:
```sql
SELECT
  workspace_id,
  COUNT(*) AS pending_retries,
  AVG(attempt_number) AS avg_attempts,
  MAX(attempt_number) AS max_attempts
FROM lead_routing_queue
WHERE next_retry_at <= NOW()
  AND processed_at IS NULL
GROUP BY workspace_id
ORDER BY pending_retries DESC;
```

**Visualization**: Time series line chart

**Alert Threshold**: > 100 total items OR > 50 items for single workspace

### 3. Lock Acquisition Rate

**Custom Metric** (application-level logging):
```typescript
// In LeadRoutingService.routeLead()
if (lockAcquired) {
  metrics.increment('routing.lock.acquired')
} else {
  metrics.increment('routing.lock.failed')
}
```

**Calculation**:
```
lock_success_rate = acquired / (acquired + failed) * 100
```

**Alert Threshold**: < 90% success rate (indicates high concurrency or deadlocks)

### 4. Stale Lock Count

**Query**:
```sql
SELECT
  COUNT(*) AS stale_locks,
  AVG(EXTRACT(EPOCH FROM (NOW() - routing_locked_at))) AS avg_lock_age_seconds
FROM leads
WHERE routing_status = 'routing'
  AND routing_locked_at < NOW() - INTERVAL '5 minutes';
```

**Visualization**: Gauge chart

**Alert Threshold**: > 10 stale locks

### 5. Cross-Partner Duplicate Detection Rate

**Query**:
```sql
SELECT
  DATE_TRUNC('day', created_at) AS day,
  COUNT(CASE WHEN routing_result = 'duplicate' THEN 1 END) AS duplicates_caught,
  COUNT(*) AS total_leads,
  COUNT(CASE WHEN routing_result = 'duplicate' THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100 AS duplicate_rate_percent
FROM lead_routing_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day DESC;
```

**Visualization**: Line chart with dual axis (count + percentage)

**Alert Threshold**: > 20% duplicate rate (may indicate data quality issue)

### 6. Routing Latency Distribution

**Query**:
```sql
SELECT
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms) AS p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) AS p99,
  MAX(duration_ms) AS max
FROM (
  SELECT EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000 AS duration_ms
  FROM leads
  WHERE routing_status IN ('routed', 'failed')
    AND created_at > NOW() - INTERVAL '1 hour'
) AS latencies;
```

**Visualization**: Histogram + percentile lines

**Alert Threshold**: p95 > 5000ms

### 7. Lead Expiration Rate

**Query**:
```sql
SELECT
  DATE_TRUNC('day', updated_at) AS day,
  COUNT(*) AS expired_leads
FROM leads
WHERE routing_status = 'expired'
  AND updated_at > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

**Visualization**: Bar chart

**Alert Threshold**: > 100 expired leads in 24 hours (investigate why not routing)

---

## Datadog Dashboard Configuration

### Dashboard: Lead Routing Health

**Widgets**:

1. **Routing Success Rate (Timeseries)**
   ```json
   {
     "title": "Routing Success Rate (Last 24h)",
     "viz": "timeseries",
     "requests": [{
       "q": "avg:routing.success_rate{*}",
       "display_type": "line"
     }],
     "yaxis": {
       "min": 90,
       "max": 100,
       "label": "Success Rate %"
     }
   }
   ```

2. **Retry Queue Depth (Query Value)**
   ```json
   {
     "title": "Retry Queue Depth",
     "viz": "query_value",
     "requests": [{
       "q": "sum:routing.retry_queue.depth{*}",
       "aggregator": "last",
       "conditional_formats": [{
         "comparator": ">",
         "value": 100,
         "palette": "white_on_red"
       }, {
         "comparator": ">",
         "value": 50,
         "palette": "white_on_yellow"
       }]
     }]
   }
   ```

3. **Lock Acquisition Rate (Gauge)**
   ```json
   {
     "title": "Lock Acquisition Rate",
     "viz": "query_value",
     "requests": [{
       "q": "sum:routing.lock.acquired{*} / (sum:routing.lock.acquired{*} + sum:routing.lock.failed{*}) * 100"
     }],
     "precision": 2
   }
   ```

4. **Routing Latency Percentiles (Timeseries)**
   ```json
   {
     "title": "Routing Latency (p50, p95, p99)",
     "viz": "timeseries",
     "requests": [
       {"q": "p50:routing.latency{*}", "display_type": "line"},
       {"q": "p95:routing.latency{*}", "display_type": "line"},
       {"q": "p99:routing.latency{*}", "display_type": "line"}
     ]
   }
   ```

5. **Cross-Partner Duplicates (Toplist)**
   ```json
   {
     "title": "Duplicate Leads by Workspace",
     "viz": "toplist",
     "requests": [{
       "q": "sum:routing.duplicates_caught{*} by {workspace_id}.rollup(sum, 3600)"
     }]
   }
   ```

6. **Stale Locks Alert (Query Value)**
   ```json
   {
     "title": "Stale Locks (Needs Cleanup)",
     "viz": "query_value",
     "requests": [{
       "q": "sum:routing.stale_locks{*}",
       "conditional_formats": [{
         "comparator": ">",
         "value": 10,
         "palette": "white_on_red"
       }]
     }]
   }
   ```

---

## Alert Configurations

### CRITICAL Alerts (Page Immediately)

#### 1. Routing Failure Spike

**Condition**:
```
avg(last_15m):
  sum:routing.logs.failed{*} /
  sum:routing.logs.total{*} * 100 > 10
```

**Message**:
```
🚨 CRITICAL: Lead Routing Failure Rate > 10%

Current failure rate: {{value}}%
Expected: < 5%

Impact: Leads not being routed to partners, revenue at risk

Runbook: https://docs.openinfo.com/runbooks/routing-failures
Dashboard: https://app.datadoghq.com/dashboard/routing-health

@pagerduty-oncall @slack-engineering-alerts
```

**Escalation**: Page on-call engineer immediately

#### 2. Retry Queue Backlog Critical

**Condition**:
```
avg(last_10m):sum:routing.retry_queue.depth{*} > 500
```

**Message**:
```
🚨 CRITICAL: Retry Queue Backlog > 500 Items

Current depth: {{value}} items
Expected: < 100

Impact: Leads stuck in retry loop, delayed routing

Actions:
1. Check Inngest function status: processLeadRoutingRetryQueue
2. Manually trigger retry processing
3. Investigate root cause (check logs for recurring errors)

Runbook: https://docs.openinfo.com/runbooks/retry-queue-backlog

@pagerduty-oncall @slack-engineering-alerts
```

**Escalation**: Page on-call + auto-scale Inngest workers

#### 3. Database Lock Timeout Spike

**Condition**:
```
avg(last_5m):sum:routing.lock.timeout_errors{*} > 10
```

**Message**:
```
🚨 CRITICAL: Database Lock Timeout Errors

Timeout count: {{value}}
Expected: 0

Impact: Routing operations failing, potential deadlock

Immediate actions:
1. Check database connection pool saturation
2. Review long-running queries: SELECT * FROM pg_stat_activity WHERE state = 'active' AND query LIKE '%routing%'
3. Consider emergency scaling of database

Runbook: https://docs.openinfo.com/runbooks/db-lock-timeouts

@pagerduty-oncall @slack-db-oncall
```

**Escalation**: Page database team + engineering lead

---

### WARNING Alerts (Slack Notification)

#### 4. Elevated Retry Rate

**Condition**:
```
avg(last_30m):sum:routing.retry_queue.inserts{*} > 50
```

**Message**:
```
⚠️ WARNING: High Retry Queue Insertion Rate

Rate: {{value}} retries/30min
Expected: < 20

This indicates routing is succeeding but requiring multiple attempts.

Investigate:
- Partner API latency/errors
- Network connectivity issues
- Rule matching edge cases

Dashboard: https://app.datadoghq.com/dashboard/routing-health

@slack-engineering
```

#### 5. Stale Locks Detected

**Condition**:
```
avg(last_5m):sum:routing.stale_locks{*} > 10
```

**Message**:
```
⚠️ WARNING: Stale Routing Locks Detected

Count: {{value}} locks
Expected: 0

Stale locks indicate:
- Application crashes mid-routing
- Inngest timeouts
- Database connection drops

The cleanup job should handle these, but investigate if count stays high.

@slack-engineering
```

#### 6. Cross-Partner Duplicate Rate High

**Condition**:
```
avg(last_1h):
  sum:routing.duplicates_caught{*} /
  sum:routing.leads_routed{*} * 100 > 20
```

**Message**:
```
⚠️ WARNING: High Cross-Partner Duplicate Rate

Duplicate rate: {{value}}%
Expected: < 10%

Possible causes:
- Data quality issues from source
- Dedupe hash collision (very rare)
- Partner overlap in targeting

Review duplicate leads: SELECT * FROM leads WHERE routing_result = 'duplicate' AND created_at > NOW() - INTERVAL '1 hour'

@slack-data-quality
```

---

### INFO Alerts (Daily Digest)

#### 7. Lead Expiration Summary

**Condition**: Daily at 9 AM

**Message**:
```
📊 Daily Lead Expiration Report

Leads expired (last 24h): {{value}}
90-day TTL enforced

Review if count is unusually high (> 100):
SELECT workspace_id, COUNT(*) FROM leads
WHERE routing_status = 'expired' AND updated_at > NOW() - INTERVAL '24 hours'
GROUP BY workspace_id;

@slack-ops
```

---

## Log Aggregation

### Structured Logging Format

All routing operations should log in this format:

```typescript
safeLog('routing.complete', {
  leadId: lead.id,
  sourceWorkspaceId: params.sourceWorkspaceId,
  destinationWorkspaceId: result.destinationWorkspaceId,
  matchedRuleId: result.matchedRuleId,
  durationMs: Date.now() - startTime,
  isDuplicate: result.isDuplicate,
  lockOwnerId: lockOwnerId,
  attempts: lead.routing_attempts
})
```

### Log Queries (Datadog)

#### Find All Routing Errors (Last Hour)
```
service:openinfo-api @log_level:error @event_name:routing.* -@timestamp:>now-1h
```

#### Find Slow Routing Operations (> 5s)
```
service:openinfo-api @event_name:routing.complete @duration_ms:>5000 -@timestamp:>now-1h
```

#### Find Lock Acquisition Failures
```
service:openinfo-api @event_name:routing.lock.failed -@timestamp:>now-1h
| stats count by @workspace_id
```

#### Find Cross-Partner Duplicates
```
service:openinfo-api @event_name:routing.duplicate_detected -@timestamp:>now-24h
| stats count by @duplicate_workspace_id
```

---

## Performance Benchmarks

### Baseline Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lock acquisition latency | < 50ms | p95 of `acquire_routing_lock()` execution |
| Rule evaluation latency | < 100ms | p95 of rule matching logic |
| Complete routing latency | < 200ms | p95 of `complete_routing()` execution |
| End-to-end routing latency | < 2000ms | p95 of total `routeLead()` duration |
| Retry queue processing throughput | > 100 leads/min | Items processed per minute |
| Database connection pool utilization | < 80% | Active connections / max connections |

### Load Testing Scenarios

#### Scenario 1: Normal Load (Baseline)

```bash
# 10 leads/second for 5 minutes
ab -n 3000 -c 10 -T 'application/json' -p lead_payload.json \
  https://api.openinfo.com/api/leads/route
```

**Expected**:
- 99% success rate
- p95 latency < 2000ms
- 0 lock timeouts
- Retry queue depth < 50

#### Scenario 2: Spike Load (Stress Test)

```bash
# 100 leads/second for 1 minute
ab -n 6000 -c 100 -T 'application/json' -p lead_payload.json \
  https://api.openinfo.com/api/leads/route
```

**Expected**:
- 95% success rate (some retries acceptable)
- p95 latency < 5000ms
- Retry queue depth < 200
- Auto-recovery within 5 minutes

#### Scenario 3: Sustained High Load

```bash
# 50 leads/second for 30 minutes
ab -n 90000 -c 50 -T 'application/json' -p lead_payload.json \
  https://api.openinfo.com/api/leads/route
```

**Expected**:
- 98% success rate
- p95 latency < 3000ms
- Retry queue processes without backlog
- No database connection saturation

---

## Runbook References

### Routing Failures
**URL**: `/docs/runbooks/routing-failures.md`

**Quick Actions**:
1. Check Inngest function status
2. Verify database connectivity
3. Review recent deployments
4. Check partner API health
5. Review routing rule changes

### Retry Queue Backlog
**URL**: `/docs/runbooks/retry-queue-backlog.md`

**Quick Actions**:
1. Manually trigger retry processing
2. Check Inngest worker capacity
3. Investigate recurring errors
4. Scale Inngest workers if needed
5. Pause low-priority routing if critical

### Database Lock Timeouts
**URL**: `/docs/runbooks/db-lock-timeouts.md`

**Quick Actions**:
1. Identify long-running queries
2. Check connection pool saturation
3. Review database metrics
4. Scale database if needed
5. Emergency rollback if persistent

---

## Observability Checklist

✅ **Application Metrics**
- [ ] Routing success/failure rates tracked
- [ ] Lock acquisition metrics tracked
- [ ] Latency percentiles tracked (p50, p95, p99)
- [ ] Retry queue depth tracked
- [ ] Duplicate detection rate tracked

✅ **Database Metrics**
- [ ] Connection pool utilization monitored
- [ ] Query execution times tracked
- [ ] Lock wait times tracked
- [ ] Table bloat monitored
- [ ] Index usage tracked

✅ **Infrastructure Metrics**
- [ ] CPU utilization monitored
- [ ] Memory usage monitored
- [ ] Network I/O monitored
- [ ] Disk I/O monitored

✅ **Alerts Configured**
- [ ] CRITICAL: Routing failure spike
- [ ] CRITICAL: Retry queue backlog
- [ ] CRITICAL: Database lock timeouts
- [ ] WARNING: Elevated retry rate
- [ ] WARNING: Stale locks detected
- [ ] INFO: Daily expiration summary

✅ **Dashboards Created**
- [ ] Lead Routing Health (overview)
- [ ] Routing Performance (latency)
- [ ] Retry Queue Analysis (backlog trends)
- [ ] Database Health (connections, locks)

✅ **Runbooks Written**
- [ ] Routing failures response
- [ ] Retry queue backlog response
- [ ] Database lock timeout response
- [ ] Emergency rollback procedure

---

**Next Steps**:
1. Import dashboard JSON to Datadog
2. Configure alert channels (PagerDuty, Slack)
3. Set up log aggregation pipeline
4. Schedule load testing
5. Train on-call engineers on runbooks

**Review Schedule**: Monthly or after incidents
