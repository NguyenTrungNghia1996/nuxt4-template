import { parse, type ParsedDomain } from "psl";

export type DomainInfo = {
  hostname: string;
  domain: string;
  subdomain: string;
};

const IPv4_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPv6_REGEX = /^(?:[a-fA-F0-9]{0,4}:){2,7}[a-fA-F0-9]{0,4}$/;

const isIPv4 = (value: string): boolean => {
  if (!IPv4_REGEX.test(value)) return false;
  return value.split(".").every(part => {
    const num = Number(part);
    return num >= 0 && num <= 255;
  });
};

const isIPv6 = (value: string): boolean => value.includes(":") && IPv6_REGEX.test(value);

const isIpAddress = (value: string): boolean => isIPv4(value) || isIPv6(value);

const normalizeHostname = (value?: string | null): string => {
  if (!value) return "";
  const raw = String(value).split(",")[0]?.trim() || "";
  const withoutProtocol = raw.replace(/^[a-z]+:\/\//i, "");
  const host = withoutProtocol.split("/")[0]?.split(":")[0] || "";
  return host.replace(/\.$/, "").toLowerCase();
};

export const parseDomainFromHostname = (value?: string | null): DomainInfo => {
  const hostname = normalizeHostname(value);
  if (!hostname) {
    return { hostname: "", domain: "", subdomain: "" };
  }

  if (hostname === "localhost" || isIpAddress(hostname)) {
    return { hostname, domain: hostname, subdomain: "" };
  }

  const parsed = parse(hostname);

  if ("error" in parsed || !parsed.domain) {
    return { hostname, domain: hostname, subdomain: "" };
  }

  const { domain, subdomain } = parsed as ParsedDomain;
  return {
    hostname,
    domain: domain || hostname,
    subdomain: subdomain || "",
  };
};

export const getRequestDomainInfo = (): DomainInfo => {
  const url = useRequestURL();
  const headers = useRequestHeaders() || {};
  const rawHost = headers["host"] || url.host || "";
  return parseDomainFromHostname(rawHost);
};
