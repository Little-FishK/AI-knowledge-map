"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { plainText } = require("../../deepdive/quality/deepdive-narrative-audit");

function createContentGeneration(options) {
  const {
    defaultRoot,
    prompt,
    skippedTitles,
    removedSectionTitles,
    maxResponseChars,
    authorizeTaskLease,
    sha256,
    acquireLock,
    appendEvent,
    atomicWrite,
    loadState,
    saveState,
    withinRoot,
  } = options;

  function cleanContentSectionTitle(headingHtml, fallback) {
    const withoutMetadata = String(headingHtml || "")
      .replace(/<span\b[^>]*class=["'][^"']*\bdd-n\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, " ")
      .replace(/<span\b[^>]*class=["'][^"']*\bdd-badge\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, " ");
    return plainText(withoutMetadata)
      .replace(/^\d+(?:\.\d+)*\s+/, "")
      .replace(/[。；]+$/g, "")
      .trim() || fallback;
  }

  function isSkippedContentGenerationTitle(title) {
    const normalized = String(title || "").replace(/\s+/g, "").replace(/[：:。；]/g, "");
    return skippedTitles.some(item => normalized.includes(item.replace(/\s+/g, "")));
  }

  function isConfiguredRemovedSectionTitle(title, configuredTitles = removedSectionTitles) {
    const normalized = String(title || "").replace(/\s+/g, "").replace(/[：:。；]/g, "");
    return (configuredTitles || []).some(item => {
      const removed = String(item || "").replace(/\s+/g, "").replace(/[：:。；]/g, "");
      return removed && normalized.includes(removed);
    });
  }

  function contentGenerationSections(page) {
    const html = String(page && page.html || "");
    const matches = [...html.matchAll(
      /<section\b[^>]*class=["'][^"']*\bdd-sec\b[^"']*["'][^>]*>[\s\S]*?<\/section>/gi,
    )];
    const source = matches.length
      ? matches.map(match => match[0])
      : [...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/gi)].map(match => match[0]);
    return source.map((sectionHtml, index) => {
      const headingMatch = sectionHtml.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i);
      const title = cleanContentSectionTitle(headingMatch && headingMatch[1], `第 ${index + 1} 章`);
      const bodyHtml = sectionHtml.replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/i, " ");
      return {
        sectionNumber: index + 1,
        title,
        skipped: isSkippedContentGenerationTitle(title),
        text: plainText(bodyHtml),
        html: sectionHtml,
        contentHash: sha256(sectionHtml),
      };
    });
  }

  function contentGenerationReviewMaterial(root, record) {
    const graphSource = fs.readFileSync(path.join(root, "data", "graph.js"), "utf8");
    const graphContext = { window: {} };
    vm.createContext(graphContext);
    vm.runInContext(graphSource, graphContext);
    const phases = graphContext.window.GRAPH
      && Array.isArray(graphContext.window.GRAPH.recommendedLearningPath)
      ? graphContext.window.GRAPH.recommendedLearningPath
      : [];
    const step = phases.flatMap(phase => phase.steps || [])
      .find(item => String(item[1]) === record.id);
    if (!step) throw new Error(`官方推荐学习路径中不存在页面：${record.id}`);
    const order = String(step[0]);
    const group = order.split(".")[0];
    const relativePath = `docs/deepdive-reviews/${group}x-section-text-review.md`;
    const file = withinRoot(root, relativePath);
    if (!fs.existsSync(file)) throw new Error(`缺少旧理解原理页章节审阅稿：${relativePath}`);
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    const escapedId = record.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pagePattern = new RegExp(`^##\\s+${order.replace(/\./g, "\\.")}\\s+(.+?)（${escapedId}）\\s*$`);
    const start = lines.findIndex(line => pagePattern.test(line));
    if (start < 0) throw new Error(`章节审阅稿中不存在页面：${order} ${record.id}`);
    const titleMatch = lines[start].match(pagePattern);
    const end = lines.findIndex((line, index) => index > start && /^##\s+/.test(line));
    const pageLines = lines.slice(start + 1, end < 0 ? lines.length : end);
    const sections = [];
    let current = null;
    pageLines.forEach(line => {
      const heading = line.match(/^###\s+(\d+(?:\.\d+)*)\s+(.+?)\s*$/);
      if (heading) {
        if (current) sections.push(current);
        current = {
          sectionNumber: sections.length + 1,
          sourceOrder: heading[1],
          title: heading[2].trim(),
          body: [],
        };
        return;
      }
      if (current) current.body.push(line);
    });
    if (current) sections.push(current);
    const normalizedSections = sections.map(section => {
      const text = section.body.join("\n").trim();
      return {
        sectionNumber: section.sectionNumber,
        sourceOrder: section.sourceOrder,
        title: section.title,
        skipped: isSkippedContentGenerationTitle(section.title),
        text,
        html: null,
        contentHash: sha256(text),
      };
    });
    if (!normalizedSections.length) throw new Error(`页面 ${record.id} 的章节审阅稿没有章节`);
    return {
      pageId: record.id,
      order,
      title: titleMatch[1].trim(),
      sourceFile: relativePath,
      sourceHash: sha256(fs.readFileSync(file, "utf8")),
      sections: normalizedSections,
    };
  }

  function contentGenerationManifest(material) {
    const sections = Array.isArray(material && material.sections)
      ? material.sections
      : contentGenerationSections(material);
    return {
      eligibleSections: sections.filter(section => !section.skipped).map(section => ({
        sectionNumber: section.sectionNumber,
        title: section.title,
        contentHash: section.contentHash,
      })),
      skippedSections: sections.filter(section => section.skipped).map(section => ({
        sectionNumber: section.sectionNumber,
        title: section.title,
        reason: "按内容生成合同跳过常见误解与自测章节",
      })),
    };
  }

  function contentGenerationOutputShape(material) {
    const manifest = contentGenerationManifest(material);
    return {
      pageId: "<page-id>",
      responses: manifest.eligibleSections.map(section => ({
        sectionNumber: section.sectionNumber,
        title: section.title,
        response: "<对该章节执行控制器返回的完整固定提示词后得到的原始回复>",
      })),
      summary: "<可选，至多 500 字>",
    };
  }

  function contentGenerationResponseEncodingError(value) {
    const text = String(value || "");
    if (text.includes("\uFFFD")) return "包含 Unicode 替换字符，疑似发生编码损坏";
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) {
      return "包含非法控制字符，疑似反斜杠转义被错误解析";
    }
    if (/\?{8,}/.test(text)) return "包含连续问号，疑似非 UTF-8 管道将正文替换为问号";
    return null;
  }

  function contentGenerationResultGaps(record, material, result) {
    const gaps = [];
    const manifest = contentGenerationManifest(material);
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return ["result 必须是对象"];
    }
    if (result.pageId !== record.id) gaps.push("result.pageId 与任务页面不一致");
    if (!Array.isArray(result.responses)) {
      gaps.push("result.responses 必须是数组");
      return gaps;
    }
    if (result.responses.length !== manifest.eligibleSections.length) {
      gaps.push("result.responses 必须恰好覆盖全部可处理章节");
    }
    const seen = new Set();
    result.responses.forEach((response, index) => {
      const expected = manifest.eligibleSections[index];
      if (!response || typeof response !== "object" || Array.isArray(response)) {
        gaps.push(`responses[${index}] 必须是对象`);
        return;
      }
      if (!Number.isInteger(response.sectionNumber)) {
        gaps.push(`responses[${index}].sectionNumber 必须是整数`);
      } else if (seen.has(response.sectionNumber)) {
        gaps.push(`章节 ${response.sectionNumber} 重复`);
      } else {
        seen.add(response.sectionNumber);
      }
      if (expected && response.sectionNumber !== expected.sectionNumber) {
        gaps.push(`responses[${index}] 必须对应第 ${expected.sectionNumber} 章并保持原顺序`);
      }
      if (expected && String(response.title || "").trim() !== expected.title) {
        gaps.push(`responses[${index}].title 与任务章节标题不一致`);
      }
      const responseText = String(response.response || "").trim();
      if (!responseText) gaps.push(`responses[${index}].response 不能为空`);
      const encodingError = contentGenerationResponseEncodingError(responseText);
      if (encodingError) gaps.push(`responses[${index}].response ${encodingError}`);
      if (responseText.length > maxResponseChars) {
        gaps.push(`responses[${index}].response 超过 ${maxResponseChars} 字符`);
      }
    });
    if (String(result.summary || "").length > 500) gaps.push("result.summary 最多 500 字符");
    return gaps;
  }

  function contentGenerationMarkdown(material, result) {
    const lines = [
      `# ${String(material && material.title || result.pageId)} Agent Responses`,
      "",
      `> 页面：${result.pageId}。以下内容按原页章节顺序，由同一个 content-generation Agent 对每章执行控制器返回的完整固定提示词后原样汇总。常见误解与自测章节未发送。`,
      "",
    ];
    result.responses.forEach(response => {
      lines.push(`## ${response.sectionNumber}. ${response.title}`, "", String(response.response).trim(), "");
    });
    return `${lines.join("\n").trim()}\n`;
  }

  function saveContentGenerationResponse(root = defaultRoot, input = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = Object.values(state.pages).find(page =>
        page.lease && page.lease.taskId === input.taskId
      );
      if (!record) throw new Error("内容生成响应对应的活动租约不存在");
      if (record.lease.token !== input.leaseToken) throw new Error("内容生成响应的租约令牌无效");
      if (record.lease.role !== "content-generation") throw new Error("只有 content-generation 角色可以保存章节回复");
      if (Date.parse(record.lease.expiresAt) <= Date.now()) throw new Error("内容生成租约已经过期");
      const material = contentGenerationReviewMaterial(resolvedRoot, record);
      const manifest = contentGenerationManifest(material);
      const savedResponses = Array.isArray(record.contentGeneration && record.contentGeneration.savedResponses)
        ? record.contentGeneration.savedResponses
        : [];
      const expected = manifest.eligibleSections[savedResponses.length];
      if (!expected) throw new Error("所有允许章节的回复均已保存");
      const sectionNumber = Number(input.sectionNumber);
      if (sectionNumber !== expected.sectionNumber) {
        throw new Error(`必须先保存第 ${expected.sectionNumber} 章“${expected.title}”的回复`);
      }
      if (input.title != null && String(input.title).trim() !== expected.title) {
        throw new Error("章节标题与当前待保存章节不一致");
      }
      const response = String(input.response || "").trim();
      if (!response) throw new Error("章节回复不能为空");
      const encodingError = contentGenerationResponseEncodingError(response);
      if (encodingError) throw new Error(`章节回复拒绝保存：${encodingError}`);
      if (response.length > maxResponseChars) {
        throw new Error(`章节回复超过 ${maxResponseChars} 字符`);
      }
      const saved = {
        sectionNumber: expected.sectionNumber,
        title: expected.title,
        response,
        savedAt: new Date().toISOString(),
      };
      savedResponses.push(saved);
      record.contentGeneration.savedResponses = savedResponses;
      record.contentGeneration.status = savedResponses.length === manifest.eligibleSections.length
        ? "responses-saved"
        : "in-progress";
      const outputRelative = record.contentGeneration.outputFile;
      const markdown = contentGenerationMarkdown(material, {
        pageId: record.id,
        responses: savedResponses,
      });
      atomicWrite(withinRoot(resolvedRoot, outputRelative), markdown);
      record.contentGeneration.outputHash = sha256(markdown);
      record.updatedAt = saved.savedAt;
      saveState(resolvedRoot, state);
      const next = manifest.eligibleSections[savedResponses.length] || null;
      appendEvent(resolvedRoot, "content-generation-response-saved", {
        id: record.id,
        taskId: input.taskId,
        sectionNumber: saved.sectionNumber,
        savedCount: savedResponses.length,
        remainingCount: manifest.eligibleSections.length - savedResponses.length,
      });
      return {
        status: "saved",
        pageId: record.id,
        sectionNumber: saved.sectionNumber,
        savedCount: savedResponses.length,
        totalCount: manifest.eligibleSections.length,
        outputFile: outputRelative,
        outputHash: record.contentGeneration.outputHash,
        nextSectionNumber: next ? next.sectionNumber : null,
        done: !next,
      };
    } finally {
      release();
    }
  }

  function readContentGenerationSection(root = defaultRoot, input = {}) {
    const resolvedRoot = path.resolve(root);
    const record = authorizeTaskLease(resolvedRoot, input.taskId, input.leaseToken);
    if (record.lease.role !== "content-generation") {
      throw new Error("只有 content-generation 角色可以读取内容生成章节");
    }
    const requestedSection = Number(input.sectionNumber);
    if (!Number.isInteger(requestedSection) || requestedSection < 1) {
      throw new Error("sectionNumber 必须是正整数");
    }
    const material = contentGenerationReviewMaterial(resolvedRoot, record);
    const sections = material.sections;
    const section = sections.find(item => item.sectionNumber === requestedSection);
    if (!section) throw new Error(`页面 ${record.id} 不存在第 ${requestedSection} 章`);
    if (section.skipped) {
      throw new Error(`第 ${requestedSection} 章“${section.title}”按合同禁止发送给内容生成 Agent`);
    }
    const manifest = contentGenerationManifest(material);
    const savedCount = Array.isArray(record.contentGeneration && record.contentGeneration.savedResponses)
      ? record.contentGeneration.savedResponses.length
      : 0;
    const expected = manifest.eligibleSections[savedCount];
    if (!expected) throw new Error("所有允许章节均已处理，请提交最终结果");
    if (requestedSection !== expected.sectionNumber) {
      throw new Error(`必须按顺序读取第 ${expected.sectionNumber} 章“${expected.title}”`);
    }
    const eligible = sections.filter(item => !item.skipped);
    const position = eligible.findIndex(item => item.sectionNumber === requestedSection);
    const next = position >= 0 ? eligible[position + 1] : null;
    return {
      status: "ok",
      pageId: record.id,
      role: record.lease.role,
      prompt,
      section: {
        sectionNumber: section.sectionNumber,
        title: section.title,
        contentHash: section.contentHash,
        text: section.text,
        sourceOrder: section.sourceOrder,
      },
      nextSectionNumber: next ? next.sectionNumber : null,
      done: !next,
    };
  }

  return {
    contentGenerationManifest,
    contentGenerationMarkdown,
    contentGenerationOutputShape,
    contentGenerationResponseEncodingError,
    contentGenerationResultGaps,
    contentGenerationReviewMaterial,
    contentGenerationSections,
    isConfiguredRemovedSectionTitle,
    readContentGenerationSection,
    saveContentGenerationResponse,
  };
}

module.exports = { createContentGeneration };
