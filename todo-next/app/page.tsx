"use client";

import { useState } from "react";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
    setInput("");
  };

  const toggleTodo = (id: number) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTodo = (id: number) => setTodos(todos.filter((t) => t.id !== id));

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const commitEdit = (id: number) => {
    const text = editText.trim();
    if (text) setTodos(todos.map((t) => (t.id === id ? { ...t, text } : t)));
    else setTodos(todos.filter((t) => t.id !== id));
    setEditingId(null);
  };

  const toggleAll = () => {
    const allDone = todos.every((t) => t.completed);
    setTodos(todos.map((t) => ({ ...t, completed: !allDone })));
  };

  const clearCompleted = () => setTodos(todos.filter((t) => !t.completed));

  const filtered = todos.filter((t) =>
    filter === "active" ? !t.completed : filter === "completed" ? t.completed : true
  );

  const activeCount = todos.filter((t) => !t.completed).length;
  const hasCompleted = todos.some((t) => t.completed);

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-center text-6xl font-thin text-purple-400 tracking-widest mb-6">
          TODO
        </h1>

        {/* Input */}
        <div className="flex items-center bg-white shadow px-4 rounded-t">
          <button
            onClick={toggleAll}
            className={`text-xl mr-3 rotate-90 transition-colors ${
              todos.length > 0 && activeCount === 0 ? "text-gray-600" : "text-gray-300"
            }`}
          >
            ❯
          </button>
          <input
            className="flex-1 py-5 text-lg outline-none bg-transparent placeholder-gray-300 italic"
            placeholder="タスクを入力して Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
        </div>

        {/* List */}
        <ul className="bg-white shadow divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <li className="text-center py-10 text-gray-300 text-sm">
              {todos.length === 0 ? "タスクを追加してください" : "タスクがありません"}
            </li>
          ) : (
            filtered.map((todo) => (
              <li key={todo.id} className="flex items-center px-4 py-4 gap-3 group">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-7 h-7 rounded-full border-2 border-gray-300 accent-green-400 cursor-pointer flex-shrink-0"
                />
                {editingId === todo.id ? (
                  <input
                    autoFocus
                    className="flex-1 text-lg border-b-2 border-purple-400 outline-none bg-transparent"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit(todo.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => commitEdit(todo.id)}
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(todo)}
                    className={`flex-1 text-lg cursor-default select-none ${
                      todo.completed ? "line-through text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {todo.text}
                  </span>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-gray-300 hover:text-red-400 text-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="flex items-center justify-between bg-white shadow-md rounded-b px-4 py-3 text-sm text-gray-500 flex-wrap gap-2">
            <span>{activeCount} 件残り</span>
            <div className="flex gap-1">
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded border transition-colors ${
                    filter === f
                      ? "border-purple-400 text-purple-400"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
                </button>
              ))}
            </div>
            {hasCompleted && (
              <button
                onClick={clearCompleted}
                className="hover:text-red-400 hover:underline transition-colors"
              >
                完了済みを削除
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
