# Multimind Backend Logging Configuration

## Overview

The Multimind backend implements a comprehensive logging system with daily rotation and consistent file naming. This ensures proper log management and easy troubleshooting in production environments.

## Features

- **Daily Log Rotation**: Logs rotate automatically at midnight
- **Consistent File Naming**: Files are named with the format `multimind_YYYY-MM-DD.log` from the first creation
- **Configurable Retention**: Keeps a configurable number of log files (default: 30 days)
- **Multiple Log Levels**: Support for DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Console and File Output**: Logs to both console and file simultaneously
- **Structured Logging**: Consistent format with timestamps, logger names, and levels

## Configuration

### Environment Variables

You can configure logging behavior using environment variables or the application configuration:

```bash
# Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL=INFO

# Directory for log files
LOG_DIR=logs

# Maximum number of log files to keep
LOG_MAX_FILES=30

# Enable/disable console logging
LOG_ENABLE_CONSOLE=true
```

### Configuration in Settings

The logging configuration is integrated with the application settings in `app/config.py`:

```python
class Settings(BaseSettings):
    # Logging configuration
    log_level: str = "INFO"
    log_dir: str = "logs"
    log_max_files: int = 30
    log_enable_console: bool = True
```

## File Naming Convention

Log files follow a consistent naming pattern:

- **Format**: `multimind_YYYY-MM-DD.log`
- **Examples**:
  - `multimind_2024-01-15.log`
  - `multimind_2024-01-16.log`
  - `multimind_2024-01-17.log`

This naming convention ensures:
- Easy identification of log files by date
- Consistent naming even for the first file created
- Proper chronological ordering
- Simple log file management and archival

## Log Format

Each log entry includes:

```
YYYY-MM-DD HH:MM:SS - logger_name - LEVEL - message
```

Example:
```
2024-01-15 14:30:25 - app.api.v1.health - INFO - Health check endpoint accessed
2024-01-15 14:30:26 - app.api.v1.chat - INFO - Received message for agent: agent_1
2024-01-15 14:30:26 - app.api.v1.chat - INFO - Message processed successfully for session: session_123
```

## Usage in Code

### Getting a Logger

```python
from app.logging_config import get_logger

logger = get_logger(__name__)
```

### Logging Messages

```python
# Different log levels
logger.debug("Detailed debugging information")
logger.info("General information about application flow")
logger.warning("Warning about potential issues")
logger.error("Error that occurred but application continues")
logger.critical("Critical error that may cause application to stop")
```

### Example in API Endpoints

```python
from fastapi import APIRouter
from app.logging_config import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.get("/health")
def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "ok"}

@router.post("/messages")
async def send_message(message: MessageCreate):
    logger.info(f"Received message for agent: {message.agent_id}")
    try:
        result = await process_message(message)
        logger.info(f"Message processed successfully for session: {message.session_id}")
        return result
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise
```

## Docker Configuration

The Docker setup includes proper log directory mounting:

```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./logs:/app/logs  # Mount logs directory
```

```dockerfile
# Dockerfile
RUN mkdir -p /app/logs  # Ensure logs directory exists
```

## Log Rotation Details

- **Rotation Time**: Midnight (00:00) local time
- **Rotation Interval**: Daily (24 hours)
- **File Retention**: 30 files by default (configurable)
- **Naming**: Consistent date-based naming from first creation

## Production Considerations

### Log Monitoring

In production, consider:
- Setting up log monitoring and alerting
- Configuring log aggregation systems (ELK stack, Splunk, etc.)
- Regular log file archival and backup
- Monitoring disk space usage

### Performance

- Log level should be set to INFO or WARNING in production
- DEBUG level should only be used for troubleshooting
- Consider log file size limits for high-traffic applications

### Security

- Ensure log files have appropriate permissions
- Avoid logging sensitive information (passwords, tokens, etc.)
- Consider log encryption for sensitive environments

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure the application has write permissions to the log directory
2. **Disk Space**: Monitor disk usage, especially with high log volumes
3. **Log Level**: Verify the correct log level is set for your environment

### Checking Log Configuration

```python
# Check current logging configuration
import logging
print(f"Root logger level: {logging.getLogger().level}")
print(f"Handlers: {logging.getLogger().handlers}")
```

### Manual Log Rotation Testing

The logging system can be tested by changing the system time or by manually triggering rotation in development environments.

## Integration with Monitoring

The logging system is designed to integrate well with:
- Application Performance Monitoring (APM) tools
- Log aggregation systems
- Health monitoring dashboards
- Alerting systems

## Best Practices

1. **Use Appropriate Log Levels**:
   - DEBUG: Detailed diagnostic information
   - INFO: General application flow
   - WARNING: Potential issues
   - ERROR: Errors that don't stop the application
   - CRITICAL: Serious errors that may stop the application

2. **Include Context**: Add relevant context to log messages (user IDs, session IDs, etc.)

3. **Avoid Logging Sensitive Data**: Never log passwords, API keys, or personal information

4. **Use Structured Logging**: Include relevant metadata in log messages

5. **Monitor Log Volume**: Be mindful of log volume in high-traffic scenarios
