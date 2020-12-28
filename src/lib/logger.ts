const log = console;

export class Logger {
  log(msg) {
    return Logger.log(msg);
  }

  public static log(msg) {
    log.info(msg);
  }

  error(msg) {
    return Logger.error(msg);
  }
  public static error(msg) {
    log.error(msg);
  }

  warn(msg) {
    return Logger.warn(msg);
  }
  public static warn(msg) {
    log.warn(msg);
  }

  info(msg) {
    return Logger.info(msg);
  }
  public static info(msg) {
    log.info(msg);
  }

  trace() {
    return Logger.trace();
  }
  public static trace() {
    log.trace();
  }
}
