chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchStrings") {
        console.log("Fetching strings for URL:", message.url);

        // Extract the site from the message URL
        const site = new URL(message.url).hostname.replace("www.", "");

        const apiUrl = "https://api.simplycodes.com/v3/promotion/mdp/codes";
        const querystring = new URLSearchParams({
            slug: site,
            filter: "top",
            showFallback: "true",
            cursor: "0",
            perPage: "20",
        });

        const headers = {
            "accept": "*/*",
            "accept-language": "es-ES,es;q=0.9,en;q=0.8,gl;q=0.7,fr;q=0.6",
            "origin": "https://simplycodes.com",
            "priority": "u=1, i",
            "referer": `https://simplycodes.com/store/${site}`,
            "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "x-source": "web",
        };

        fetch(`${apiUrl}?${querystring.toString()}`, { headers })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error fetching data: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                const promotions = data.promotions || [];
                const results = promotions
                    .filter((code) => code.healthScore >= 50 && code.code)
                    .map((code) => ({
                        title: code.title,
                        activatedOn: code.activatedOn?.split("T")[0] || "0000-00-00",
                        code: code.code,
                    }))
                    .sort((a, b) => {
                        const dateA = new Date(a.activatedOn);
                        const dateB = new Date(b.activatedOn);
                        return dateB - dateA; // Sort descending by date
                    });

                if (results.length > 0) {
                    sendResponse(results);
                } else {
                    sendResponse({ error: "No codes found for this site." });
                }
            })
            .catch((error) => {
                console.error("Error fetching codes:", error);
                sendResponse({ error: error.message });
            });

        return true; // Keep the message channel open for async sendResponse
    }

    if (message.action === "clearTabData" && sender.tab) {
        const tabId = `tab-${sender.tab.id}`;
        chrome.storage.local.remove(tabId, () => {
            console.log(`Data for tab ${tabId} cleared.`);
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open for async sendResponse
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    const tabKey = `tab-${tabId}`;
    chrome.storage.local.remove(tabKey, () => {
        console.log(`Cleared data for tab: ${tabKey}`);
    });
});