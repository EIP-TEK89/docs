---
sidebar_position: 3
title: Monitoring
description: Documentation on setting up and using monitoring tools for TrioSigno.
---

# Monitoring

This document details the monitoring solutions implemented to ensure the reliability, performance, and security of the TrioSigno application.

## Overview

TrioSigno's monitoring system is designed to monitor several aspects of the application:

1. **Availability** - Ensuring the application is accessible to users
2. **Performance** - Monitoring response times and resource usage
3. **Errors** - Detecting and alerting on application errors
4. **Security** - Monitoring unauthorized access attempts and vulnerabilities
5. **Business Metrics** - Tracking key performance indicators (KPIs)

## Monitoring Architecture

The monitoring architecture is based on the ELK stack (Elasticsearch, Logstash, Kibana) for log management, and Prometheus with Grafana for system and application metrics.

```
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Application  │   │    Server     │   │  Database     │
│  (Logs)       │──▶│    (Metrics)  │──▶│               │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Logstash    │   │   Prometheus  │   │   Exporters   │
│   (Collection)│   │   (Metrics)   │   │   (Metrics)   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   │                   │
┌───────────────┐           │                   │
│ Elasticsearch │◀──────────┴───────────────────┘
│   (Storage)   │
└───────┬───────┘
        │
        ▼
┌───────────────┐   ┌───────────────┐
│    Kibana     │   │    Grafana    │
│(Visualization)│◀─▶│  (Dashboards) │
└───────┬───────┘   └───────┬───────┘
        │                   │
        ▼                   ▼
┌───────────────────────────────────┐
│           Alerting                │
│    (Email, Slack, PagerDuty)      │
└───────────────────────────────────┘
```

## Log Collection

### Logging Configuration

The TrioSigno application uses [Winston](https://github.com/winstonjs/winston) for structured logging. Logs are generated in JSON format to facilitate their processing.

```typescript
// Example logger configuration
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "triosigno-app" },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

export default logger;
```

### Collection with Logstash

Logstash is configured to collect logs from multiple sources:

- Application logs via Filebeat
- System logs via Syslog
- PostgreSQL database logs

Example Logstash configuration:

```
input {
  beats {
    port => 5044
  }
  syslog {
    port => 5140
  }
}

filter {
  if [type] == "app" {
    json {
      source => "message"
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "triosigno-logs-%{+YYYY.MM.dd}"
  }
}
```

## System and Application Metrics

### Prometheus

Prometheus is used to collect and store time-series metrics. It is configured to scrape metrics endpoints exposed by:

- Application services via the Prometheus middleware
- Node Exporter for system metrics
- PostgreSQL Exporter for database metrics

Example Prometheus configuration:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "triosigno-app"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["app:3000"]

  - job_name: "node"
    static_configs:
      - targets: ["node-exporter:9100"]

  - job_name: "postgres"
    static_configs:
      - targets: ["postgres-exporter:9187"]
```

### Application Instrumentation

The TrioSigno application is instrumented to expose specific metrics via a `/metrics` endpoint:

```typescript
import express from "express";
import promBundle from "express-prom-bundle";

const app = express();

// Add Prometheus middleware
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { app: "triosigno" },
  promClient: {
    collectDefaultMetrics: {},
  },
});

app.use(metricsMiddleware);

// Custom metrics
const signLearningCounter = new promClient.Counter({
  name: "triosigno_sign_learning_total",
  help: "Counter for sign language learning attempts",
  labelNames: ["sign_id", "result"],
});

// Application routes...

export default app;
```

## Visualization and Dashboards

### Kibana

Kibana is used to visualize and analyze logs. Several dashboards are configured:

1. **Overview** - General view of activity and errors
2. **Errors** - Detailed analysis of errors by type and frequency
3. **Security** - Tracking of logins and access attempts
4. **Performance** - Analysis of API response times

### Grafana

Grafana provides dashboards to visualize metrics collected by Prometheus:

1. **Infrastructure** - CPU, memory, disk, and network
2. **Application** - Response times, requests per second, error rate
3. **Database** - PostgreSQL performance, connections, queries
4. **Business Metrics** - Active users, completed lessons, progression

Example Grafana dashboard configuration:

```json
{
  "dashboard": {
    "id": null,
    "title": "TrioSigno Application Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(http_request_duration_seconds_count{app=\"triosigno\"}[5m])) by (method, route)",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time (95th percentile)",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app=\"triosigno\"}[5m])) by (le, route))",
            "legendFormat": "{{route}}"
          }
        ]
      }
    ],
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "5m"
  }
}
```

## Alerting

The alerting system is configured to notify the team of detected issues:

### Alert Rules

Alerts are defined for various conditions:

- **Availability** - Service unavailable for more than 2 minutes
- **Latency** - Response time greater than 2 seconds for 5 minutes
- **Errors** - Error rate greater than 5% for 5 minutes
- **Resources** - CPU/memory usage greater than 80% for 10 minutes
- **Database** - Query time greater than 1 second, connections near limit

Example Prometheus alert rule:

```yaml
groups:
  - name: TrioSigno
    rules:
      - alert: HighErrorRate
        expr: sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m])) / sum(rate(http_request_duration_seconds_count[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 5% for the last 5 minutes"

      - alert: ServiceDown
        expr: up{job="triosigno-app"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "The TrioSigno application has been down for more than 2 minutes"
```

### Notification Channels

Alerts are sent via multiple channels:

- **Email** - For general notifications
- **Slack** - For team communication
- **PagerDuty** - For critical incidents requiring immediate intervention

## User Monitoring (Real User Monitoring)

In addition to system metrics, TrioSigno integrates user experience tracking:

### Frontend Analytics

The application frontend integrates trackers to measure:

- **Page load times**
- **User interactions**
- **JavaScript errors**
- **Perceived performance**

```typescript
// Example client-side monitoring integration
import { initPerformanceMonitoring } from "./monitoring";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize performance monitoring
  initPerformanceMonitoring();

  // Capture unhandled errors
  window.addEventListener("error", (event) => {
    reportErrorToBackend({
      message: event.message,
      source: event.filename,
      line: event.lineno,
      stack: event.error?.stack,
    });
  });
});
```

### Session Profiling

The monitoring system tracks user sessions to identify usage issues:

- **User Journey** - Analysis of paths taken by users
- **Friction Points** - Identification of steps where users drop off
- **Time Spent** - Measurement of time spent on each screen or feature

## Database Monitoring

PostgreSQL-specific monitoring includes:

### Key Metrics

- **Connections** - Number of active and maximum connections
- **Cache** - Cache hit/miss rate
- **Query Performance** - Execution time and slow queries
- **Locking** - Detection of contentions and deadlocks
- **Space Usage** - Growth of tables and indexes

### Slow Queries

A slow query capture system is configured to identify necessary optimizations:

```
log_min_duration_statement = 200ms
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 0
```

## Installation and Configuration

### Prerequisites

- Docker and Docker Compose
- At least 4GB of RAM for the monitoring stack
- Network access to services to monitor

### Deployment with Docker Compose

Monitoring is deployed via Docker Compose:

```yaml
version: "3.8"

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
      - "5140:5140"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch

  prometheus:
    image: prom/prometheus:v2.30.0
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.console.libraries=/etc/prometheus/console_libraries"
      - "--web.console.templates=/etc/prometheus/consoles"

  grafana:
    image: grafana/grafana:8.1.2
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    ports:
      - "3000:3000"
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:v1.2.2
    ports:
      - "9100:9100"

  postgres-exporter:
    image: wrouesnel/postgres_exporter:v0.9.0
    environment:
      DATA_SOURCE_NAME: "postgresql://postgres:postgres@postgres:5432/triosigno?sslmode=disable"
    ports:
      - "9187:9187"
    depends_on:
      - postgres

volumes:
  elasticsearch-data:
  prometheus-data:
  grafana-data:
```

## Best Practices

1. **Data Retention** - Define appropriate retention policies to avoid excessive data growth
2. **Security** - Protect access to monitoring interfaces with authentication and TLS
3. **Alert Gradation** - Configure different alert levels according to the severity of problems
4. **Documentation** - Maintain up-to-date documentation of dashboards and metrics
5. **Regular Testing** - Periodically test the alerting system to ensure it works correctly

## Troubleshooting Common Issues

### Elasticsearch

- **Issue**: JVM heap space errors
  - **Solution**: Adjust ES_JAVA_OPTS parameters or increase RAM

### Prometheus

- **Issue**: Storage full
  - **Solution**: Adjust retention parameters or increase disk space

### Alerting

- **Issue**: Missing alerts
  - **Solution**: Check Alertmanager configuration and notification routes
