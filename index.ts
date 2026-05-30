import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import React from "react";

// Try to find Discord webhook module (best-effort)
const webhookModule = findByProps("create", "fetchForChannel", "update");

function createWebhook(guildId: string, channelId: string) {
    const mod = webhookModule;

    if (!mod?.create) {
        showConfirmationAlert({
            title: "Webhook Error",
            content: "Could not find webhook module"
        });
        return;
    }

    try {
        // This is the internal Discord function (Enmity-style approach)
        mod.create(guildId, channelId);

        showConfirmationAlert({
            title: "Success",
            content: "Webhook creation triggered"
        });
    } catch (e) {
        showConfirmationAlert({
            title: "Error",
            content: String(e)
        });
    }
}

export default {
    onLoad() {
        console.log("[WebhookPlugin] loaded");

        // Find Webhooks screen (BEST GUESS HOOK)
        const WebhooksScreen = findByProps("render")?.default;

        if (!WebhooksScreen) {
            console.log("Webhooks screen not found");
            return;
        }

        after("default", WebhooksScreen, (args, res) => {
            try {
                const navigation = args?.[0]?.navigation;
                const guildId = args?.[0]?.guildId;
                const channelId = args?.[0]?.channelId;

                if (!navigation) return;

                navigation.setOptions({
                    headerRight: () =>
                        React.createElement(
                            "button",
                            {
                                onPress: () => {
                                    createWebhook(guildId, channelId);
                                }
                            },
                            "+"
                        )
                });
            } catch (e) {
                console.log("[WebhookPlugin] patch error:", e);
            }
        });
    },

    onUnload() {
        console.log("[WebhookPlugin] unloaded");
    }
};