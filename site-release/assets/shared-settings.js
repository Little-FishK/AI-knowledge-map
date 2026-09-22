(function (global) {
"use strict";
global.createMapSettings = function ({language, content, manifest: I18N_MANIFEST}) {
  const settingsButton = document.getElementById("btn-settings");
  const settingsOverlay = document.getElementById("settings-overlay");
  const settingsDialog = document.getElementById("settings-dialog");
  const settingsClose = document.getElementById("settings-close");
  const settingsBackdrop = document.getElementById("settings-backdrop");
  const languageSelect = document.getElementById("settings-language-select");
  const languageStatus = document.getElementById("settings-language-status");
  const topbar = document.getElementById("topbar");
  const main = document.getElementById("main") || document.getElementById("main-content");
  let settingsReturnFocus = null;
  document.body.append(settingsOverlay);

  function renderLanguageSettings() {
    language.localize(settingsButton);
    language.localize(settingsOverlay);
    const currentLocale = language.getLocale();
    const unavailableSuffix = language.t("settings.language.unavailableSuffix");
    const fragment = document.createDocumentFragment();
    language.getSupportedLocales().forEach(locale => {
      const meta = I18N_MANIFEST.locales[locale];
      const option = document.createElement("option");
      option.value = locale;
      option.disabled = meta.selectable === false;
      option.textContent = meta.selectable === false
        ? `${meta.nativeLabel} — ${unavailableSuffix}`
        : meta.nativeLabel;
      fragment.appendChild(option);
    });
    languageSelect.replaceChildren(fragment);
    languageSelect.value = currentLocale;
  }

  languageSelect.addEventListener("change", async () => {
    const requested = languageSelect.value;
    if (!requested || requested === language.getLocale()) return;
    languageSelect.disabled = true;
    languageStatus.textContent = language.t("settings.language.changing");
    try {
      await content.ensureLocale(requested);
      await language.setLocale(requested);
      const url = new URL(window.location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.set("lang", language.getLocale());
        window.history.replaceState(null, "", url.href);
      }
      languageStatus.textContent = "";
    } catch (error) {
      languageSelect.value = language.getLocale();
      languageStatus.textContent = language.t("settings.language.error");
      console.error(error);
    } finally {
      languageSelect.disabled = false;
    }
  });

  function openSettings() {
    if (!settingsOverlay.classList.contains("hidden")) return;
    settingsReturnFocus = document.activeElement;
    settingsOverlay.classList.remove("hidden");
    settingsOverlay.setAttribute("aria-hidden", "false");
    settingsButton.setAttribute("aria-expanded", "true");
    topbar.inert = true;
    main.inert = true;
    if (document.getElementById("onboarding")) document.getElementById("onboarding").inert = true;
    settingsClose.focus();
  }

  function closeSettings() {
    if (settingsOverlay.classList.contains("hidden")) return;
    settingsOverlay.classList.add("hidden");
    settingsOverlay.setAttribute("aria-hidden", "true");
    settingsButton.setAttribute("aria-expanded", "false");
    topbar.inert = false;
    main.inert = false;
    if (document.getElementById("onboarding")) document.getElementById("onboarding").inert = false;
    if (settingsReturnFocus && typeof settingsReturnFocus.focus === "function") settingsReturnFocus.focus();
    settingsReturnFocus = null;
  }

  settingsButton.addEventListener("click", openSettings);
  settingsClose.addEventListener("click", closeSettings);
  settingsBackdrop.addEventListener("click", closeSettings);
  settingsOverlay.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSettings();
      return;
    }
    if (event.key === "Tab") {
      const focusable = settingsDialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.AI_SETTINGS = {open: openSettings, close: closeSettings};
  renderLanguageSettings();
  language.subscribe(() => { language.localize(document); renderLanguageSettings(); });
return {renderLanguageSettings};
};
})(window);
