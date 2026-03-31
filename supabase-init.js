(function () {
    "use strict";

    var fallbackStorageKey = "sugarcareDiabetesPredictionHistory";
    var config = window.SUPABASE_CONFIG || {
        url: "",
        anonKey: ""
    };

    var hasClientLibrary = typeof window.supabase !== "undefined" && typeof window.supabase.createClient === "function";
    var hasConfig = !!(config.url && config.anonKey);
    var client = hasClientLibrary && hasConfig
        ? window.supabase.createClient(config.url, config.anonKey)
        : null;
    var profilePromptPromise = null;
    var profilePromptModalId = "sugarcare-profile-completion-modal";

    function warnIfMissingSetup() {
        if (!hasClientLibrary) {
            console.warn("Supabase library is not loaded on this page.");
            return;
        }

        if (!hasConfig) {
            console.warn("Supabase config missing. Set window.SUPABASE_CONFIG with url and anonKey before loading supabase-init.js.");
        }
    }

    async function getUser() {
        if (!client) {
            return null;
        }

        var result = await client.auth.getUser();
        return result && result.data ? result.data.user : null;
    }

    async function requireAuth(redirectPath) {
        var user = await getUser();
        if (!user) {
            window.location.href = redirectPath || "index.html";
            return null;
        }

        return user;
    }

    async function signInWithGoogle(redirectPath) {
        if (!client) {
            alert("Supabase is not configured yet. Add your project URL and anon key.");
            return;
        }

        var redirectTarget = redirectPath || window.location.href;
        var options = {
            provider: "google",
            options: {
                redirectTo: redirectTarget
            }
        };

        var response = await client.auth.signInWithOAuth(options);
        if (response.error) {
            alert("Login failed: " + response.error.message);
        }
    }

    async function signOut(redirectPath) {
        if (!client) {
            return;
        }

        await client.auth.signOut();
        if (redirectPath) {
            window.location.href = redirectPath;
        }
    }

    function onAuthStateChange(handler) {
        if (!client || typeof handler !== "function") {
            return function () { };
        }

        var result = client.auth.onAuthStateChange(function (event, session) {
            handler(event, session);
        });

        return function () {
            if (result && result.data && result.data.subscription) {
                result.data.subscription.unsubscribe();
            }
        };
    }

    async function ensureUserProfile(user, extraProfileData) {
        if (!client || !user) {
            return;
        }

        var payload = {
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata && user.user_metadata.full_name ? user.user_metadata.full_name : null,
            gender: user.user_metadata && user.user_metadata.gender ? user.user_metadata.gender : null,
            updated_at: new Date().toISOString()
        };

        if (extraProfileData && typeof extraProfileData === "object") {
            Object.keys(extraProfileData).forEach(function (key) {
                payload[key] = extraProfileData[key];
            });
        }

        var result = await client.from("user_profiles").upsert(payload, { onConflict: "id" });
        if (result.error) {
            console.warn("Profile upsert failed:", result.error.message);
        }
    }

    function isProfileComplete(profile) {
        if (!profile) {
            return false;
        }

        var hasAge = Number(profile.age) > 0;
        var hasHeight = Number(profile.height_cm) > 0;
        var hasWeight = Number(profile.weight_kg) > 0;
        var hasGender = typeof profile.gender === "string" && profile.gender.trim().length > 0;

        return hasAge && hasHeight && hasWeight && hasGender;
    }

    async function getUserProfile(userId) {
        if (!client || !userId) {
            return null;
        }

        var result = await client
            .from("user_profiles")
            .select("id, age, height_cm, weight_kg, gender")
            .eq("id", userId)
            .maybeSingle();

        if (result.error) {
            console.warn("Failed to fetch user profile:", result.error.message);
            return null;
        }

        return result.data || null;
    }

    function showProfilePrompt(profileData) {
        return new Promise(function (resolve) {
            var existingModal = document.getElementById(profilePromptModalId);
            if (existingModal) {
                existingModal.remove();
            }

            var overlay = document.createElement("div");
            overlay.id = profilePromptModalId;
            overlay.style.position = "fixed";
            overlay.style.inset = "0";
            overlay.style.zIndex = "9999";
            overlay.style.background = "rgba(23, 29, 27, 0.45)";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.style.padding = "16px";

            var card = document.createElement("form");
            card.style.width = "100%";
            card.style.maxWidth = "460px";
            card.style.background = "#ffffff";
            card.style.border = "1px solid rgba(191, 201, 195, 0.7)";
            card.style.borderRadius = "24px";
            card.style.boxShadow = "0 20px 64px rgba(27, 67, 50, 0.2)";
            card.style.padding = "24px";
            card.style.fontFamily = "Inter, sans-serif";

            card.innerHTML = ""
                + "<h2 style='margin:0;color:#1B4332;font-size:1.4rem;font-weight:800;font-family:Manrope, sans-serif;'>Complete your health profile</h2>"
                + "<p style='margin:10px 0 18px;color:#404945;font-size:0.95rem;line-height:1.5;'>Please add your details once to personalize your dashboard.</p>"
                + "<label style='display:block;margin-bottom:12px;color:#171d1b;font-size:0.9rem;font-weight:600;'>Age"
                + "<input id='sugarcare-profile-age' type='number' min='1' max='120' required style='margin-top:6px;width:100%;border:1px solid #bfc9c3;border-radius:12px;padding:10px 12px;font-size:0.95rem;' value='" + (profileData && profileData.age ? Number(profileData.age) : "") + "' />"
                + "</label>"
                + "<label style='display:block;margin-bottom:12px;color:#171d1b;font-size:0.9rem;font-weight:600;'>Height (cm)"
                + "<input id='sugarcare-profile-height' type='number' min='50' max='260' required style='margin-top:6px;width:100%;border:1px solid #bfc9c3;border-radius:12px;padding:10px 12px;font-size:0.95rem;' value='" + (profileData && profileData.height_cm ? Number(profileData.height_cm) : "") + "' />"
                + "</label>"
                + "<label style='display:block;margin-bottom:12px;color:#171d1b;font-size:0.9rem;font-weight:600;'>Weight (kg)"
                + "<input id='sugarcare-profile-weight' type='number' min='20' max='400' required style='margin-top:6px;width:100%;border:1px solid #bfc9c3;border-radius:12px;padding:10px 12px;font-size:0.95rem;' value='" + (profileData && profileData.weight_kg ? Number(profileData.weight_kg) : "") + "' />"
                + "</label>"
                + "<label style='display:block;margin-bottom:14px;color:#171d1b;font-size:0.9rem;font-weight:600;'>Gender"
                + "<select id='sugarcare-profile-gender' required style='margin-top:6px;width:100%;border:1px solid #bfc9c3;border-radius:12px;padding:10px 12px;font-size:0.95rem;background:#fff;'>"
                + "<option value=''>Select gender</option>"
                + "<option value='Female'>Female</option>"
                + "<option value='Male'>Male</option>"
                + "<option value='Non-binary'>Non-binary</option>"
                + "<option value='Prefer not to say'>Prefer not to say</option>"
                + "</select>"
                + "</label>"
                + "<p id='sugarcare-profile-error' style='display:none;margin:0 0 12px;color:#b91c1c;font-size:0.84rem;'></p>"
                + "<button type='submit' style='width:100%;border:none;border-radius:999px;padding:12px 14px;background:#1B4332;color:#fff;font-weight:700;cursor:pointer;'>Save and continue</button>";

            overlay.appendChild(card);
            document.body.appendChild(overlay);

            var genderField = card.querySelector("#sugarcare-profile-gender");
            if (profileData && profileData.gender) {
                genderField.value = profileData.gender;
            }

            card.addEventListener("submit", function (event) {
                event.preventDefault();
                var age = Number(card.querySelector("#sugarcare-profile-age").value);
                var heightCm = Number(card.querySelector("#sugarcare-profile-height").value);
                var weightKg = Number(card.querySelector("#sugarcare-profile-weight").value);
                var gender = String(card.querySelector("#sugarcare-profile-gender").value || "").trim();
                var errorEl = card.querySelector("#sugarcare-profile-error");

                if (!(age > 0 && heightCm > 0 && weightKg > 0 && gender)) {
                    errorEl.style.display = "block";
                    errorEl.textContent = "Please enter valid values for all fields.";
                    return;
                }

                overlay.remove();
                resolve({
                    age: age,
                    height_cm: heightCm,
                    weight_kg: weightKg,
                    gender: gender
                });
            });
        });
    }

    async function promptForMissingProfile(user) {
        if (!client || !user) {
            return;
        }

        if (profilePromptPromise) {
            return profilePromptPromise;
        }

        profilePromptPromise = (async function () {
            await ensureUserProfile(user);
            var profile = await getUserProfile(user.id);

            if (isProfileComplete(profile)) {
                return;
            }

            var values = await showProfilePrompt(profile || {});
            await ensureUserProfile(user, values);
        })().finally(function () {
            profilePromptPromise = null;
        });

        return profilePromptPromise;
    }

    function readLocalPredictionHistory() {
        try {
            return JSON.parse(localStorage.getItem(fallbackStorageKey) || "[]");
        } catch (error) {
            console.warn("Failed to parse local prediction history:", error);
            return [];
        }
    }

    function writeLocalPredictionHistory(records) {
        localStorage.setItem(fallbackStorageKey, JSON.stringify(records));
    }

    window.supabaseClient = client;
    window.supabaseAuth = {
        isConfigured: function () {
            return !!client;
        },
        getUser: getUser,
        requireAuth: requireAuth,
        signInWithGoogle: signInWithGoogle,
        signOut: signOut,
        onAuthStateChange: onAuthStateChange,
        ensureUserProfile: ensureUserProfile,
        promptForMissingProfile: promptForMissingProfile,
        readLocalPredictionHistory: readLocalPredictionHistory,
        writeLocalPredictionHistory: writeLocalPredictionHistory
    };

    warnIfMissingSetup();
})();
