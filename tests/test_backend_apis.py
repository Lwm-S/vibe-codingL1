"""Test all Phase 3 backend APIs."""
import requests
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = "http://localhost:8000"


def test_health():
    print("=== 1. Health Check ===")
    r = requests.get(f"{BASE}/api/health")
    print(json.dumps(r.json(), ensure_ascii=False, indent=2))
    assert r.json()["status"] == "ok"
    print("PASS\n")


def test_create_conversation():
    print("=== 2. Create Conversation ===")
    r = requests.post(f"{BASE}/api/conversations", json={
        "model": "deepseek-chat",
        "thinking_enabled": False,
    })
    conv = r.json()
    print(json.dumps(conv, ensure_ascii=False, indent=2))
    assert "id" in conv
    assert conv["title"] == "新对话"
    print("PASS\n")
    return conv["id"]


def test_list_conversations():
    print("=== 3. List Conversations ===")
    r = requests.get(f"{BASE}/api/conversations")
    convs = r.json()
    print(f"Total: {len(convs)} conversations")
    for c in convs:
        print(f"  - {c['id'][:8]}... title={c['title']} model={c['model']}")
    assert len(convs) > 0
    print("PASS\n")


def test_chat_normal(conv_id):
    print("=== 4. Chat - Normal Mode (no thinking) ===")
    r = requests.post(f"{BASE}/api/chat", json={
        "conversation_id": conv_id,
        "message": "你好，1+1等于几？只回答数字",
        "thinking_enabled": False,
    }, stream=True)

    content = ""
    event_types = []
    for line in r.iter_lines(decode_unicode=True):
        if not line or not line.startswith("data: "):
            continue
        data = line[6:]
        if data == "[DONE]":
            event_types.append("DONE")
            break
        event = json.loads(data)
        event_types.append(event["type"])
        if event["type"] == "content":
            content += event["content"]
            print(event["content"], end="", flush=True)
        elif event["type"] == "done":
            print(f"\n  [done] message_id={event.get('message_id', 'N/A')}")

    print(f"\n  Event types seen: {list(set(event_types))}")
    print(f"  Full content: {content}")
    assert "content" in event_types
    assert "done" in event_types
    print("PASS\n")


def test_chat_thinking(conv_id):
    print("=== 5. Chat - Thinking Mode ===")
    # Create a new conversation for thinking mode
    r = requests.post(f"{BASE}/api/conversations", json={
        "model": "deepseek-chat",
        "thinking_enabled": True,
    })
    think_conv_id = r.json()["id"]

    r = requests.post(f"{BASE}/api/chat", json={
        "conversation_id": think_conv_id,
        "message": "9.11和9.8哪个大？",
        "thinking_enabled": True,
    }, stream=True)

    reasoning = ""
    content = ""
    event_types = []

    for line in r.iter_lines(decode_unicode=True):
        if not line or not line.startswith("data: "):
            continue
        data = line[6:]
        if data == "[DONE]":
            event_types.append("DONE")
            break
        event = json.loads(data)
        event_types.append(event["type"])
        if event["type"] == "reasoning":
            reasoning += event["content"]
        elif event["type"] == "content":
            content += event["content"]
        elif event["type"] == "done":
            print(f"  [done] message_id={event.get('message_id', 'N/A')}")

    print(f"  Event types seen: {list(set(event_types))}")
    print(f"  Reasoning length: {len(reasoning)} chars")
    print(f"  Reasoning preview: {reasoning[:100]}...")
    print(f"  Content: {content}")
    assert "reasoning" in event_types
    assert "content" in event_types
    assert "done" in event_types
    print("PASS\n")

    return think_conv_id


def test_get_conversation(conv_id):
    print("=== 6. Get Conversation with Messages ===")
    r = requests.get(f"{BASE}/api/conversations/{conv_id}")
    detail = r.json()
    print(f"  Title: {detail['title']}")
    print(f"  Messages: {len(detail['messages'])}")
    for m in detail["messages"]:
        rc = f" (reasoning: {len(m.get('reasoning_content') or '')} chars)" if m.get("reasoning_content") else ""
        print(f"    [{m['role']}] {m['content'][:60]}...{rc}")
    assert len(detail["messages"]) >= 2
    print("PASS\n")


def test_update_title(conv_id):
    print("=== 7. Update Conversation Title ===")
    r = requests.patch(f"{BASE}/api/conversations/{conv_id}", json={
        "title": "测试对话标题",
    })
    updated = r.json()
    print(f"  New title: {updated['title']}")
    assert updated["title"] == "测试对话标题"
    print("PASS\n")


def test_delete_conversation(conv_id):
    print("=== 8. Delete Conversation ===")
    r = requests.delete(f"{BASE}/api/conversations/{conv_id}")
    print(f"  Response: {r.json()}")
    assert r.json()["status"] == "ok"

    r2 = requests.get(f"{BASE}/api/conversations/{conv_id}")
    assert r2.status_code == 404
    print("PASS\n")


if __name__ == "__main__":
    print("=" * 60)
    print("Phase 3 Backend API Tests")
    print("=" * 60 + "\n")

    test_health()
    conv_id = test_create_conversation()
    test_list_conversations()
    test_chat_normal(conv_id)
    think_conv_id = test_chat_thinking(conv_id)
    test_get_conversation(conv_id)
    test_get_conversation(think_conv_id)
    test_update_title(conv_id)
    test_delete_conversation(conv_id)

    print("=" * 60)
    print("ALL TESTS PASSED")
    print("=" * 60)
