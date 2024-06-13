import requests
import os
from urllib.parse import urljoin
import json
with open("src/constants/champs.json") as f:
    content = json.load(f)

def get_png_files(url):
    # This function is just a placeholder as it requires the actual implementation to list all files in the directory.
    # For this example, assume we have a list of all PNG file names.
    response = requests.get(url)
    if response.status_code == 200:
        return [line for line in response.text.splitlines() if line.endswith('.png')]
    return []

def download_file(url, folder):
    local_filename = os.path.join(folder, url.split('/')[-1])
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(local_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    return local_filename

def main():
    base_url = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/'
    output_folder = './champion_icons'
    
    # Create the output folder if it does not exist
    os.makedirs(output_folder, exist_ok=True)

    for key in content.keys():
        file_url = urljoin(base_url, f"{key}.png")
        print(f'Downloading {file_url}')
        download_file(file_url, output_folder)
        print(f'Downloaded {file_url}')

if __name__ == '__main__':
    main()
