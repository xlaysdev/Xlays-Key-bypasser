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
  return parsed;
}

function identifyProvider(hostname) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  if (host === "lootlabs.gg" || host.endsWith(".lootlabs.gg")) {
    return {
      name: "LootLabs",
      message: "This is a LootLabs link. Its key or offer requirements are controlled by LootLabs and the link creator. This tool cannot remove or skip those requirements. You can open the original link and complete its official flow."
    };
  }
  if (host === "linkvertise.com" || host.endsWith(".linkvertise.com")) {
    return {
      name: "Linkvertise",
      message: "This is a Linkvertise link. Any required steps are controlled by the provider and publisher. Continue through the official page if you want to access the destination."
    };
  }
  if (host === "work.ink" || host.endsWith(".work.ink")) {
    return {
      name: "Work.ink",
      message: "This appears to be a Work.ink link. Required steps are managed by its provider. Open the original page to continue through its official flow."
    };
  }
  return {
    name: "Direct link",
    message: "No supported link-gate provider was detected. Check that you trust this destination before opening it."
  };
}

function showResult(url) {
  const provider = identifyProvider(url.hostname);
  const isGate = provider.name !== "Direct link";
  result.className = "result" + (isGate ? " warning" : "");
  result.replaceChildren();

  const top = document.createElement("div");
  top.className = "result-top";
  const title = document.createElement("div");
  title.className = "result-title";
  title.textContent = isGate ? "Provider detected" : "Link looks valid";
  const badge = document.createElement("span");
  badge.className = "provider";
  badge.textContent = provider.name;
  top.append(title, badge);

  const description = document.createElement("p");
  description.textContent = provider.message;
  const host = document.createElement("div");
  host.className = "host";
  host.textContent = url.hostname;

  const actions = document.createElement("div");
  actions.className = "result-actions";
  const open = document.createElement("a");
  open.className = "action-btn action-primary";
  open.href = url.href;
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  open.textContent = "Open original link ↗";

  const copy = document.createElement("button");
  copy.className = "action-btn action-secondary";
  copy.type = "button";
  copy.textContent = "Copy URL";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url.href);
      copy.textContent = "Copied ✓";
    } catch {
      copy.textContent = "Copy unavailable";
    }
    window.setTimeout(() => { copy.textContent = "Copy URL"; }, 1600);
  });

  actions.append(open, copy);
  result.append(top, description, host, actions);
  result.hidden = false;
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
    const title = document.createElement("div");
    title.className = "result-title";
    title.textContent = "Could not inspect link";
    const message = document.createElement("p");
    message.textContent = error.message;
    result.append(title, message);
    result.hidden = false;
  } finally {
    inspectButton.disabled = false;
    inspectButton.querySelector("span:first-child").textContent = "Inspect link";
  }
});