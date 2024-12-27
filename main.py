import requests

site = "gap.com"

url = "https://api.simplycodes.com/v3/promotion/mdp/codes"
querystring = {"slug":site,"filter":"top","showFallback":"true","cursor":"0","perPage":"20"}

payload = ""
headers = {
    "accept": "*/*",
    "accept-language": "es-ES,es;q=0.9,en;q=0.8,gl;q=0.7,fr;q=0.6",
    "origin": "https://simplycodes.com",
    "priority": "u=1, i",
    "referer": f"https://simplycodes.com/store/{site}",
    "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "x-source": "web"
}

response = requests.get(url, data=payload, headers=headers, params=querystring)
promotions = response.json().get("promotions")

if promotions:
    for code in promotions:
        if code.get("healthScore", 50) >= 50 and code.get("code") != None:
            print(code.get("title"))
            print(code.get("activatedOn", "0000-00-00T00:00:00.000Z").split("T")[0])
            print(code.get("code"))
            print("\n")
else:
    print("No codes founds for this site.")