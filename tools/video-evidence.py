#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""video-evidence.py —— 本地、免费的视频取证管线（软件教程页 E2 证据）

把一条视频转成「逐段转录 + 关键帧 OCR」证据包，供人据此写忠于视频的 E2 教程。
下载、抽帧与 OCR 均在本地完成；ASR 可选 Groq，未配置时回落到本地
faster-whisper。适合日后定时自动跑。

依赖（一次性安装）：
    py -3.11 -m pip install yt-dlp faster-whisper "scenedetect[opencv]" rapidocr-onnxruntime requests
    另需系统 ffmpeg（已装）。

用法：
    py -3.11 tools/video-evidence.py <视频URL> <输出前缀> [--model small|large-v3-turbo|large-v3] [--threshold 27]

产物：
    <前缀>.evidence.md      供人阅读的元数据、逐段转录与关键帧 OCR
    <前缀>.evidence.json    供双轨入库工具读取的结构化证据（含内容哈希）
    <前缀>_frames/          抽出的关键帧（可再人工 Read 核对界面）

原则（见 docs/TUTORIALS.md）：
    · 转录是「草稿」，专有名词/命令/数值以 OCR 与官方文档为准，别照抄 ASR。
    · 只下载低清视频+音频供内部取证；教程正文必须原创，不整段转载字幕。
    · 免登录即可取证；证据等级达 E2 后方可进入正式评分。
"""
import argparse, hashlib, json, os, subprocess, sys, re, time

# Windows PowerShell 常使用 GBK；进度信息含 Unicode 符号时会让已完成的取证任务
# 因输出编码而中断。统一为 UTF-8，同时保留 replace 回落以适配重定向输出。
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

def run(cmd):
    # 不用 text=True，避免 Windows 下用 gbk 解码 yt-dlp 输出报错
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return p.returncode, p.stdout.decode("utf-8", "replace"), p.stderr.decode("utf-8", "replace")

def require_success(result, step):
    rc, out, err = result
    if rc != 0:
        detail = (err or out or "未知错误").strip()[-1200:]
        raise RuntimeError(f"{step}失败（退出码 {rc}）：{detail}")
    return out

def stable_hash(value):
    def canonical(item):
        if isinstance(item, dict):
            return {key: canonical(item[key]) for key in sorted(item)}
        if isinstance(item, list):
            return [canonical(entry) for entry in item]
        if isinstance(item, float) and item.is_integer():
            return int(item)
        return item
    payload = json.dumps(canonical(value), ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return "sha256:" + hashlib.sha256(payload.encode("utf-8")).hexdigest()

def iso_date(value):
    text = str(value or "")
    if re.fullmatch(r"\d{8}", text):
        return f"{text[:4]}-{text[4:6]}-{text[6:8]}"
    return text or None

def groq_transcribe(audio, model, prompt=""):
    """用 Groq API 转录。key 从环境变量 GROQ_API_KEY 读取（绝不写进代码/仓库）。
    没有 key 返回 None，由调用方回落到本地。长音频转 16kHz 单声道并切段以避开单请求上限。
    prompt：领域词表，偏置专有名词拼写。"""
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        return None
    import glob, requests
    tmp = audio + "_groqchunks"
    os.makedirs(tmp, exist_ok=True)
    for old in glob.glob(os.path.join(tmp, "c_*.mp3")):
        os.remove(old)
    # 压成 16kHz 单声道 mp3 并按 900s 切段（控体积、避开单请求大小限制）
    subprocess.run(["ffmpeg", "-y", "-i", audio, "-ar", "16000", "-ac", "1", "-b:a", "32k",
                    "-f", "segment", "-segment_time", "900", os.path.join(tmp, "c_%03d.mp3")],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    chunks = sorted(glob.glob(os.path.join(tmp, "c_*.mp3")))
    out, url = [], "https://api.groq.com/openai/v1/audio/transcriptions"
    for i, ch in enumerate(chunks):
        data = {"model": model, "language": "zh", "response_format": "verbose_json"}
        if prompt:
            data["prompt"] = prompt
        with open(ch, "rb") as f:
            r = requests.post(url, headers={"Authorization": "Bearer " + key},
                              files={"file": (os.path.basename(ch), f, "audio/mpeg")},
                              data=data, timeout=600)
        r.raise_for_status()
        base = i * 900
        for s in r.json().get("segments", []):
            out.append((base + float(s["start"]), s["text"].strip()))
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("prefix")
    ap.add_argument("--asr", choices=["auto", "groq", "local"], default="auto",
                    help="转录用哪家：auto=有 GROQ_API_KEY 就用 Groq、否则本地；groq=强制 Groq；local=强制本地")
    ap.add_argument("--groq-model", default="whisper-large-v3", help="Groq 上的 Whisper 模型")
    ap.add_argument("--prompt", default="",
                    help="领域词表/上下文，纠正专有名词拼写（Groq 与本地都用；如 \"Codex DeepSeek ChatGPT Ollama CC Switch config.toml\"）")
    ap.add_argument("--model", default="large-v3-turbo", help="本地回落用的 faster-whisper 模型")
    ap.add_argument("--interval", type=int, default=8, help="抽帧间隔秒（越小越密、越慢；治长镜头漏采）")
    ap.add_argument("--dedup", type=float, default=8.0, help="相邻帧去重阈值（灰度均值差；越大去重越激进）")
    ap.add_argument("--height", type=int, default=480, help="抽帧视频的最大高度（480 快；难啃的小字调 720 让 OCR 更准）")
    a = ap.parse_args()

    frames_dir = a.prefix + "_frames"
    os.makedirs(frames_dir, exist_ok=True)
    audio = a.prefix + ".m4a"
    video = a.prefix + ".mp4"

    # 1) 元数据（章节、标题、时长）
    print("[1/5] 取元数据…", flush=True)
    rc, out, err = run([sys.executable, "-m", "yt_dlp", "-J", "--no-playlist", a.url])
    meta = {}
    try:
        j = json.loads(out)
        meta = {"title": j.get("title"), "uploader": j.get("uploader"),
                "duration": j.get("duration"), "upload_date": j.get("upload_date"),
                "extractor": j.get("extractor_key") or j.get("extractor"),
                "webpage_url": j.get("webpage_url") or a.url,
                "chapters": [{"start": c.get("start_time"), "end": c.get("end_time"),
                              "title": c.get("title")} for c in (j.get("chapters") or [])]}
    except Exception:
        print("  ⚠ 元数据解析失败（可能是合集/需分P处理）", flush=True)
    if rc != 0 and not meta:
        raise RuntimeError("视频元数据获取失败：" + (err or out or "未知错误").strip()[-1200:])

    # 2) 下载音频
    print("[2/5] 下载音频…", flush=True)
    if not os.path.exists(audio):
        require_success(
            run([sys.executable, "-m", "yt_dlp", "-f", "bestaudio", "--no-playlist", "-o", audio, a.url]),
            "下载音频"
        )
    if not os.path.exists(audio):
        raise RuntimeError("下载音频后未找到输出文件：" + audio)
    # 3) 下载低清视频（合并 mp4，供抽帧）
    print("[3/5] 下载低清视频…", flush=True)
    if not os.path.exists(video):
        require_success(
            run([sys.executable, "-m", "yt_dlp", "-f",
                 f"bv*[height<={a.height}]+ba/b[height<={a.height}]/best",
                 "--merge-output-format", "mp4", "--no-playlist", "-o", video, a.url]),
            "下载视频"
        )
    if not os.path.exists(video):
        raise RuntimeError("下载视频后未找到输出文件：" + video)

    # 4) 转录：优先 Groq（快、准 large-v3、近乎免费），无 key 回落本地
    print("[4/5] 转录…", flush=True)
    pairs, asr_used = None, None
    if a.asr in ("auto", "groq"):
        try:
            pairs = groq_transcribe(audio, a.groq_model, a.prompt)
            if pairs is not None:
                asr_used = f"Groq / {a.groq_model}"
                print(f"  用 {asr_used}（{len(pairs)} 段）", flush=True)
        except Exception as e:
            print(f"  ⚠ Groq 转录失败，回落本地：{e}", flush=True)
            pairs = None
    if pairs is None:
        if a.asr == "groq":
            print("  ⚠ 指定 --asr groq 但未设 GROQ_API_KEY，回落本地", flush=True)
        from faster_whisper import WhisperModel
        wm = WhisperModel(a.model, device="cpu", compute_type="int8")
        segs, _ = wm.transcribe(audio, language="zh", vad_filter=True,
                                initial_prompt=(a.prompt or None), beam_size=5)
        pairs = [(float(s.start), s.text.strip()) for s in segs]
        asr_used = f"本地 faster-whisper / {a.model}"
        print(f"  用 {asr_used}（{len(pairs)} 段）", flush=True)
    transcript_segments = []
    for index, (start, text) in enumerate(pairs):
        fallback_end = float(meta.get("duration") or start)
        end = float(pairs[index + 1][0]) if index + 1 < len(pairs) else fallback_end
        transcript_segments.append({
            "start": round(float(start), 3),
            "end": round(max(float(start), end), 3),
            "text": text
        })
    transcript = [
        f"[{int(item['start'])//60:02d}:{int(item['start'])%60:02d}] {item['text']}"
        for item in transcript_segments
    ]

    # 5) 密采抽帧（治长镜头漏采）→ 相邻感知去重（去冗余）→ OCR
    print("[5/5] 抽帧 + 去重 + OCR…", flush=True)
    frame_evidence = []
    limitations = []
    try:
        import glob, cv2, numpy as np
        from rapidocr_onnxruntime import RapidOCR
        ocr = RapidOCR()
        for old in glob.glob(os.path.join(frames_dir, "f_*.jpg")):
            os.remove(old)
        # 一次过按固定间隔抽帧（frame i ≈ i×interval 秒）
        frame_run = subprocess.run(
            ["ffmpeg", "-y", "-i", video, "-vf", f"fps=1/{a.interval}", "-q:v", "3",
             os.path.join(frames_dir, "f_%05d.jpg")],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        if frame_run.returncode != 0:
            raise RuntimeError(f"ffmpeg 抽帧失败（退出码 {frame_run.returncode}）")
        allf = sorted(glob.glob(os.path.join(frames_dir, "f_*.jpg")))
        if not allf:
            raise RuntimeError("ffmpeg 未生成任何关键帧")
        prev, kept = None, 0
        for idx, fp in enumerate(allf):
            g = cv2.imread(fp, cv2.IMREAD_GRAYSCALE)
            if g is None:
                continue
            sm = cv2.resize(g, (64, 36)).astype("int16")
            if prev is not None and float(np.mean(np.abs(sm - prev))) < a.dedup:
                os.remove(fp)          # 与上一保留帧几乎相同 → 丢弃
                continue
            prev, kept = sm, kept + 1
            res, _ = ocr(fp)
            txt = re.sub(r"\s+", " ", " | ".join(t for _, t, c in res if float(c) >= 0.6)) if res else ""
            sec = idx * a.interval
            frame_evidence.append({
                "time": sec,
                "file": os.path.join(os.path.basename(frames_dir), os.path.basename(fp)).replace("\\", "/"),
                "ocr": txt[:400]
            })
        print(f"  抽样 {len(allf)} 帧 → 去重后保留 {kept} 帧", flush=True)
    except Exception as e:
        limitations.append(f"抽帧/OCR 阶段失败：{e}")

    generated_at = time.strftime("%Y-%m-%d")
    source = {
        "url": meta.get("webpage_url") or a.url,
        "platform": meta.get("extractor") or "unknown",
        "title": meta.get("title"),
        "creator": meta.get("uploader"),
        "publishedAt": iso_date(meta.get("upload_date")),
        "durationSeconds": meta.get("duration"),
        "accessedAt": generated_at
    }
    evidence_payload = {
        "schemaVersion": 1,
        "source": source,
        "chapters": meta.get("chapters") or [],
        "transcript": transcript_segments,
        "frames": frame_evidence,
        "acquisition": {
            "asr": asr_used,
            "transcriptComplete": bool(transcript_segments),
            "ocrComplete": not limitations,
            "limitations": limitations,
            "evidenceLevelSuggestion": "E2" if transcript_segments else "E1",
            "requiresEditorialReview": True
        }
    }
    evidence_payload["contentHash"] = stable_hash(evidence_payload)

    # 写证据包
    md = [f"# 视频取证证据包 — {a.prefix}", "",
          f"- URL：{a.url}",
          f"- 标题：{meta.get('title','?')}",
          f"- 作者：{meta.get('uploader','?')} · 时长：{meta.get('duration','?')}s · 日期：{meta.get('upload_date','?')}",
          f"- 转录：{asr_used} · 生成：{generated_at}",
          f"- 证据哈希：`{evidence_payload['contentHash']}`",
          "", "> 转录仅作草稿；专有名词/命令/数值以下方 OCR 与官方文档为准。", ""]
    if meta.get("chapters"):
        md += ["## 章节", ""] + [
            f"- [{int(item.get('start') or 0)//60:02d}:{int(item.get('start') or 0)%60:02d}] {item.get('title')}"
            for item in meta["chapters"]
        ] + [""]
    ocr_lines = [
        f"- [{int(item['time'])//60:02d}:{int(item['time'])%60:02d}] `{item['file']}` — {item['ocr']}"
        for item in frame_evidence
    ]
    if limitations:
        ocr_lines += [f"- ⚠ {item}" for item in limitations]
    md += ["## 关键帧 OCR（固定间隔密采并相邻去重）", ""] + ocr_lines + ["", "## 逐段转录", "", "```", *transcript, "```", ""]
    open(a.prefix + ".evidence.md", "w", encoding="utf-8").write("\n".join(md))
    with open(a.prefix + ".evidence.json", "w", encoding="utf-8") as handle:
        json.dump(evidence_payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print(f"✓ 完成：{a.prefix}.evidence.md + .json（{len(transcript)} 段转录，{len(frame_evidence)} 个关键帧）")

if __name__ == "__main__":
    main()
