class Logger {
  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  error(message) {
    console.error(`[${new Date().toISOString()}] ❌ ${message}`);
  }

  warn(message) {
    console.warn(`[${new Date().toISOString()}] ⚠️  ${message}`);
  }

  info(message) {
    console.info(`[${new Date().toISOString()}] ℹ️  ${message}`);
  }

  success(message) {
    console.log(`[${new Date().toISOString()}] ✓ ${message}`);
  }
}

module.exports = new Logger();
