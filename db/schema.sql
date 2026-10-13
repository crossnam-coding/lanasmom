-- 라나엄마 자사몰 주문 (Cloudflare D1)
-- 개인정보 항목: 받는 분 이름·연락처·주소·이메일(선택) → 개인정보처리방침에 그대로 적는다

CREATE TABLE IF NOT EXISTS orders (
  id           TEXT PRIMARY KEY,          -- 주문번호 = 포트원 paymentId 로도 쓴다 (예: LM-20261013-AB12CD)
  access_key   TEXT NOT NULL,             -- 주문자가 완료 화면에서 자기 주문만 보게 하는 비밀값
  created_at   TEXT NOT NULL,             -- ISO8601 (UTC)
  status       TEXT NOT NULL,             -- pending → paid → preparing → shipped / cancelled / failed
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  zipcode      TEXT NOT NULL,
  address1     TEXT NOT NULL,
  address2     TEXT,
  memo         TEXT,
  items_json   TEXT NOT NULL,             -- [{slug,name,size,price,qty}] — 서버가 가격표로 계산한 값
  subtotal     INTEGER NOT NULL,
  shipping     INTEGER NOT NULL,
  total        INTEGER NOT NULL,
  paid_at      TEXT,
  pg_provider  TEXT,
  receipt_url  TEXT,
  tracking_no  TEXT,
  shipped_at   TEXT,
  admin_note   TEXT,
  agree_at     TEXT NOT NULL              -- 개인정보 수집·이용 동의 시각
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);

-- 사장님 폰(어드민 페이지)의 푸시 알림 구독
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint     TEXT PRIMARY KEY,
  p256dh       TEXT NOT NULL,
  auth         TEXT NOT NULL,
  label        TEXT,
  created_at   TEXT NOT NULL
);

-- 알림·결제 확인 기록 (조용한 실패 금지)
CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  at           TEXT NOT NULL,
  kind         TEXT NOT NULL,
  order_id     TEXT,
  detail       TEXT
);
