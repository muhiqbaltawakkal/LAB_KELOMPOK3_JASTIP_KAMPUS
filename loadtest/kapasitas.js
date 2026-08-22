import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    kapasitas: { executor: "constant-arrival-rate", rate: 50, timeUnit: "1s", duration: "30s", preAllocatedVUs: 50, maxVUs: 200 },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.95"],
  },
};

const base = __ENV.BASE_URL || "http://localhost:8080";
const token = __ENV.TOKEN;
const sessionId = Number(__ENV.SESSION_ID || 1);

export default function () {
  const key = `k6-${__VU}-${__ITER}`;
  const response = http.post(`${base}/v1/titipan`, JSON.stringify({ sesiId: sessionId, barangId: 1, qty: 1 }), {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Idempotency-Key": key },
  });
  check(response, { "created or capacity rejected": (r) => [200, 201, 409, 429].includes(r.status) });
}
