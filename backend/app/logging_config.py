"""
Logging configuration with daily rotation and consistent file naming.
"""

import logging
import logging.handlers
from datetime import datetime
from pathlib import Path

from app.config import settings


class TimedRotatingFileHandlerWithConsistentNaming(
    logging.handlers.TimedRotatingFileHandler
):
    """
    Custom TimedRotatingFileHandler that ensures consistent file naming
    even for the first file creation.
    """

    def __init__(self, filename, when="midnight", interval=1, backupCount=30, **kwargs):
        # Ensure the logs directory exists
        log_dir = Path(filename).parent
        log_dir.mkdir(parents=True, exist_ok=True)

        # Generate the initial filename with today's date
        base_name = Path(filename).stem
        extension = Path(filename).suffix
        today = datetime.now().strftime("%Y-%m-%d")

        # Create the filename with today's date
        dated_filename = log_dir / f"{base_name}_{today}{extension}"

        super().__init__(str(dated_filename), when, interval, backupCount, **kwargs)

        # Store original filename pattern for rotation
        self.base_filename_pattern = str(log_dir / f"{base_name}_%Y-%m-%d{extension}")

    def doRollover(self):
        """
        Override doRollover to use consistent naming pattern.
        """
        if self.stream:
            self.stream.close()
            self.stream = None

        # Get current time for new filename
        current_time = self.rolloverAt - self.interval
        time_tuple = datetime.fromtimestamp(current_time)

        # Generate new filename with date
        new_filename = time_tuple.strftime(self.base_filename_pattern)

        # Update baseFilename to new filename
        self.baseFilename = new_filename

        # Clean up old files if backupCount is set
        if self.backupCount > 0:
            self.cleanup_old_files()

        # Calculate next rollover time
        self.rolloverAt = self.rolloverAt + self.interval

        # Open new file
        if not self.delay:
            self.stream = self._open()

    def cleanup_old_files(self):
        """
        Clean up old log files beyond backupCount.
        """
        log_dir = Path(self.baseFilename).parent
        base_name = Path(self.baseFilename).stem.split("_")[0]  # Remove date part
        extension = Path(self.baseFilename).suffix

        # Find all log files matching the pattern
        pattern = f"{base_name}_*{extension}"
        log_files = list(log_dir.glob(pattern))

        # Sort by modification time (oldest first)
        log_files.sort(key=lambda x: x.stat().st_mtime)

        # Remove files beyond backupCount
        while len(log_files) > self.backupCount:
            oldest_file = log_files.pop(0)
            try:
                oldest_file.unlink()
            except OSError:
                pass  # Ignore errors when deleting old files


def setup_logging(
    log_level: str = "INFO",
    log_dir: str = "logs",
    app_name: str = "multimind",
    max_files: int = 30,
    enable_console: bool = True,
) -> logging.Logger:
    """
    Set up logging configuration with daily rotation and consistent naming.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory to store log files
        app_name: Application name for log file naming
        max_files: Maximum number of log files to keep
        enable_console: Whether to enable console logging

    Returns:
        Configured logger instance
    """
    # Create logs directory
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)

    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper()))

    # Clear any existing handlers
    logger.handlers.clear()

    # Create formatter
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # File handler with daily rotation
    log_file = log_path / f"{app_name}.log"
    file_handler = TimedRotatingFileHandlerWithConsistentNaming(
        filename=str(log_file),
        when="midnight",
        interval=1,
        backupCount=max_files,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(getattr(logging, log_level.upper()))
    logger.addHandler(file_handler)

    # Console handler (optional)
    if enable_console:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        console_handler.setLevel(getattr(logging, log_level.upper()))
        logger.addHandler(console_handler)

    # Set up uvicorn loggers to use our configuration
    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_access_logger = logging.getLogger("uvicorn.access")
    fastapi_logger = logging.getLogger("fastapi")

    # Remove their default handlers and use ours
    for logger_name in [uvicorn_logger, uvicorn_access_logger, fastapi_logger]:
        logger_name.handlers.clear()
        logger_name.propagate = True

    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Logger instance
    """
    return logging.getLogger(name)


# Initialize logging configuration
def init_logging():
    """
    Initialize logging configuration based on application settings.
    """
    log_level = "DEBUG" if settings.debug else settings.log_level

    setup_logging(
        log_level=log_level,
        log_dir=settings.log_dir,
        app_name="multimind",
        max_files=settings.log_max_files,
        enable_console=settings.log_enable_console,
    )
