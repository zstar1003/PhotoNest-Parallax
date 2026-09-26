"""Create bandwidth-friendly WebP previews. Requires cwebp (brew install webp)."""
import json, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parent.parent
albums = json.loads((ROOT/'gallery.json').read_text())
before = after = small = 0
for album in albums:
    for photo in album['photos']:
        source = ROOT/photo['preview']
        if source.suffix == '.webp': source = source.with_suffix('.jpg')
        preview = source.with_suffix('.webp')
        thumbnail = source.with_name(source.stem+'-small.webp')
        subprocess.run(['cwebp','-quiet','-q','70',str(source),'-o',str(preview)],check=True)
        subprocess.run(['cwebp','-quiet','-q','62','-resize','240','0',str(source),'-o',str(thumbnail)],check=True)
        photo['preview'] = str(preview.relative_to(ROOT))
        photo['smallPreview'] = str(thumbnail.relative_to(ROOT))
        before += source.stat().st_size; after += preview.stat().st_size; small += thumbnail.stat().st_size
(ROOT/'gallery.json').write_text(json.dumps(albums,ensure_ascii=False,indent=2)+'\n')
print(f'JPEG {before:,} bytes -> WebP {after:,} bytes; contact thumbnails {small:,} bytes')
