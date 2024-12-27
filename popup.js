document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const tabId = `tab-${currentTab.id}`;

        // Display the website name at the top
        displayWebsiteName(currentTab.url);

        // Retrieve the copied strings and the saved strings for this tab
        chrome.storage.local.get([tabId, "copiedStrings"], (data) => {
            const strings = data[tabId] || [];
            const copiedStrings = data.copiedStrings || [];

            if (strings.length > 0) {
                console.log("Restoring saved strings:", strings);
                displayStrings(strings, copiedStrings);
            } else {
                document.getElementById("output").textContent =
                    "Click the button to fetch coupons.";
            }

            // Set up the button click event
            const fetchButton = document.getElementById("fetch-data");

            fetchButton.addEventListener("click", () => {
                // Visual indicator: Show "Refreshing..."
                fetchButton.textContent = "Fetching...";
                fetchButton.classList.add("pulsing");
                fetchButton.disabled = true;

                fetchStrings(currentTab.url, tabId, copiedStrings);

                // Revert button state after the API call
                setTimeout(() => {
                    fetchButton.textContent = "Fetch Coupons";
                    fetchButton.classList.remove("pulsing");
                    fetchButton.disabled = false;
                }, 1000); // Adjust delay as needed
            });
        });
    });
});

// Function to display the website URL
function displayWebsiteName(url) {
    const websiteNameElement = document.getElementById("website-name");
    const hostname = new URL(url).hostname; // Extract the hostname from the URL
    websiteNameElement.textContent = `Coupons for: ${hostname}`;
}

// Function to display strings in the popup
function displayStrings(strings, copiedStrings) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = ""; // Clear previous content

    strings.forEach((string, index) => {
        // Extract properties from the object
        const { title, activatedOn, code } = string;
    
        // Create a container for the string and the button
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column"; // Stack title, date, and code vertically
        container.style.marginBottom = "10px";
        container.style.borderBottom = "2px solid lightgray"; // Add a separator between items
        container.style.paddingBottom = "10px";
    
        // Create elements for title and activatedOn
        const titleElement = document.createElement("span");
        titleElement.textContent = `${title || "N/A"}`;
        titleElement.style.fontSize = "0.9em";
        titleElement.style.fontWeight = "bold";
    
        const activatedOnElement = document.createElement("span");
        activatedOnElement.textContent = `Reported On: ${activatedOn || "N/A"}`;
        activatedOnElement.style.color = "gray";
        activatedOnElement.style.fontSize = "0.5em";
    
        // Create a sub-container for the code and the button
        const codeContainer = document.createElement("div");
        codeContainer.style.display = "flex";
        codeContainer.style.alignItems = "center"; // Vertically align the code and button
        codeContainer.style.marginTop = "5px";
    
        // Create the code element
        const codeElement = document.createElement("span");
        codeElement.textContent = `Code: ${code || "N/A"}`;
        codeElement.style.fontSize = "1em";
        codeElement.style.fontWeight = "bold";
        codeElement.style.marginRight = "10px"; // Add space between the code and the button
    
        // Highlight copied codes
        if (copiedStrings.includes(code)) {
            codeElement.style.color = "gray";
        }
    
        // Create a button to copy the code to the clipboard
        const copyButton = document.createElement("button");
        copyButton.textContent = copiedStrings.includes(code) ? "Copied" : "Copy";
        copyButton.style.padding = "5px 10px";
    
        copyButton.addEventListener("click", () => {
            navigator.clipboard
                .writeText(code)
                .then(() => {
                    console.log(`Copied: ${code}`);
                    codeElement.style.color = "gray";
                    copyButton.textContent = "Copied";
                    copyButton.style.backgroundColor = "#ccc";
    
                    // Save this copied string in memory
                    copiedStrings.push(code);
                    chrome.storage.local.set({ copiedStrings });
                })
                .catch((err) => {
                    alert("Failed to copy text: ", err);
                });
        });
    
        // Append the code and button to the sub-container
        codeContainer.appendChild(codeElement);
        codeContainer.appendChild(copyButton);
    
        // Append elements to the main container
        container.appendChild(titleElement);
        container.appendChild(activatedOnElement);
        container.appendChild(codeContainer);
    
        // Append the container to the output div
        outputDiv.appendChild(container);
    });    
}

// Function to fetch strings
function fetchStrings(url, tabId, copiedStrings) {
    chrome.runtime.sendMessage({ action: "fetchStrings", url }, (response) => {
        if (response && Array.isArray(response)) {
            console.log("Received strings:", response);
            displayStrings(response, copiedStrings);

            // Save the strings with the tab ID to Chrome's storage
            chrome.storage.local.set({ [tabId]: response });
        } else {
            console.error("Invalid response or no data received:", response);
            document.getElementById("output").textContent =
                "No coupons found or perhaps there was a problem. Try again?";
        }
    });
}

// Restore the saved strings and copied state for the current tab when the popup is opened
document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const tabId = `tab-${currentTab.id}`;

        // Display the website name at the top
        displayWebsiteName(currentTab.url);

        // Retrieve the copied strings and the saved strings for this tab
        chrome.storage.local.get([tabId, "copiedStrings"], (data) => {
            const strings = data[tabId] || [];
            const copiedStrings = data.copiedStrings || [];

            if (strings.length > 0) {
                console.log("Restoring saved strings:", strings);
                displayStrings(strings, copiedStrings);
            } else {
                document.getElementById("output").textContent =
                    "Click the button to fetch coupons.";
            }

            // Set up the button click event
            document.getElementById("fetch-data").addEventListener("click", () => {
                fetchStrings(currentTab.url, tabId, copiedStrings);
            });
        });
    });
});