import urllib.request
import json
import time
import os

base_url = "https://5050markets.com/api/markets?limit={limit}&offset={offset}&status=open"
limit = 50
offset = 0
all_markets = []
total_expected = None

print("Starting to fetch markets from 5050markets.com...")

while True:
    url = base_url.format(limit=limit, offset=offset)
    print(f"Fetching offset {offset}...")
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            if total_expected is None:
                total_expected = data.get('total', 0)
                print(f"Total markets expected: {total_expected}")
            
            markets = data.get('markets', [])
            
            if not markets:
                break
                
            all_markets.extend(markets)
            
            if len(markets) < limit:
                break # Reached the end
                
            offset += limit
            time.sleep(0.5) # Be polite to the API
            
    except Exception as e:
        print(f"Error fetching data at offset {offset}: {e}")
        break

output_file = "all_open_markets.json"
with open(output_file, "w", encoding='utf-8') as f:
    json.dump(all_markets, f, indent=2)

print(f"Done! Saved {len(all_markets)} markets to {os.path.abspath(output_file)}")
