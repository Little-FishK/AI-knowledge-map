# Scheduled-task prompt templates

Replace `<官方顺序>` with the exact official recommendation order, for example `2.2`. Each scheduled task handles one node only.

## Publish a red provisional review page

```text
使用 $publish-stage2-provisional-page 处理官方推荐节点 <官方顺序>。manual-review action：publish-provisional。按控制器状态安全续跑；完成红色暂行审核页发布与精确哈希复核后停止。不得最终批准，不得处理第二个节点。
```

## Hold for manual review without publishing

```text
使用 $publish-stage2-provisional-page 处理官方推荐节点 <官方顺序>。manual-review action：hold。按控制器状态安全续跑；到达 manual-review 后报告候选哈希、阻断项与发布状态并停止。不得发布，不得最终批准，不得处理第二个节点。
```

## Important scheduling rule

Do not use a prompt that omits the node or `manual-review` action. Create a separate scheduled task for every node. Re-running the same prompt is safe only because the skill first inspects controller state and never regenerates or republishes an already completed stage.
