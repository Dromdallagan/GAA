import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

let _webhookRatelimit: Ratelimit | null = null;
export function getWebhookRatelimit(): Ratelimit {
  if (!_webhookRatelimit) {
    _webhookRatelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      prefix: "ratelimit:webhook",
    });
  }
  return _webhookRatelimit;
}

let _aiRatelimit: Ratelimit | null = null;
export function getAiRatelimit(): Ratelimit {
  if (!_aiRatelimit) {
    _aiRatelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      prefix: "ratelimit:ai",
    });
  }
  return _aiRatelimit;
}

// Lazy proxies for backward compatibility
export const webhookRatelimit: Ratelimit = new Proxy({} as Ratelimit, {
  get(_t, prop, recv) {
    const inst = getWebhookRatelimit();
    const val = Reflect.get(inst, prop, recv);
    return typeof val === "function" ? val.bind(inst) : val;
  },
});

export const aiRatelimit: Ratelimit = new Proxy({} as Ratelimit, {
  get(_t, prop, recv) {
    const inst = getAiRatelimit();
    const val = Reflect.get(inst, prop, recv);
    return typeof val === "function" ? val.bind(inst) : val;
  },
});
