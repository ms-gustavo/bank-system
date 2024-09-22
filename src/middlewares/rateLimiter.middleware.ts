import rateLimit from "express-rate-limit";

export class RateLimiter {
  static loginRateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: `Muitas tentativas de login, tente novamente em 15 minutos`,
      headers: true,
    });
  }

  static transferRateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: `Muitas tentativas de transferência, tente novamente em 15 minutos`,
      headers: true,
    });
  }
}
