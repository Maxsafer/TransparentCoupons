window.addEventListener("beforeunload", () => {
    chrome.runtime.sendMessage({ action: "clearTabData" }, () => {
        console.log("Notified background to clear tab data.");
    });
});