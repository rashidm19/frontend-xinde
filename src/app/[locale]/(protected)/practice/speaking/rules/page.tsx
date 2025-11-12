import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SpeakingRulesClient } from "../SpeakingRulesClient";

const MOBILE_UA_REGEX = /(android.*mobile|iphone|ipod|ipad|iemobile|opera mini)/i;

export default function Page() {
  const headerList = headers();
  const userAgent = headerList.get("user-agent") ?? "";
  const secChUaMobile = headerList.get("sec-ch-ua-mobile");
  const isMobileHint = typeof secChUaMobile === "string" && secChUaMobile.includes("?1");
  const isMobileUA = MOBILE_UA_REGEX.test(userAgent);

  if (isMobileHint || isMobileUA) {
    redirect("/m/practice?sheet=speaking&step=rules");
  }

  return <SpeakingRulesClient />;
}
