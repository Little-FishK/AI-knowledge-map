"""Download the public Cornell metadata snapshot, preserving source receipt."""
import hashlib
import json
import pathlib
import time
import urllib.request
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
HOME = ROOT / '.local/arxiv-2026-review'
HOME.mkdir(parents=True, exist_ok=True)
dest = HOME / 'cornell-arxiv-20260919.zip'
url = 'https://www.kaggle.com/api/v1/datasets/download/Cornell-University/arxiv'
if dest.exists():
    with zipfile.ZipFile(dest) as archive:
        print(json.dumps({'existing': str(dest), 'members': archive.namelist()}), flush=True)
else:
    part = dest.with_suffix('.zip.part')
    digest = hashlib.sha256()
    size = 0
    last = time.monotonic()
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'AIKnowledgeMap-LibraryResearch/1.0'}), timeout=45) as response:
        if response.status != 200:
            raise ValueError('Expected full HTTP 200 response')
        expected = int(response.headers.get('Content-Length', '0'))
        with part.open('wb') as stream:
            while True:
                chunk = response.read(4 * 1024 * 1024)
                if not chunk:
                    break
                if size == 0 and not chunk.startswith(b'PK\x03\x04'):
                    raise ValueError('Response is not ZIP metadata')
                size += len(chunk)
                if size > 3 * 1024 ** 3:
                    raise ValueError('Unexpected download size over 3 GiB')
                stream.write(chunk)
                digest.update(chunk)
                if time.monotonic() - last > 20:
                    print(json.dumps({'downloadedMiB': round(size / 1024 ** 2), 'expectedBytes': expected}), flush=True)
                    last = time.monotonic()
        if expected and size != expected:
            raise ValueError('Incomplete snapshot download')
    with zipfile.ZipFile(part) as archive:
        members = [{'name': i.filename, 'bytes': i.file_size, 'crc': i.CRC} for i in archive.infolist()]
        assert any(i['name'] == 'arxiv-metadata-oai-snapshot.json' for i in members)
    part.replace(dest)
    receipt = {'url': url, 'bytes': size, 'sha256': digest.hexdigest(), 'members': members,
               'sourceMetadata': '.tmp/arxiv-2026-connectivity/kaggle-1.json',
               'snapshotFileCreationDate': '2026-09-19T23:53:14.078Z',
               'note': 'Does not cover the 2026-09-23 cutoff without a subsequent delta.'}
    (HOME / 'snapshot-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(receipt), flush=True)
