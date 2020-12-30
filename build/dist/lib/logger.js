const log = console;
export class Logger {
  log(msg) {
    return Logger.log(msg);
  }
  static log(msg) {
    log.info(msg);
  }
  error(msg) {
    return Logger.error(msg);
  }
  static error(msg) {
    log.error(msg);
  }
  warn(msg) {
    return Logger.warn(msg);
  }
  static warn(msg) {
    log.warn(msg);
  }
  info(msg) {
    return Logger.info(msg);
  }
  static info(msg) {
    log.info(msg);
  }
  trace() {
    return Logger.trace();
  }
  static trace() {
    log.trace();
  }
}
