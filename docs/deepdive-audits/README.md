# 理解原理页独立六问审计

本目录保存正文完成后的只读六问审计，不保存或生成正文。文件名为
`<page-id>.json`，当前迁移期间允许页面继续使用内联
`quality.sectionContracts`；独立审计存在时优先使用独立审计。
内联合同只用于迁移报告；严格 `--require-benchmark <id>` 会报
`audit.independent-review-required`，不能据此授予 L3。

每份审计至少包含：

```json
{
  "schemaVersion": 1,
  "pageId": "attention",
  "pageHash": "sha256:...",
  "reviewedAt": "2026-07-28",
  "sections": [
    {
      "section": 1,
      "definition": { "answer": "...", "evidence": "正文原句" },
      "problem": { "answer": "...", "evidence": "正文原句" },
      "inputOutput": { "answer": "...", "evidence": "正文原句" },
      "mechanism": { "answer": "...", "evidence": "正文原句" },
      "interpretation": { "answer": "...", "evidence": "正文原句" },
      "boundary": { "answer": "...", "evidence": "正文原句" }
    }
  ]
}
```

审计必须绑定当前页面内容哈希。正文变化后旧审计自动失效。写作模型不得在
生成正文的同时生成或修改本目录；缺口应触发原段落的融入式重写，而不是在
章节末尾追加六问收束段。
