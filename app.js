const form = document.querySelector("#link-form");
const input = document.querySelector("#link-input");
const result = document.querySelector("#result");
const inspectButton = document.querySelector("#inspect-btn");
const clearButton = document.querySelector("#clear-btn");

document.querySelector("#year").textContent = new Date().getFullYear();

input.addEventListener("input", () => {
  clearButton.hidden = input.value.length === 0;
  if (!result.hidden) result.hidden = true;
});
clearButton.addEventListener("click", () => {
  input.value = "";
  clearButton.hidden = true;
  input.focus();
  result.hidden = true;
});

function parseUrl(raw) {
  const value = raw.trim();
  if (!value) throw new Error("Paste a link first.");
  if (/^(javascript|data|file|vbscript):/i.test(value)) {
    throw new Error("That URL scheme is not supported. Use a normal HTTPS or HTTP link.");
  }
  let parsed;
  try {
    parsed = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : "https://" + value);
  } catch {
    throw new Error("That does not look like a valid URL. Check it and try again.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS links are supported.");
  }
  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    throw new Error("Enter a complete domain, like example.com.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("Links containing embedded usernames or passwords are blocked.");
  }
  return parsed;
}

function identifyProvider(hostname) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  if (host === "lootlabs.gg" || host.endsWith(".lootlabs.gg")) {
    return {
      name: "LootLabs",
      message: "This is a LootLabs link. Its key or offer requirements are controlled by LootLabs and the link creator. This tool cannot remove or skip those requirements. Continue through the official page."
    };
  }
  if (host === "linkvertise.com" || host.endsWith(".linkvertise.com")) {
    return {
      name: "Linkvertise",
      message: "This is a Linkvertise link. Any required steps are controlled by the provider and publisher. Continue through the official page."
    };
  }
  if (host === "work.ink" || host.endsWith(".work.ink")) {
    return {
      name: "Work.ink",
      message: "This appears to be a Work.ink link. Required steps are managed by its provider. Continue through the official page."
    };
  }
  return {
    name: "Direct link",
    message: "No supported link-gate provider was detected. Check that you trust this destination before opening it."
  };
}

const redirectKeys = new Set(["url", "u", "target", "dest", "destination", "redirect", "redirect_url", "redirect_uri", "link", "continue", "to"]);
function findEmbeddedDestination(startUrl) {
  let current = new URL(startUrl.href);
  for (let depth = 0; depth < 4; depth++) {
    let next = null;
    for (const [key, value] of current.searchParams.entries()) {
      if (!redirectKeys.has(key.toLowerCase())) continue;
      try {
        const candidate = new URL(value, current.origin);
        if (["http:", "https:"].includes(candidate.protocol) && candidate.hostname && candidate.href !== current.href) {
          next = candidate;
          break;
        }
      } catch {}
    }
    if (!next) break;
    current = next;
  }
  return current.href === startUrl.href ? null : current;
}

const trackingKeys = new Set(["fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid", "igshid", "ref_src"]);
function removeTrackingParameters(source) {
  const cleaned = new URL(source.href);
  let removed = 0;
  for (const key of [...cleaned.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || trackingKeys.has(key.toLowerCase())) {
      cleaned.searchParams.delete(key);
      removed++;
    }
  }
  return { url: cleaned, removed };
}

function getWarnings(url) {
  const warnings = [];
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:") warnings.push("This link uses HTTP, not encrypted HTTPS.");
  if (host.startsWith("xn--") || host.split(".").some(part => part.startsWith("xn--"))) {
    warnings.push("The domain contains internationalized/punycode text. Double-check the spelling.");
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) warnings.push("This link points directly to an IP address.");
  if (host.split(".").length > 5) warnings.push("This URL has an unusually deep subdomain.");
  return warnings;
}

function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function makeButton(label, className, action) {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

async function copyText(value, button, originalLabel) {
  try {
    await navigator.clipboard.writeText(value);
    button.textContent = "Copied ✓";
  } catch {
    button.textContent = "Copy unavailable";
  }
  window.setTimeout(() => { button.textContent = originalLabel; }, 1600);
}

function showResult(url) {
  const provider = identifyProvider(url.hostname);
  const isGate = provider.name !== "Direct link";
  const embedded = findEmbeddedDestination(url);
  const cleaned = removeTrackingParameters(url);
  const warnings = getWarnings(url);

  result.className = "result" + (isGate || warnings.length ? " warning" : "");
  result.replaceChildren();

  const top = document.createElement("div");
  top.className = "result-top";
  addText(top, "div", "result-title", isGate ? "Provider detected" : "Link inspected");
  addText(top, "span", "provider", provider.name);
  result.append(top);
  addText(result, "p", "", provider.message);
  addText(result, "div", "host", url.hostname);

  if (embedded) {
    addText(result, "div", "analysis-label", "EMBEDDED DESTINATION FOUND");
    addText(result, "div", "host destination-url", embedded.href);
    addText(result, "p", "small-note", "This destination was read from a URL parameter. It has not been opened or verified.");
    const destinationActions = document.createElement("div");
    destinationActions.className = "result-actions";
    const openDestination = document.createElement("a");
    openDestination.className = "action-btn action-primary";
    openDestination.href = embedded.href;
    openDestination.target = "_blank";
    openDestination.rel = "noopener noreferrer";
    openDestination.textContent = "Open extracted destination ↗";
    destinationActions.append(openDestination);
    destinationActions.append(makeButton("Copy destination", "action-btn action-secondary", event => copyText(embedded.href, event.currentTarget, "Copy destination")));
    result.append(destinationActions);
  }

  if (cleaned.removed > 0) {
    addText(result, "div", "analysis-label", "TRACKING PARAMETERS");
    addText(result, "p", "small-note", cleaned.removed + " common tracking parameter(s) found. The cleaned URL keeps the page path and other parameters.");
    const cleanActions = document.createElement("div");
    cleanActions.className = "result-actions";
    cleanActions.append(makeButton("Copy clean URL", "action-btn action-secondary", event => copyText(cleaned.url.href, event.currentTarget, "Copy clean URL")));
    result.append(cleanActions);
  }

  if (warnings.length) {
    addText(result, "div", "analysis-label", "CHECK BEFORE OPENING");
    const list = document.createElement("ul");
    list.className = "warning-list";
    warnings.forEach(warning => addText(list, "li", "", warning));
    result.append(list);
  }

  const actions = document.createElement("div");
  actions.className = "result-actions";
  const open = document.createElement("a");
  open.className = "action-btn action-primary";
  open.href = url.href;
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  open.textContent = "Open original link ↗";
  actions.append(open);
  actions.append(makeButton("Copy URL", "action-btn action-secondary", event => copyText(url.href, event.currentTarget, "Copy URL")));
  result.append(actions);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  inspectButton.disabled = true;
  inspectButton.querySelector("span:first-child").textContent = "Checking…";
  try {
    showResult(parseUrl(input.value));
  } catch (error) {
    result.className = "result warning";
    result.replaceChildren();
    addText(result, "div", "result-title", "Could not inspect link");
    addText(result, "p", "", error.message);
    result.hidden = false;
  } finally {
    inspectButton.disabled = false;
    inspectButton.querySelector("span:first-child").textContent = "Inspect link";
  }
  result.hidden = false;
});
