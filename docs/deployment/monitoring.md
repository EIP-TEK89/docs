---
sidebar_position: 3
title: Monitoring
description: Documentation sur la mise en place et l'utilisation des outils de surveillance pour TrioSigno.
---

# Monitoring

Ce document détaille les solutions de monitoring mises en place pour assurer la fiabilité, la performance et la sécurité de l'application TrioSigno.

## Vue d'ensemble

Le système de monitoring de TrioSigno est conçu pour surveiller plusieurs aspects de l'application :

1. **Disponibilité** - S'assurer que l'application est accessible aux utilisateurs
2. **Performance** - Surveiller les temps de réponse et l'utilisation des ressources
3. **Erreurs** - Détecter et alerter sur les erreurs applicatives
4. **Sécurité** - Surveiller les tentatives d'accès non autorisées et les vulnérabilités
5. **Métriques métier** - Suivre les indicateurs clés de performance (KPIs)

## Architecture de Monitoring

L'architecture de monitoring est basée sur la stack ELK (Elasticsearch, Logstash, Kibana) pour la gestion des logs, et Prometheus avec Grafana pour les métriques système et applicatives.

```
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Application  │   │    Serveur    │   │  Base de      │
│  (Logs)       │──▶│    (Métriques)│──▶│  Données      │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Logstash    │   │   Prometheus  │   │   Exporteurs  │
│   (Collecte)  │   │   (Métriques) │   │   (Métriques) │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   │                   │
┌───────────────┐           │                   │
│ Elasticsearch │◀──────────┴───────────────────┘
│  (Stockage)   │
└───────┬───────┘
        │
        ▼
┌───────────────┐   ┌───────────────┐
│    Kibana     │   │    Grafana    │
│ (Visualisation)│◀─▶│ (Dashboards) │
└───────┬───────┘   └───────┬───────┘
        │                   │
        ▼                   ▼
┌───────────────────────────────────┐
│         Alerting                  │
│  (Email, Slack, PagerDuty)        │
└───────────────────────────────────┘
```

## Collecte de Logs

### Configuration de Logging

L'application TrioSigno utilise [Winston](https://github.com/winstonjs/winston) pour la journalisation structurée. Les logs sont générés au format JSON pour faciliter leur traitement.

```typescript
// Exemple de configuration du logger
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

### Collecte avec Logstash

Logstash est configuré pour collecter les logs de plusieurs sources :

- Logs d'application via Filebeat
- Logs système via Syslog
- Logs de la base de données PostgreSQL

Exemple de configuration Logstash :

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

## Métriques Système et Application

### Prometheus

Prometheus est utilisé pour collecter et stocker les métriques temporelles. Il est configuré pour scraper les endpoints de métriques exposés par :

- Les services de l'application via le middleware Prometheus
- Node Exporter pour les métriques système
- PostgreSQL Exporter pour les métriques de base de données

Exemple de configuration Prometheus :

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

### Instrumentation de l'Application

L'application TrioSigno est instrumentée pour exposer des métriques spécifiques via un endpoint `/metrics` :

```typescript
import express from "express";
import promBundle from "express-prom-bundle";

const app = express();

// Ajouter le middleware Prometheus
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

// Métriques personnalisées
const signLearningCounter = new promClient.Counter({
  name: "triosigno_sign_learning_total",
  help: "Counter for sign language learning attempts",
  labelNames: ["sign_id", "result"],
});

// Routes de l'application...

export default app;
```

## Visualisation et Dashboards

### Kibana

Kibana est utilisé pour visualiser et analyser les logs. Plusieurs dashboards sont configurés :

1. **Vue d'ensemble** - Aperçu général de l'activité et des erreurs
2. **Erreurs** - Analyse détaillée des erreurs par type et fréquence
3. **Sécurité** - Suivi des connexions et des tentatives d'accès
4. **Performance** - Analyse des temps de réponse des API

### Grafana

Grafana fournit des dashboards pour visualiser les métriques collectées par Prometheus :

1. **Infrastructure** - CPU, mémoire, disque et réseau
2. **Application** - Temps de réponse, requêtes par seconde, taux d'erreur
3. **Base de données** - Performances de PostgreSQL, connexions, requêtes
4. **Métriques métier** - Utilisateurs actifs, leçons complétées, progression

Exemple de configuration d'un dashboard Grafana :

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

Le système d'alerting est configuré pour notifier l'équipe des problèmes détectés :

### Règles d'Alerte

Les alertes sont définies pour diverses conditions :

- **Disponibilité** - Service indisponible pendant plus de 2 minutes
- **Latence** - Temps de réponse supérieur à 2 secondes pendant 5 minutes
- **Erreurs** - Taux d'erreur supérieur à 5% pendant 5 minutes
- **Ressources** - Utilisation CPU/mémoire supérieure à 80% pendant 10 minutes
- **Base de données** - Temps de requête supérieur à 1 seconde, connexions proches de la limite

Exemple de règle d'alerte Prometheus :

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

### Canaux de Notification

Les alertes sont envoyées via plusieurs canaux :

- **Email** - Pour les notifications générales
- **Slack** - Pour la communication d'équipe
- **PagerDuty** - Pour les incidents critiques nécessitant une intervention immédiate

## Monitoring des Utilisateurs (Real User Monitoring)

En plus des métriques système, TrioSigno intègre un suivi de l'expérience utilisateur :

### Analytics Frontend

Le frontend de l'application intègre des trackers pour mesurer :

- **Temps de chargement des pages**
- **Interactions utilisateur**
- **Erreurs JavaScript**
- **Performance perçue**

```typescript
// Exemple d'intégration de monitoring côté client
import { initPerformanceMonitoring } from "./monitoring";

document.addEventListener("DOMContentLoaded", () => {
  // Initialiser le monitoring de performance
  initPerformanceMonitoring();

  // Capturer les erreurs non gérées
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

### Profiling des Sessions

Le système de monitoring suit les sessions utilisateur pour identifier les problèmes d'utilisation :

- **Parcours utilisateur** - Analyse des chemins empruntés par les utilisateurs
- **Points de friction** - Identification des étapes où les utilisateurs abandonnent
- **Temps passé** - Mesure du temps passé sur chaque écran ou fonctionnalité

## Monitoring de la Base de Données

Le monitoring spécifique à PostgreSQL comprend :

### Métriques Clés

- **Connexions** - Nombre de connexions actives et maximum
- **Cache** - Taux de hit/miss du cache
- **Performances des requêtes** - Temps d'exécution et requêtes lentes
- **Verrouillage** - Détection des contentions et deadlocks
- **Utilisation de l'espace** - Croissance des tables et des index

### Requêtes Lentes

Un système de capture des requêtes lentes est configuré pour identifier les optimisations nécessaires :

```
log_min_duration_statement = 200ms
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 0
```

## Installation et Configuration

### Prérequis

- Docker et Docker Compose
- Au moins 4GB de RAM pour la stack de monitoring
- Accès réseau aux services à surveiller

### Déploiement avec Docker Compose

Le monitoring est déployé via Docker Compose :

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

## Bonnes Pratiques

1. **Rétention des données** - Définir des politiques de rétention adaptées pour éviter une croissance excessive des données
2. **Sécurisation** - Protéger l'accès aux interfaces de monitoring par authentification et TLS
3. **Gradation des alertes** - Configurer différents niveaux d'alerte selon la gravité des problèmes
4. **Documentation** - Maintenir une documentation à jour des dashboards et des métriques
5. **Tests réguliers** - Tester périodiquement le système d'alerting pour s'assurer qu'il fonctionne correctement

## Résolution des Problèmes Courants

### Elasticsearch

- **Problème** : JVM heap space errors
  - **Solution** : Ajuster les paramètres ES_JAVA_OPTS ou augmenter la RAM

### Prometheus

- **Problème** : Stockage plein
  - **Solution** : Ajuster les paramètres de rétention ou augmenter l'espace disque

### Alerting

- **Problème** : Alertes manquantes
  - **Solution** : Vérifier la configuration de l'Alertmanager et les routes de notification
