import { PUBLIC_MANUS_CONFIG } from "./publicConfig.generated";

// Only these public values may reach the browser. Never serialize process.env.
export function publicPlatformConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    projectId: env.MANUS_PROJECT_ID || PUBLIC_MANUS_CONFIG.projectId,
    oauthPortalUrl: env.MANUS_OAUTH_PORTAL_URL || PUBLIC_MANUS_CONFIG.oauthPortalUrl,
    apiUrl: env.MANUS_API_URL || PUBLIC_MANUS_CONFIG.apiUrl,
    apiBrowserKey: env.MANUS_API_BROWSER_KEY ?? "",
  };
}

export function publicPlatformScript(env: NodeJS.ProcessEnv = process.env): string {
  const json = JSON.stringify(publicPlatformConfig(env)).replaceAll("<", "\\u003c");
  return `window.__MANUS_CONFIG__=${json};`;
}
