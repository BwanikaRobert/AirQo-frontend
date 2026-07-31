import { stripTrailingSlash } from "@/lib/utils";

const isProduction =
  process.env.NEXT_PUBLIC_ENV === "production" ||
  process.env.NODE_ENV === "production";
const DEFAULT_ANALYTICS_BASE_URL = isProduction 
  ? "https://analytics.airqo.net" 
  : "https://staging-analytics.airqo.net";

export const BASE_API_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL || ""
);
export const USERS_MGT_URL = `${BASE_API_URL}/users`;
export const DEVICES_MGT_URL = `${BASE_API_URL}/devices`;
export const SITES_MGT_URL = `${BASE_API_URL}/devices/sites`;
export const ANALYTICS_MGT_URL = `${BASE_API_URL}/analytics`;

export const ANALYTICS_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_ANALYTICS_URL || DEFAULT_ANALYTICS_BASE_URL
);
export const forgotPasswordUrl = `${ANALYTICS_BASE_URL}/user/forgotPwd`;
export const profileSettingsUrl = `${ANALYTICS_BASE_URL}/user/profile`;
export const signUpUrl = `${ANALYTICS_BASE_URL}/user/creation/individual/register`;

/**
 * Rewrites external service URLs to point to staging equivalents when the
 * current page is served from a staging or localhost environment.
 *
 * Mirrors `getEnvironmentAwareUrl` in Nexus (`src/shared/utils/url.ts`) and the
 * website (`src/lib/environmentAwareUrl.ts`).
 *
 * Detection: checks `window.location.hostname` for the substring "staging".
 * Deliberately not `NODE_ENV` — the staging deployment is a production Next.js
 * build, so `NODE_ENV === "production"` there too and would hand out production
 * links to staging users.
 *
 * Mapping:
 *   - analytics.airqo.net → staging-analytics.airqo.net
 *   - airqalibrate.airqo.net → staging-airqalibrate.airqo.net
 *   - vertex.airqo.net → staging-vertex.airqo.net
 *   - beacon.airqo.net → staging-beacon.airqo.net
 *   - platform.airqo.net → staging-platform.airqo.net
 *   - airqo.net / www.airqo.net → staging.airqo.net
 *
 * Outside staging (production) the original URL is returned unchanged.
 */
export const getEnvironmentAwareUrl = (baseUrl: string): string => {
  // Only run environment detection in the browser
  if (typeof window === "undefined") {
    return baseUrl;
  }

  try {
    const href = (window.location && window.location.href) || "";
    const currentHost = (window.location && window.location.hostname) || "";

    // `location.hostname` serialises IPv6 hosts *with* brackets per the URL spec,
    // so `http://[::1]:3000` reports "[::1]" — match the bracketed form.
    const isLocalhost =
      currentHost === "localhost" ||
      currentHost === "127.0.0.1" ||
      currentHost === "[::1]" ||
      currentHost === "::1" ||
      currentHost === "0.0.0.0";

    // Determine staging by hostname only (avoid matching path/query)
    let isStaging = false;
    try {
      const hrefHostname = new URL(href).hostname.toLowerCase();
      isStaging =
        hrefHostname.includes("staging") ||
        currentHost.toLowerCase().includes("staging");
    } catch {
      // If href is somehow invalid/relative, fall back to currentHost check
      isStaging = currentHost.toLowerCase().includes("staging");
    }

    // Only map to staging hosts when we're on a staging URL or running locally
    if (!isStaging && !isLocalhost) {
      return baseUrl;
    }

    const parsed = new URL(baseUrl);
    const host = parsed.hostname.toLowerCase();

    if (host === "analytics.airqo.net") {
      parsed.hostname = "staging-analytics.airqo.net";
      return parsed.toString();
    }

    if (host === "airqalibrate.airqo.net") {
      parsed.hostname = "staging-airqalibrate.airqo.net";
      return parsed.toString();
    }

    if (host === "vertex.airqo.net") {
      parsed.hostname = "staging-vertex.airqo.net";
      return parsed.toString();
    }

    if (host === "beacon.airqo.net") {
      parsed.hostname = "staging-beacon.airqo.net";
      
      return parsed.toString();
    }

    if (host === "platform.airqo.net") {
      parsed.hostname = "staging-platform.airqo.net";
      
      return parsed.toString();
    }

    if (host === "airqo.net" || host === "www.airqo.net") {
      parsed.hostname = "staging.airqo.net";
     
      return parsed.toString();
    }
    // Leave other hosts unchanged.
    return baseUrl;
  } catch {
    return baseUrl;
  }
};
