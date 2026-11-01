// ============================================================
// New Horizon — Settings Page Script
// Handles: profile field persistence, appearance preferences,
// sidebar/jump-link navigation highlighting, connected-account
// toggles, and account data export.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- Element references -----------------------------------
  const body = document.body;
  const jumpLinks = document.querySelectorAll(".jump-link");        // in-page nav links (e.g. table of contents)
  const settingSections = document.querySelectorAll(".settings-card"); // each settings section/card
  const sidebarLinks = document.querySelectorAll(".sidebar-link");  // main app sidebar links
  const themeSelect = document.getElementById("theme");             // Appearance: theme dropdown
  const fontSizeSelect = document.getElementById("fontSize");       // Appearance: text size dropdown
  const reduceAnimations = document.getElementById("reduceAnimations"); // Appearance: reduce-motion toggle
  const sidebarEditBtn = document.getElementById("sidebarEditBtn"); // "Edit profile" button in sidebar
  const account = getStoredAccount() || {};

  const getInitials = (name) => name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

  // --- Storage helper -----------------------------------------
  // Saves a single setting to localStorage under a namespaced key
  // so it doesn't collide with other apps/keys on the same domain.
  const saveSetting = (key, value) => {
    localStorage.setItem(`new-horizon-${key}`, value);
  };

  // --- Load saved values into the form on page load ------------
  const applySavedValues = () => {
    const fields = document.querySelectorAll("input, select");

    // Pull previously-saved profile values (with fallbacks handled below)
    const savedUserName = localStorage.getItem("new-horizon-user-name");
    const savedFullName = localStorage.getItem("new-horizon-fullName");
    const savedEmail = localStorage.getItem("new-horizon-email");
    const savedPhone = localStorage.getItem("new-horizon-phone");
    const savedDob = localStorage.getItem("new-horizon-dob");
    const savedGender = localStorage.getItem("new-horizon-gender");
    const savedHeight = localStorage.getItem("new-horizon-height");
    const savedWeight = localStorage.getItem("new-horizon-weight");

    fields.forEach((field) => {
      if (!field.id) return; // skip fields with no id — nothing to key off of

      // Generic case: if this exact field id has a saved value, use it directly
      const savedValue = localStorage.getItem(`new-horizon-${field.id}`);

      if (savedValue !== null) {
        if (field.type === "checkbox") {
          field.checked = savedValue === "true"; // stored as string, convert back to boolean
        } else {
          field.value = savedValue;
        }
        return; // done with this field
      }

      // Fallback defaults for known profile fields when nothing is saved yet
      // (acts as placeholder/demo data on first visit)
      if (field.id === "fullName") {
        const displayName = savedFullName || savedUserName || account.username || "User";
        field.value = displayName;
      }

      if (field.id === "email") {
        field.value = savedEmail || account.email || "";
      }

      if (field.id === "phone") {
        field.value = savedPhone || "";
      }

      if (field.id === "dob") {
        field.value = savedDob || "";
      }

      if (field.id === "gender") {
        field.value = savedGender || "";
      }

      if (field.id === "height") {
        field.value = savedHeight || "";
      }

      if (field.id === "weight") {
        field.value = savedWeight || "";
      }

      // Any checkbox with no saved value defaults to unchecked
      if (field.type === "checkbox") {
        field.checked = false;
      }
    });
  };

  // --- Toast notification helper --------------------------------
  // Shows a small temporary message at the bottom/corner of the screen.
  const showToast = (message) => {
    // Remove any toast already showing so they don't stack up
    const existingToast = document.querySelector(".settings-toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "settings-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    // Add the "show" class on the next frame so the CSS transition fires
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Auto-hide after ~1.8s, then remove from DOM after the fade-out transition
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 250);
    }, 1800);
  };

  // --- Appearance settings (theme / text size / motion) ----------
  // Reads current dropdown/toggle values and applies them live to the page.
  const applyAppearance = () => {
    const theme = themeSelect?.value || "Light";
    const size = fontSizeSelect?.value || "Medium";

    if (themeSelect) saveSetting("theme", theme);
    if (fontSizeSelect) saveSetting("fontSize", size);
    if (reduceAnimations) saveSetting("reduceAnimations", String(reduceAnimations.checked));

    // Toggle a data attribute the CSS uses to switch color schemes
    const useDarkTheme = theme.toLowerCase().includes("dark")
      || (theme === "System default" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    body.dataset.theme = useDarkTheme ? "dark" : "light";

    // Map the friendly size labels to an em-based scale factor
    const sizeMap = {
      Small: "0.92",
      Medium: "1",
      Large: "1.08"
    };

    document.documentElement.style.fontSize = `${sizeMap[size] || "1"}em`;

    // Add/remove a class the CSS can use to disable/shorten animations
    body.classList.toggle("reduce-motion", reduceAnimations?.checked || false);
  };

  const updateAccountIdentity = () => {
    const name = localStorage.getItem("new-horizon-fullName")
      || localStorage.getItem("new-horizon-user-name")
      || account.username
      || "User";
    const initials = document.getElementById("profileInitials");
    const avatar = document.getElementById("topbarAvatar");

    if (initials) initials.textContent = getInitials(name);
    if (avatar) avatar.setAttribute("aria-label", `${name} profile`);
  };

  // --- Wire up form fields to persist on change -------------------
  const persistFields = () => {
    document.querySelectorAll("input, select").forEach((field) => {
      if (!field.id) return; // can't namespace a storage key without an id

      // Checkboxes: just save true/false, no extra profile-updated event needed
      if (field.type === "checkbox") {
        field.addEventListener("change", () => {
          saveSetting(field.id, String(field.checked));
          showToast("Preference saved");
        });
        return;
      }

      // Text/select fields: save the value, and for known profile fields
      // also mirror it into a plain (non-prefixed-per-field) key and
      // broadcast a 'profile-updated' event so other parts of the app
      // (e.g. the topbar avatar/name) can react without a page reload.
      field.addEventListener("change", () => {
        saveSetting(field.id, field.value);

        if (field.id === "fullName") {
          const name = field.value.trim();
          if (name) {
            localStorage.setItem("new-horizon-user-name", name);
            localStorage.setItem("new-horizon-fullName", name);
            window.dispatchEvent(new CustomEvent('profile-updated', { detail: { name } }));
          }
        }

        if (field.id === "email") {
          const email = field.value.trim();
          if (email) {
            localStorage.setItem("new-horizon-email", email);
            window.dispatchEvent(new CustomEvent('profile-updated', { detail: { email } }));
          }
        }

        if (field.id === "phone") {
          const phone = field.value.trim();
          if (phone) {
            localStorage.setItem("new-horizon-phone", phone);
            window.dispatchEvent(new CustomEvent('profile-updated', { detail: { phone } }));
          }
        }

        if (field.id === "dob") {
          const dob = field.value.trim();
          if (dob) {
            localStorage.setItem("new-horizon-dob", dob);
            window.dispatchEvent(new CustomEvent('profile-updated', { detail: { dob } }));
          }
        }

        if (field.id === "gender") {
          const gender = field.value.trim();
          if (gender) {
            localStorage.setItem("new-horizon-gender", gender);
            window.dispatchEvent(new CustomEvent('profile-updated', { detail: { gender } }));
          }
        }

        if (field.id === "height") {
          const height = field.value.trim();
          if (height) {
            localStorage.setItem("new-horizon-height", height);
            window.dispatchEvent(new CustomEvent('profile-updated', { detail: { height } }));
          }
        }

        if (field.id === "weight") {
          const weight = field.value.trim();
          if (weight) {
            localStorage.setItem("new-horizon-weight", weight);
            window.dispatchEvent(new CustomEvent('profile-updated', { detail: { weight } }));
          }
        }

        showToast("Setting updated");
      });
    });
  };

  // --- In-page settings navigation --------------------------------------
  const setActiveSection = (sectionId, updateHash = false) => {
    const targetId = `#${sectionId}`;
    jumpLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === targetId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
        link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (updateHash && window.location.hash !== targetId) {
      window.history.pushState(null, "", targetId);
    }
  };

  const scrollToSection = (sectionId, updateHash = true) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    setActiveSection(sectionId, updateHash);
    section.scrollIntoView({ behavior: body.classList.contains("reduce-motion") ? "auto" : "smooth", block: "start" });
  };

  jumpLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const sectionId = link.getAttribute("href")?.slice(1);
      if (!sectionId || !document.getElementById(sectionId)) return;

      event.preventDefault();
      scrollToSection(sectionId);
    });
  });

  window.addEventListener("popstate", () => {
    const sectionId = window.location.hash.slice(1);
    if (sectionId) scrollToSection(sectionId, false);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) setActiveSection(visibleSection.target.id);
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: "-12% 0px -48% 0px" }
    );

    settingSections.forEach((section) => observer.observe(section));
  }

  const initialSection = window.location.hash.slice(1);
  if (initialSection && document.getElementById(initialSection)) {
    requestAnimationFrame(() => scrollToSection(initialSection, false));
  } else if (settingSections[0]) {
    setActiveSection(settingSections[0].id);
  }

  // --- Highlight the current page in the main sidebar ---------------
  sidebarLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.endsWith("setting.html")) {
      link.classList.add("active");
    }
  });

  // "Edit profile" button in the sidebar sends the user to the dashboard
  sidebarEditBtn?.addEventListener("click", () => {
    window.location.href = "Horizon_dashboard.html";
  });

  // --- Support/footer links -------------------------------------------
  // Maps each link's element id to the page it should navigate to.
  const supportLinks = {
    helpCenterLink: "faq.html",
    contactSupportLink: "contact.html",
    privacyPolicyLink: "privacy-policy.html",
    termsLink: "terms&condition.html",
    aboutLink: "Horizon_home.html#about"
  };

  Object.entries(supportLinks).forEach(([id, href]) => {
    const link = document.getElementById(id);
    if (!link) return;

    link.addEventListener("click", (event) => {
      event.preventDefault(); // stop default anchor navigation
      window.location.href = href; // navigate manually (e.g. to allow future logic here)
    });
  });

  // --- Connected account buttons -------------------------------------------
  // Opens the provider's real website; OAuth completion requires a backend callback.
  const openProvider = (buttonId, label) => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const providerUrl = button.dataset.providerUrl;
    if (!providerUrl) return;

    window.open(providerUrl, "_blank", "noopener,noreferrer");
    showToast(`${label} sign-in opened in a new tab`);
  };

  const loadConnectedState = (buttonId) => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const provider = buttonId.replace("ConnectBtn", "");
    const isConnected = localStorage.getItem(`new-horizon-connected-${provider.toLowerCase()}`) === "true";

    button.dataset.connected = String(isConnected);
    button.textContent = "Open website";
    button.classList.remove("connected");
  };

  // Wire up each connect button to the toggle handler above
  [
    ["googleConnectBtn", "Google"],
    ["facebookConnectBtn", "Facebook"],
    ["youtubeConnectBtn", "YouTube"]
  ].forEach(([buttonId, label]) => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.addEventListener("click", () => openProvider(buttonId, label));
    loadConnectedState(buttonId);
  });

  // --- Change password ----------------------------------------------------
  const changePasswordModal = document.getElementById("changePasswordModal");
  const changePasswordForm = document.getElementById("changePasswordForm");
  const changePasswordMessage = document.getElementById("changePasswordMessage");
  const closePasswordModal = () => {
    if (!changePasswordModal) return;
    changePasswordModal.hidden = true;
    changePasswordForm?.reset();
    if (changePasswordMessage) changePasswordMessage.textContent = "";
  };

  document.getElementById("changePasswordBtn")?.addEventListener("click", () => {
    if (!changePasswordModal) return;
    changePasswordModal.hidden = false;
    document.getElementById("currentPassword")?.focus();
  });

  changePasswordModal?.querySelectorAll("[data-close-password-modal]").forEach((element) => {
    element.addEventListener("click", closePasswordModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && changePasswordModal && !changePasswordModal.hidden) {
      closePasswordModal();
    }
  });

  changePasswordForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById("currentPassword")?.value || "";
    const newPassword = document.getElementById("newPassword")?.value || "";
    const confirmPassword = document.getElementById("confirmPassword")?.value || "";
    const account = getStoredAccount();

    if (!account || account.password !== currentPassword) {
      changePasswordMessage.textContent = "Your current password is incorrect.";
      return;
    }

    if (newPassword.length < 6) {
      changePasswordMessage.textContent = "Password must contain at least 6 characters.";
      return;
    }

    if (newPassword !== confirmPassword) {
      changePasswordMessage.textContent = "The new passwords do not match.";
      return;
    }

    const accounts = getStoredAccounts();
    const accountIndex = accounts.findIndex((storedAccount) => storedAccount.username === account.username);
    if (accountIndex === -1) {
      changePasswordMessage.textContent = "Your account could not be found.";
      return;
    }

    accounts[accountIndex].password = newPassword;
    localStorage.setItem(AUTH_ACCOUNT_KEY, JSON.stringify(accounts));
    closePasswordModal();
    showToast("Password updated successfully");
  });

  // --- Download my data ---------------------------------------------------
  // Gathers every "new-horizon-*" key from localStorage (i.e. all settings
  // and profile info saved on this device), strips the prefix, and offers
  // it to the user as a downloadable JSON file.
  const downloadUserData = () => {
    const userData = {};

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("new-horizon-")) {
        userData[key.replace("new-horizon-", "")] = localStorage.getItem(key);
      }
    });

    // Build an in-memory JSON file and a temporary URL pointing to it
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a throwaway <a> tag to trigger the browser's download dialog
    const link = document.createElement("a");
    link.href = url;
    link.download = `new-horizon-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the temporary object URL now that the download has started
    URL.revokeObjectURL(url);

    showToast("Your data download is ready");
  };

  document.getElementById("downloadDataBtn")?.addEventListener("click", downloadUserData);

  // --- Initial setup on page load ------------------------------------------
  applySavedValues(); // fill in form fields from storage/defaults
  persistFields();    // start listening for changes to save them
  applyAppearance();  // apply the current theme/size/motion settings
  updateAccountIdentity();

  // Re-apply appearance immediately whenever these controls change
  themeSelect?.addEventListener("change", applyAppearance);
  fontSizeSelect?.addEventListener("change", applyAppearance);
  reduceAnimations?.addEventListener("change", applyAppearance);

  const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  systemTheme?.addEventListener?.("change", () => {
    if (themeSelect?.value === "System default") applyAppearance();
  });
});

// ============================================================
// Date of Birth dropdown logic
// ============================================================
(function initDobPicker() {
  const dayEl = document.getElementById("dobDay");
  const monthEl = document.getElementById("dobMonth");
  const yearEl = document.getElementById("dobYear");
  const dobHidden = document.getElementById("dob");

  if (!dayEl || !monthEl || !yearEl || !dobHidden) return;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // --- Populate the Month dropdown --------------------------
  const populateMonths = () => {
    monthEl.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Month";
    placeholder.disabled = true;
    monthEl.appendChild(placeholder);
    months.forEach((name, index) => {
      const option = document.createElement("option");
      option.value = String(index + 1).padStart(2, "0");
      option.textContent = name;
      monthEl.appendChild(option);
    });
  };

  // --- Populate the Year dropdown -----------------------------
  const populateYears = () => {
    yearEl.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Year";
    placeholder.disabled = true;
    yearEl.appendChild(placeholder);
    const currentYear = new Date().getFullYear();
    const endYear = currentYear - 100;

    for (let year = currentYear; year >= endYear; year--) {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      yearEl.appendChild(option);
    }
  };

  // --- Populate the Day dropdown -------------------------------
  const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

  const populateDays = () => {
    const selectedMonth = Number(monthEl.value) || 1;
    const selectedYear = Number(yearEl.value) || new Date().getFullYear();
    const totalDays = daysInMonth(selectedMonth, selectedYear);
    const previouslySelectedDay = dayEl.value;

    dayEl.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Day";
    placeholder.disabled = true;
    dayEl.appendChild(placeholder);

    for (let day = 1; day <= totalDays; day++) {
      const option = document.createElement("option");
      option.value = String(day).padStart(2, "0");
      option.textContent = String(day);
      dayEl.appendChild(option);
    }

    if (previouslySelectedDay && Number(previouslySelectedDay) <= totalDays) {
      dayEl.value = previouslySelectedDay;
    }
  };

  // --- Combine the three dropdowns into one date string ----------
  const updateHiddenField = () => {
    const day = Number(dayEl.value);
    const monthIndex = Number(monthEl.value) - 1;
    const year = yearEl.value;

    if (!day || monthIndex < 0 || !year) return;

    const formatted = `${day} ${months[monthIndex]} ${year}`;
    dobHidden.value = formatted;
    dobHidden.dispatchEvent(new Event("change", { bubbles: true }));
  };

  // --- Load a previously saved value (if any) and preselect it -----
  const applySavedDob = () => {
    const saved = localStorage.getItem("new-horizon-dob");
    if (!saved) {
      monthEl.value = "";
      yearEl.value = "";
      dayEl.value = "";
      return;
    }
    const parts = saved.split(" ");

    if (parts.length === 3) {
      const [savedDay, savedMonthName, savedYear] = parts;
      const monthIndex = months.findIndex(
        (m) => m.toLowerCase() === savedMonthName.toLowerCase()
      );

      if (monthIndex !== -1) {
        monthEl.value = String(monthIndex + 1).padStart(2, "0");
      }

      yearEl.value = savedYear;
      populateDays();
      dayEl.value = savedDay.padStart(2, "0");
    }

    updateHiddenField();
  };

  monthEl.addEventListener("change", () => {
    populateDays();
    updateHiddenField();
  });

  yearEl.addEventListener("change", () => {
    populateDays();
    updateHiddenField();
  });

  dayEl.addEventListener("change", updateHiddenField);

  populateMonths();
  populateYears();
  populateDays();
  applySavedDob();
})();

// ============================================================
// Edit Profile logic
// Reads/writes the same "new-horizon-*" localStorage keys used
// in setting.js, and dispatches the same 'profile-updated' event
// so any other part of the app stays in sync automatically.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const nameDisplay = document.getElementById("profileNameDisplay");
  const avatarImg = document.getElementById("profileAvatarImg");

  const editBtn = document.getElementById("editProfileBtn");
  const overlay = document.getElementById("editProfileOverlay");
  const closeBtn = document.getElementById("editProfileCloseBtn");
  const cancelBtn = document.getElementById("editProfileCancelBtn");
  const saveBtn = document.getElementById("editProfileSaveBtn");

  const nameInput = document.getElementById("editFullName");
  const emailInput = document.getElementById("editEmail");
  const avatarPreview = document.getElementById("editAvatarPreview");
  const avatarUploadInput = document.getElementById("avatarUploadInput");

  let pendingAvatarDataUrl = null; // holds a newly-picked image until Save is clicked

  // --- Load current values into the card + modal on page load -----
  const loadCurrentProfile = () => {
    const savedName =
      localStorage.getItem("new-horizon-fullName") ||
      localStorage.getItem("new-horizon-user-name") ||
      "Daniel Kim";
    const savedEmail = localStorage.getItem("new-horizon-email") || "daniel@email.com";
    const savedAvatar = localStorage.getItem("new-horizon-avatar");

    nameDisplay.textContent = savedName;
    if (savedAvatar) {
      avatarImg.src = savedAvatar;
    }
  };

  // --- Open / close the modal ----------------------------------------
  const openModal = () => {
    nameInput.value = nameDisplay.textContent.trim();
    emailInput.value = localStorage.getItem("new-horizon-email") || "daniel@email.com";
    avatarPreview.src = avatarImg.src;
    pendingAvatarDataUrl = null;

    overlay.classList.add("open");
  };

  const closeModal = () => {
    overlay.classList.remove("open");
  };

  editBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Close when clicking the dark backdrop (but not the modal box itself)
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });

  // --- Avatar file picker: preview immediately, save on "Save changes" ---
  avatarUploadInput.addEventListener("change", () => {
    const file = avatarUploadInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      pendingAvatarDataUrl = reader.result; // base64 data URL
      avatarPreview.src = pendingAvatarDataUrl;
    };
    reader.readAsDataURL(file);
  });

  // --- Save changes -----------------------------------------------------
  saveBtn.addEventListener("click", () => {
    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();

    if (!newName) {
      nameInput.focus();
      return;
    }

    // Persist name (mirrors the two keys setting.js already uses)
    localStorage.setItem("new-horizon-fullName", newName);
    localStorage.setItem("new-horizon-user-name", newName);
    nameDisplay.textContent = newName;

    // Persist email
    if (newEmail) {
      localStorage.setItem("new-horizon-email", newEmail);
    }

    // Persist avatar, if a new one was picked
    if (pendingAvatarDataUrl) {
      localStorage.setItem("new-horizon-avatar", pendingAvatarDataUrl);
      avatarImg.src = pendingAvatarDataUrl;
    }

    // Let the rest of the app (e.g. setting.html fields) know the
    // profile changed, same event setting.js already listens for.
    window.dispatchEvent(
      new CustomEvent("profile-updated", {
        detail: { name: newName, email: newEmail }
      })
    );

    closeModal();
  });

  // --- Keep this card in sync if the profile is edited elsewhere --------
  window.addEventListener("profile-updated", (event) => {
    if (event.detail?.name) {
      nameDisplay.textContent = event.detail.name;
    }
  });

  loadCurrentProfile();
});

