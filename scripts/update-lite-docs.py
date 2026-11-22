from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/form.js';s=p.read_text(encoding='utf-8').replace('首次抠图需加载约 40 MB 模型','首次抠图需加载约 5 MB 模型及运行时');p.write_text(s,encoding='utf-8')
p=root/'README.md';s=p.read_text(encoding='utf-8');s=s.replace('使用 IMG.LY background-removal 1.7.0 的 ISNet 量化模型','使用 U²-NetP 轻量模型（ONNX Runtime Web）');s=s.replace('首次从 IMG.LY 官方 CDN 下载模型与运行时','模型与运行时随网站部署');s=s.replace('约 40 MB 模型','约 5 MB 模型');s=s.replace('模型默认从 IMG.LY 官方 CDN 加载','模型随网站提供，文件为 dist/model/u2netp.onnx');s+='\n模型源自 rembg 官方发布的 U²-NetP，MD5: 8e83ca70e441ab06c318d82300c84806。\n';p.write_text(s,encoding='utf-8')
