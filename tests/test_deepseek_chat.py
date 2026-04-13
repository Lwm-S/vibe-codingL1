"""
测试 DeepSeek-Chat 普通对话模式（不开启思考），流式输出。
记录每个 chunk 的完整字段结构。
"""

from openai import OpenAI
import json

API_KEY = "sk-f499890039e54d54a0ce058c77d2efcf"
BASE_URL = "https://api.deepseek.com"

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

print("=" * 60)
print("TEST 1: deepseek-chat 普通对话（流式，不开启思考）")
print("=" * 60)

messages = [{"role": "user", "content": "你好，请用一句话介绍你自己"}]

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=messages,
    stream=True,
)

content = ""
chunk_count = 0

print("\n--- 逐个 chunk 原始结构 ---\n")

for chunk in response:
    chunk_count += 1
    chunk_dict = chunk.model_dump()

    # 前 3 个和最后一个 chunk 打印完整结构
    if chunk_count <= 3:
        print(f"[chunk {chunk_count}] FULL:")
        print(json.dumps(chunk_dict, ensure_ascii=False, indent=2))
        print()

    delta = chunk.choices[0].delta if chunk.choices else None
    finish_reason = chunk.choices[0].finish_reason if chunk.choices else None

    if delta:
        has_reasoning = hasattr(delta, "reasoning_content") and delta.reasoning_content
        delta_content = delta.content or ""

        if chunk_count <= 3 or finish_reason:
            print(f"  [chunk {chunk_count}] role={delta.role}, content={repr(delta_content)}, "
                  f"has_reasoning_content={has_reasoning}, finish_reason={finish_reason}")

        if delta_content:
            content += delta_content

    if finish_reason:
        print(f"\n[chunk {chunk_count}] LAST CHUNK FULL:")
        print(json.dumps(chunk_dict, ensure_ascii=False, indent=2))

print(f"\n--- 汇总 ---")
print(f"总 chunk 数: {chunk_count}")
print(f"最终 content: {content}")
print(f"content 长度: {len(content)} 字符")

print("\n\n" + "=" * 60)
print("TEST 2: deepseek-chat 普通对话（非流式）")
print("=" * 60)

response2 = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "1+1等于几？只回答数字"}],
    stream=False,
)

print("\n--- 非流式响应完整结构 ---\n")
print(json.dumps(response2.model_dump(), ensure_ascii=False, indent=2))
