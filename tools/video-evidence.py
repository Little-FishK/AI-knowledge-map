#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""video-evidence.py —— 本地、免费的视频取证管线（软件教程页 E2 证据）

把一条视频转成「逐段转录 + 关键帧 OCR」证据包，供人据此写忠于视频的 E2 教程。
全部本地开源、零 API 费用，适合日后定时自动跑。

依赖（一次性安装）：
    py -3.11 -m pip install yt-dlp faster-whisper "scenedetect[opencv]" rapidocr-onnxruntime
    另需系统 ffmpeg（已装）。

用法：
    py -3.11 tools/video-evidence.py <视频URL> <输出前缀> [--model small|large-v3-turbo|large-v3] [--threshold 27]

产物：
    <前缀>.evidence.md      元数据 + 逐段转录（带时间戳）+ 每个场景关键帧的 OCR
    <前缀>_frames/          抽出的关键帧（可再人工 Read 核对界面）

原则（见 docs/TUTORIALS.md）：
    · 转录是「草稿」，专有名词/命令/数值以 OCR 与官方文档为准，别照抄 ASR。
    · 只下载低清视频+音频供内部取证；教程正文必须原创，不整段转载字幕。
    · 免登录即可取证；证据等级达 E2 后方可进入正式评分。
"""
import argparse, json, os, subprocess, sys, re, time

def run(cmd):
    # 不用 text=True，避免 Windows 下用 gbk 解码 yt-dlp 输出报错
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return p.returncode, p.stdout.decode("utf-8", "replace"), p.stderr.decode("utf-8", "replace")

def groq_transcribe(audio, model):
    """用 Groq API 转录。key 从环境变量 GROQ_API_KEY 读取（绝不写进代码/仓库）。
    没有 key 返回 None，由调用方回落到本地。长音频转 16kHz 单声道并切段以避开单请求上限。"""
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
        with open(ch, "rb") as f:
            r = requests.post(url, headers={"Authorization": "Bearer " + key},
                              files={"file": (os.path.basename(ch), f, "audio/mpeg")},
                              data={"model": model, "language": "zh", "response_format": "verbose_json"},
                              timeout=600)
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
    ap.add_argument("--model", default="large-v3-turbo", help="本地回落用的 faster-whisper 模型")
    ap.add_argument("--threshold", type=float, default=27.0)
    ap.add_argument("--height", type=int, default=480, help="关键帧视频的最大高度（越小越快，够 OCR 即可）")
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
                "chapters": [(c.get("start_time"), c.get("title")) for c in (j.get("chapters") or [])]}
    except Exception:
        print("  ⚠ 元数据解析失败（可能是合集/需分P处理）", flush=True)

    # 2) 下载音频
    print("[2/5] 下载音频…", flush=True)
    if not os.path.exists(audio):
        run([sys.executable, "-m", "yt_dlp", "-f", "bestaudio", "--no-playlist", "-o", audio, a.url])
    # 3) 下载低清视频（合并 mp4，供抽帧）
    print("[3/5] 下载低清视频…", flush=True)
    if not os.path.exists(video):
        run([sys.executable, "-m", "yt_dlp", "-f",
             f"bv*[height<={a.height}]+ba/b[height<={a.height}]/best",
             "--merge-output-format", "mp4", "--no-playlist", "-o", video, a.url])

    # 4) 转录：优先 Groq（快、准 large-v3、近乎免费），无 key 回落本地
    print("[4/5] 转录…", flush=True)
    pairs, asr_used = None, None
    if a.asr in ("auto", "groq"):
        try:
            pairs = groq_transcribe(audio, a.groq_model)
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
        segs, _ = wm.transcribe(audio, language="zh", vad_filter=True)
        pairs = [(float(s.start), s.text.strip()) for s in segs]
        asr_used = f"本地 faster-whisper / {a.model}"
        print(f"  用 {asr_used}（{len(pairs)} 段）", flush=True)
    transcript = [f"[{int(st)//60:02d}:{int(st)%60:02d}] {tx}" for st, tx in pairs]

    # 5) 场景检测 + 抽帧 + OCR
    print("[5/5] 场景检测 + OCR…", flush=True)
    ocr_lines = []
    try:
        from scenedetect import detect, ContentDetector
        from rapidocr_onnxruntime import RapidOCR
        ocr = RapidOCR()
        scenes = detect(video, ContentDetector(threshold=a.threshold, min_scene_len=15))
        for i, (start, end) in enumerate(scenes):
            mid = (start.seconds + end.seconds) / 2
            fp = os.path.join(frames_dir, f"s{i:02d}_{int(mid):04d}s.jpg")
            subprocess.run(["ffmpeg", "-y", "-ss", str(mid), "-i", video, "-vframes", "1", "-q:v", "3", fp],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            res, _ = ocr(fp)
            txt = re.sub(r"\s+", " ", " | ".join(t for _, t, c in res if float(c) >= 0.6)) if res else ""
            ocr_lines.append(f"- [{int(mid)//60:02d}:{int(mid)%60:02d}] `{os.path.basename(fp)}` — {txt[:400]}")
    except Exception as e:
        ocr_lines.append(f"（场景/OCR 阶段失败：{e}）")

    # 写证据包
    md = [f"# 视频取证证据包 — {a.prefix}", "",
          f"- URL：{a.url}",
          f"- 标题：{meta.get('title','?')}",
          f"- 作者：{meta.get('uploader','?')} · 时长：{meta.get('duration','?')}s · 日期：{meta.get('upload_date','?')}",
          f"- 转录：{asr_used} · 生成：{time.strftime('%Y-%m-%d')}",
          "", "> 转录仅作草稿；专有名词/命令/数值以下方 OCR 与官方文档为准。", ""]
    if meta.get("chapters"):
        md += ["## 章节", ""] + [f"- [{int(t or 0)//60:02d}:{int(t or 0)%60:02d}] {title}" for t, title in meta["chapters"]] + [""]
    md += ["## 关键帧 OCR（场景检测自动选帧）", ""] + ocr_lines + ["", "## 逐段转录", "", "```", *transcript, "```", ""]
    open(a.prefix + ".evidence.md", "w", encoding="utf-8").write("\n".join(md))
    print(f"✓ 完成：{a.prefix}.evidence.md（{len(transcript)} 段转录，{len(ocr_lines)} 个关键帧）")

if __name__ == "__main__":
    main()
