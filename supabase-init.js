(function () {
    "use strict";

    var fallbackStorageKey = "supercareDiabetesPredictionHistory";
    var config = window.SUPABASE_CONFIG || {
        url: "",
        anonKey: ""
    };

    var hasClientLibrary = typeof window.supabase !== "undefined" && typeof window.supabase.createClient === "function";
    var hasConfig = !!(config.url && config.anonKey);
    var client = hasClientLibrary && hasConfig
        ? window.supabase.createClient(config.url, config.anonKey)
        : null;

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
        readLocalPredictionHistory: readLocalPredictionHistory,
        writeLocalPredictionHistory: writeLocalPredictionHistory
    };

    warnIfMissingSetup();
})();
