# Infrastructure Configuration

This directory contains infrastructure and monitoring configurations for the Civic Voice Platform.

## Contents

### Monitoring

Complete monitoring stack with Prometheus, Grafana, and exporters.

**To deploy monitoring:**

```bash
cd infrastructure/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

**Access:**
- Grafana: http://localhost:3001 (admin/changeme)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

**Monitored metrics:**
- Server CPU, memory, disk, network
- Container resource usage
- PostgreSQL database stats
- Redis cache performance
- API response times (if configured)

### Cloud Deployments

Coming soon:
- AWS CloudFormation templates
- Google Cloud Deployment Manager
- Terraform configurations
- Kubernetes manifests

## Monitoring Setup

### 1. Configure Alertmanager

Edit `monitoring/alertmanager.yml` with your notification channels:

```yaml
receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'your-email@example.com'
        # ... configure SMTP
```

### 2. Configure Exporters

Update database and Redis passwords in `monitoring/docker-compose.monitoring.yml`:

```yaml
postgres-exporter:
  environment:
    DATA_SOURCE_NAME: "postgresql://user:password@postgres:5432/db"

redis-exporter:
  environment:
    REDIS_PASSWORD: "your-redis-password"
```

### 3. Start Monitoring

```bash
docker-compose -f monitoring/docker-compose.monitoring.yml up -d
```

### 4. Import Grafana Dashboards

1. Open Grafana at http://localhost:3001
2. Login with admin/changeme
3. Import these community dashboards:
   - Node Exporter Full: Dashboard ID 1860
   - Docker Container & Host Metrics: Dashboard ID 10619
   - PostgreSQL Database: Dashboard ID 9628
   - Redis Dashboard: Dashboard ID 11835

## Cloud Provider Deployments

### AWS

Use AWS Elastic Beanstalk, ECS, or EKS:

```bash
# Coming soon
aws cloudformation deploy --template-file aws/cloudformation.yml
```

### Google Cloud

Use Google Cloud Run or GKE:

```bash
# Coming soon
gcloud deployment-manager deployments create civicvoice --config gcp/deployment.yaml
```

### DigitalOcean

Use App Platform or Kubernetes:

```bash
# Coming soon
doctl apps create --spec digitalocean/app.yaml
```

## Security Considerations

- Change default Grafana password immediately
- Use strong passwords for all services
- Configure firewall rules (monitoring ports should not be public)
- Enable HTTPS for Grafana
- Restrict Prometheus access
- Use secrets management for sensitive configs

## Best Practices

1. **Regular Backups**: Monitor backup success/failure
2. **Alert Tuning**: Start with basic alerts, tune over time
3. **Dashboard Organization**: Create focused dashboards per service
4. **Retention Policies**: Configure appropriate metric retention
5. **Resource Limits**: Set resource limits for monitoring services

## Troubleshooting

### Prometheus not scraping

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check exporter health
curl http://localhost:9100/metrics  # Node exporter
curl http://localhost:9187/metrics  # Postgres exporter
```

### Grafana datasource connection failed

```bash
# Verify Prometheus is accessible
docker exec -it civicvoice-grafana curl http://prometheus:9090/-/healthy
```

### Alerts not sending

```bash
# Check Alertmanager logs
docker logs civicvoice-alertmanager

# Test alert
curl -X POST http://localhost:9093/api/v1/alerts
```

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node Exporter](https://github.com/prometheus/node_exporter)
- [Postgres Exporter](https://github.com/prometheus-community/postgres_exporter)
- [Redis Exporter](https://github.com/oliver006/redis_exporter)
