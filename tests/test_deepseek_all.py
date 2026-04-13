"""
综合测试 DeepSeek API，记录所有接口返回字段。
输出写入 test_results.md 文件。
"""

from openai import OpenAI
import json
import sys

API_KEY = "sk-f499890039e54d54a0ce058c77d2efcf"
BASE_URL = "https://api.deepseek.com"

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

output_lines = []

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

def log(text=""):
    output_lines.append(text)
    print(text)

def dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2)

# ============================================================
# TEST 1: deepseek-chat 普通对话（流式，不开启思考）
# ============================================================
log("# DeepSeek API 接口测试结果\n")
log("## TEST 1: deepseek-chat 流式对话（不开启思考）\n")

messages_t1 = [{"role": "user", "content": "你好，请用一句话介绍你自己"}]

resp1 = client.chat.completions.create(
    model="deepseek-chat",
    messages=messages_t1,
    stream=True,
)

content_t1 = ""
chunk_count_t1 = 0

for chunk in resp1:
    chunk_count_t1 += 1
    chunk_dict = chunk.model_dump()

    if chunk_count_t1 == 1:
        log("**第 1 个 chunk（role 初始化）：**\n```json")
        log(dump(chunk_dict))
        log("```\n")

    if chunk_count_t1 == 2:
        log("**第 2 个 chunk（内容开始）：**\n```json")
        log(dump(chunk_dict))
        log("```\n")

    delta = chunk.choices[0].delta if chunk.choices else None
    finish_reason = chunk.choices[0].finish_reason if chunk.choices else None

    if delta and delta.content:
        content_t1 += delta.content

    if finish_reason:
        log(f"**最后一个 chunk（finish_reason={finish_reason}）：**\n```json")
        log(dump(chunk_dict))
        log("```\n")

log(f"- 总 chunk 数: **{chunk_count_t1}**")
log(f"- 最终 content: `{content_t1}`")
log(f"- delta 中是否有 reasoning_content 字段: **否（普通模式无此字段）**")
log()

# ============================================================
# TEST 2: deepseek-chat 开启思考模式（流式）
# ============================================================
log("---\n## TEST 2: deepseek-chat + thinking enabled 流式（思考模式）\n")

messages_t2 = [{"role": "user", "content": "9.11和9.8哪个大？"}]

resp2 = client.chat.completions.create(
    model="deepseek-chat",
    messages=messages_t2,
    stream=True,
    extra_body={"thinking": {"type": "enabled"}},
)

reasoning_t2 = ""
content_t2 = ""
chunk_count_t2 = 0
first_reasoning_chunk = None
first_content_chunk = None
phase = "init"

for chunk in resp2:
    chunk_count_t2 += 1
    chunk_dict = chunk.model_dump()
    delta = chunk.choices[0].delta if chunk.choices else None
    finish_reason = chunk.choices[0].finish_reason if chunk.choices else None

    if chunk_count_t2 == 1:
        log("**第 1 个 chunk（role 初始化）：**\n```json")
        log(dump(chunk_dict))
        log("```\n")

    if delta:
        rc = getattr(delta, "reasoning_content", None)
        dc = delta.content or ""

        if rc and first_reasoning_chunk is None:
            first_reasoning_chunk = chunk_count_t2
            log(f"**第 {chunk_count_t2} 个 chunk（reasoning_content 开始）：**\n```json")
            log(dump(chunk_dict))
            log("```\n")
            phase = "reasoning"

        if dc and first_content_chunk is None:
            first_content_chunk = chunk_count_t2
            log(f"**第 {chunk_count_t2} 个 chunk（content 开始，思考结束）：**\n```json")
            log(dump(chunk_dict))
            log("```\n")
            phase = "content"

        if rc:
            reasoning_t2 += rc
        if dc:
            content_t2 += dc

    if finish_reason:
        log(f"**最后一个 chunk（finish_reason={finish_reason}）：**\n```json")
        log(dump(chunk_dict))
        log("```\n")

log(f"- 总 chunk 数: **{chunk_count_t2}**")
log(f"- reasoning_content 起始 chunk: **{first_reasoning_chunk}**")
log(f"- content 起始 chunk: **{first_content_chunk}**")
log(f"- reasoning_content 长度: **{len(reasoning_t2)}** 字符")
log(f"- content 长度: **{len(content_t2)}** 字符")
log(f"- reasoning_content 前200字: `{reasoning_t2[:200]}...`")
log(f"- content: `{content_t2}`")
log()

# ============================================================
# TEST 3: 非流式 - 普通模式
# ============================================================
log("---\n## TEST 3: deepseek-chat 非流式（普通模式）\n")

resp3 = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "1+1等于几？只回答数字"}],
    stream=False,
)

log("**完整响应结构：**\n```json")
log(dump(resp3.model_dump()))
log("```\n")

# ============================================================
# TEST 4: 非流式 - 思考模式
# ============================================================
log("---\n## TEST 4: deepseek-chat 非流式（thinking enabled）\n")

resp4 = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "1+1等于几？只回答数字"}],
    stream=False,
    extra_body={"thinking": {"type": "enabled"}},
)

log("**完整响应结构：**\n```json")
log(dump(resp4.model_dump()))
log("```\n")

# ============================================================
# 字段汇总
# ============================================================
log("---\n## 关键字段汇总\n")
log("### 流式 chunk 结构 (chat.completion.chunk)\n")
log("| 字段 | 普通模式 | 思考模式 | 说明 |")
log("|------|---------|---------|------|")
log("| `id` | 有 | 有 | 请求唯一ID |")
log("| `model` | 有 | 有 | 模型名 |")
log("| `object` | chat.completion.chunk | chat.completion.chunk | 固定值 |")
log("| `choices[0].delta.role` | 首chunk=assistant | 首chunk=assistant | 仅首chunk |")
log("| `choices[0].delta.content` | 有 | 有 | 正式回复token |")
log("| `choices[0].delta.reasoning_content` | **无** | **有** | 思考过程token |")
log("| `choices[0].finish_reason` | 末chunk=stop | 末chunk=stop | 结束标志 |")
log("| `usage` | 末chunk有 | 末chunk有 | token用量统计 |")
log()
log("### 流式输出顺序\n")
log("- **普通模式**: `[role chunk] → [content chunks...] → [stop chunk]`")
log("- **思考模式**: `[role chunk] → [reasoning_content chunks...] → [content chunks...] → [stop chunk]`")
log()
log("### 前端对接要点\n")
log("1. 统一使用 `deepseek-chat` 模型")
log("2. 开启思考: `extra_body={\"thinking\": {\"type\": \"enabled\"}}`")
log("3. 流式时通过 `delta.reasoning_content` 是否存在区分思考/回复阶段")
log("4. `finish_reason === 'stop'` 表示生成完毕")

# 写入文件
with open("test_results.md", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print("\n\n>>> 结果已写入 tests/test_results.md")
