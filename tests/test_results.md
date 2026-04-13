# DeepSeek API 接口测试结果

## TEST 1: deepseek-chat 流式对话（不开启思考）

**第 1 个 chunk（role 初始化）：**
```json
{
  "id": "0ec2cd6f-d45c-4361-b9d4-e3a937bd9ec6",
  "choices": [
    {
      "delta": {
        "content": "",
        "function_call": null,
        "refusal": null,
        "role": "assistant",
        "tool_calls": null
      },
      "finish_reason": null,
      "index": 0,
      "logprobs": null
    }
  ],
  "created": 1776090450,
  "model": "deepseek-chat",
  "object": "chat.completion.chunk",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": null
}
```

**第 2 个 chunk（内容开始）：**
```json
{
  "id": "0ec2cd6f-d45c-4361-b9d4-e3a937bd9ec6",
  "choices": [
    {
      "delta": {
        "content": "你好",
        "function_call": null,
        "refusal": null,
        "role": null,
        "tool_calls": null
      },
      "finish_reason": null,
      "index": 0,
      "logprobs": null
    }
  ],
  "created": 1776090450,
  "model": "deepseek-chat",
  "object": "chat.completion.chunk",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": null
}
```

**最后一个 chunk（finish_reason=stop）：**
```json
{
  "id": "0ec2cd6f-d45c-4361-b9d4-e3a937bd9ec6",
  "choices": [
    {
      "delta": {
        "content": "",
        "function_call": null,
        "refusal": null,
        "role": null,
        "tool_calls": null
      },
      "finish_reason": "stop",
      "index": 0,
      "logprobs": null
    }
  ],
  "created": 1776090450,
  "model": "deepseek-chat",
  "object": "chat.completion.chunk",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": {
    "completion_tokens": 29,
    "prompt_tokens": 11,
    "total_tokens": 40,
    "completion_tokens_details": null,
    "prompt_tokens_details": {
      "audio_tokens": null,
      "cached_tokens": 0
    },
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 11
  }
}
```

- 总 chunk 数: **30**
- 最终 content: `你好，我是DeepSeek，一个由深度求索公司创造的AI助手，致力于用热情和细腻的方式为你提供帮助！😊`
- delta 中是否有 reasoning_content 字段: **否（普通模式无此字段）**

---
## TEST 2: deepseek-chat + thinking enabled 流式（思考模式）

**第 1 个 chunk（role 初始化）：**
```json
{
  "id": "386708f1-2864-4db3-9327-559935657cb8",
  "choices": [
    {
      "delta": {
        "content": null,
        "function_call": null,
        "refusal": null,
        "role": "assistant",
        "tool_calls": null,
        "reasoning_content": ""
      },
      "finish_reason": null,
      "index": 0,
      "logprobs": null
    }
  ],
  "created": 1776090453,
  "model": "deepseek-reasoner",
  "object": "chat.completion.chunk",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": null
}
```

**第 2 个 chunk（reasoning_content 开始）：**
```json
{
  "id": "386708f1-2864-4db3-9327-559935657cb8",
  "choices": [
    {
      "delta": {
        "content": null,
        "function_call": null,
        "refusal": null,
        "role": null,
        "tool_calls": null,
        "reasoning_content": "我们"
      },
      "finish_reason": null,
      "index": 0,
      "logprobs": null
    }
  ],
  "created": 1776090453,
  "model": "deepseek-reasoner",
  "object": "chat.completion.chunk",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": null
}
```

**第 202 个 chunk（content 开始，思考结束）：**
```json
{
  "id": "386708f1-2864-4db3-9327-559935657cb8",
  "choices": [
    {
      "delta": {
        "content": "9",
        "function_call": null,
        "refusal": null,
        "role": null,
        "tool_calls": null,
        "reasoning_content": null
      },
      "finish_reason": null,
      "index": 0,
      "logprobs": null
    }
  ],
  "created": 1776090453,
  "model": "deepseek-reasoner",
  "object": "chat.completion.chunk",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": null
}
```

**最后一个 chunk（finish_reason=stop）：**
```json
{
  "id": "386708f1-2864-4db3-9327-559935657cb8",
  "choices": [
    {
      "delta": {
        "content": "",
        "function_call": null,
        "refusal": null,
        "role": null,
        "tool_calls": null,
        "reasoning_content": null
      },
      "finish_reason": "stop",
      "index": 0,
      "logprobs": null
    }
  ],
  "created": 1776090453,
  "model": "deepseek-reasoner",
  "object": "chat.completion.chunk",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": {
    "completion_tokens": 272,
    "prompt_tokens": 14,
    "total_tokens": 286,
    "completion_tokens_details": {
      "accepted_prediction_tokens": null,
      "audio_tokens": null,
      "reasoning_tokens": 200,
      "rejected_prediction_tokens": null
    },
    "prompt_tokens_details": {
      "audio_tokens": null,
      "cached_tokens": 0
    },
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 14
  }
}
```

- 总 chunk 数: **273**
- reasoning_content 起始 chunk: **2**
- content 起始 chunk: **202**
- reasoning_content 长度: **311** 字符
- content 长度: **100** 字符
- reasoning_content 前200字: `我们被问到："9.11和9.8哪个大？" 这是一个比较两个十进制数的问题：9.11和9.8。

我们需要确定哪个数更大。9.11是9又11/100，而9.8是9又8/10，也就是9.80。比较9.11和9.80，显然9.80更大，因为80/100大于11/100。或者，我们可以将它们视为小数：9.11 = 9.11，9.8 = 9.80。由于9.80 > 9.11，所以9.8更大。

因此，答案应...`
- content: `9.11和9.8比较大小，需要先统一小数点后的位数。9.8可以看作9.80，而9.11是9.11。比较小数部分：80（即0.80）大于11（即0.11），所以9.80 > 9.11。因此，9.8更大。`

---
## TEST 3: deepseek-chat 非流式（普通模式）

**完整响应结构：**
```json
{
  "id": "afa425df-30fe-4e48-b600-11411346b8a5",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "logprobs": null,
      "message": {
        "content": "2",
        "refusal": null,
        "role": "assistant",
        "annotations": null,
        "audio": null,
        "function_call": null,
        "tool_calls": null
      }
    }
  ],
  "created": 1776090464,
  "model": "deepseek-chat",
  "object": "chat.completion",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": {
    "completion_tokens": 1,
    "prompt_tokens": 13,
    "total_tokens": 14,
    "completion_tokens_details": null,
    "prompt_tokens_details": {
      "audio_tokens": null,
      "cached_tokens": 0
    },
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 13
  }
}
```

---
## TEST 4: deepseek-chat 非流式（thinking enabled）

**完整响应结构：**
```json
{
  "id": "cdcaa9b1-34a7-49e4-9f1f-69b777e8b5e6",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "logprobs": null,
      "message": {
        "content": "2",
        "refusal": null,
        "role": "assistant",
        "annotations": null,
        "audio": null,
        "function_call": null,
        "tool_calls": null,
        "reasoning_content": "首先，用户的问题是“1+1等于几？只回答数字”。这是一个非常简单的数学问题。1+1等于2。用户特别强调“只回答数字”，所以我应该只输出数字，而不添加任何其他文本。\n\n因此，我的回答应该仅仅是“2”。\n\n确认一下：在中文中，“只回答数字”意味着只提供数字答案，不要有任何解释或额外文字。\n\n所以，最终输出：2"
      }
    }
  ],
  "created": 1776090465,
  "model": "deepseek-reasoner",
  "object": "chat.completion",
  "service_tier": null,
  "system_fingerprint": "fp_eaab8d114b_prod0820_fp8_kvcache_new_kvcache_20260410",
  "usage": {
    "completion_tokens": 88,
    "prompt_tokens": 13,
    "total_tokens": 101,
    "completion_tokens_details": {
      "accepted_prediction_tokens": null,
      "audio_tokens": null,
      "reasoning_tokens": 86,
      "rejected_prediction_tokens": null
    },
    "prompt_tokens_details": {
      "audio_tokens": null,
      "cached_tokens": 0
    },
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 13
  }
}
```

---
## 关键字段汇总

### 流式 chunk 结构 (chat.completion.chunk)

| 字段 | 普通模式 | 思考模式 | 说明 |
|------|---------|---------|------|
| `id` | 有 | 有 | 请求唯一ID |
| `model` | 有 | 有 | 模型名 |
| `object` | chat.completion.chunk | chat.completion.chunk | 固定值 |
| `choices[0].delta.role` | 首chunk=assistant | 首chunk=assistant | 仅首chunk |
| `choices[0].delta.content` | 有 | 有 | 正式回复token |
| `choices[0].delta.reasoning_content` | **无** | **有** | 思考过程token |
| `choices[0].finish_reason` | 末chunk=stop | 末chunk=stop | 结束标志 |
| `usage` | 末chunk有 | 末chunk有 | token用量统计 |

### 流式输出顺序

- **普通模式**: `[role chunk] → [content chunks...] → [stop chunk]`
- **思考模式**: `[role chunk] → [reasoning_content chunks...] → [content chunks...] → [stop chunk]`

### 前端对接要点

1. 统一使用 `deepseek-chat` 模型
2. 开启思考: `extra_body={"thinking": {"type": "enabled"}}`
3. 流式时通过 `delta.reasoning_content` 是否存在区分思考/回复阶段
4. `finish_reason === 'stop'` 表示生成完毕