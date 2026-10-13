import { json, type Env } from "../_lib/env";

/** 결제창에 필요한 공개값만. API Secret·웹훅 Secret 은 절대 여기로 내보내지 않는다 */
export const onRequestGet: PagesFunction<Env> = ({ env }) =>
  json({
    enabled: env.CHECKOUT_ENABLED === "on" && !!env.PORTONE_STORE_ID && !!env.PORTONE_CHANNEL_KEY,
    storeId: env.PORTONE_STORE_ID ?? null,
    channelKey: env.PORTONE_CHANNEL_KEY ?? null,
  });
