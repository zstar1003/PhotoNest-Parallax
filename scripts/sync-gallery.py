"""Refresh lightweight previews and metadata from the user's PhotoNest repository."""
import json, urllib.request, pathlib, concurrent.futures
ROOT=pathlib.Path(__file__).resolve().parent.parent
BASE='https://raw.githubusercontent.com/zstar1003/PhotoNest/main/'
albums=json.load(urllib.request.urlopen(BASE+'gallery.json'))
jobs=[]
for album in albums:
    album['id']=album['cover'].split('/')[2]
    for p in album['photos']:
        path='assets/photos/'+album['id']+'-'+p['thumb'].split('/')[-1]
        jobs.append((BASE+p['thumb'],ROOT/path))
        p['original']=BASE+p['src']
        p['preview']=path
        for key in ['src','thumb','download']: p.pop(key,None)
def download(job):
    url,path=job
    if not path.exists():
        path.parent.mkdir(parents=True,exist_ok=True)
        for attempt in range(3):
            try:
                with urllib.request.urlopen(url,timeout=45) as r: path.write_bytes(r.read())
                break
            except Exception:
                if attempt==2: raise
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool: list(pool.map(download,jobs))
(ROOT/'gallery.json').write_text(json.dumps(albums,ensure_ascii=False,indent=2)+'\n')
print(f'Synced {len(jobs)} photos in {len(albums)} albums')

# Rebuild the two WebP sizes after downloading source thumbnails.
import subprocess, sys
subprocess.run([sys.executable, str(ROOT/"scripts/optimize-gallery.py")], check=True)
