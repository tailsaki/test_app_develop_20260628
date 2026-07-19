import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

describe("TODOアプリ", () => {
  describe("タスク追加", () => {
    it("入力欄にテキストを入れてEnterを押すとタスクが追加される", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "牛乳を買う");
      await user.keyboard("{Enter}");

      expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    });

    it("空文字ではタスクが追加されない", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "   ");
      await user.keyboard("{Enter}");

      expect(screen.getByText("タスクを追加してください")).toBeInTheDocument();
    });

    it("Enterを押すと入力欄がクリアされる", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "テストタスク");
      await user.keyboard("{Enter}");

      expect(input).toHaveValue("");
    });

    it("複数のタスクを追加できる", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "タスク1");
      await user.keyboard("{Enter}");
      await user.type(input, "タスク2");
      await user.keyboard("{Enter}");

      expect(screen.getByText("タスク1")).toBeInTheDocument();
      expect(screen.getByText("タスク2")).toBeInTheDocument();
    });
  });

  describe("タスク完了トグル", () => {
    it("チェックボックスをクリックするとタスクが完了状態になる", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "テスト");
      await user.keyboard("{Enter}");

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
      expect(screen.getByText("テスト")).toHaveClass("line-through");
    });

    it("完了状態のタスクを再クリックすると未完了に戻る", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "テスト");
      await user.keyboard("{Enter}");

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      await user.click(checkbox);

      expect(checkbox).not.toBeChecked();
      expect(screen.getByText("テスト")).not.toHaveClass("line-through");
    });
  });

  describe("タスク削除", () => {
    it("削除ボタンをクリックするとタスクが削除される", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "消えるタスク");
      await user.keyboard("{Enter}");

      await user.click(screen.getByRole("button", { name: "✕" }));

      expect(screen.queryByText("消えるタスク")).not.toBeInTheDocument();
    });
  });

  describe("インライン編集", () => {
    it("タスクをダブルクリックすると編集モードになる", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "元のテキスト");
      await user.keyboard("{Enter}");

      await user.dblClick(screen.getByText("元のテキスト"));

      expect(screen.getByDisplayValue("元のテキスト")).toBeInTheDocument();
    });

    it("編集後にEnterを押すとテキストが更新される", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "古いテキスト");
      await user.keyboard("{Enter}");

      await user.dblClick(screen.getByText("古いテキスト"));
      const editInput = screen.getByDisplayValue("古いテキスト");
      await user.clear(editInput);
      await user.type(editInput, "新しいテキスト");
      await user.keyboard("{Enter}");

      expect(screen.getByText("新しいテキスト")).toBeInTheDocument();
      expect(screen.queryByText("古いテキスト")).not.toBeInTheDocument();
    });

    it("編集中にEscapeを押すとキャンセルされる", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "元のテキスト");
      await user.keyboard("{Enter}");

      await user.dblClick(screen.getByText("元のテキスト"));
      const editInput = screen.getByDisplayValue("元のテキスト");
      await user.clear(editInput);
      await user.type(editInput, "変更後");
      await user.keyboard("{Escape}");

      expect(screen.getByText("元のテキスト")).toBeInTheDocument();
    });
  });

  describe("全完了トグル", () => {
    it("❯ボタンで全タスクを完了状態にできる", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "タスク1");
      await user.keyboard("{Enter}");
      await user.type(input, "タスク2");
      await user.keyboard("{Enter}");

      await user.click(screen.getByRole("button", { name: "❯" }));

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((cb) => expect(cb).toBeChecked());
    });

    it("全完了状態で❯ボタンを押すと全未完了に戻る", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "タスク1");
      await user.keyboard("{Enter}");

      const toggleAll = screen.getByRole("button", { name: "❯" });
      await user.click(toggleAll);
      await user.click(toggleAll);

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
    });
  });

  describe("フィルター", () => {
    it("「未完了」フィルターで未完了タスクのみ表示される", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "未完了タスク");
      await user.keyboard("{Enter}");
      await user.type(input, "完了タスク");
      await user.keyboard("{Enter}");

      await user.click(screen.getAllByRole("checkbox")[1]);
      await user.click(screen.getByRole("button", { name: "未完了" }));

      expect(screen.getByText("未完了タスク")).toBeInTheDocument();
      expect(screen.queryByText("完了タスク")).not.toBeInTheDocument();
    });

    it("「完了済み」フィルターで完了タスクのみ表示される", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "未完了タスク");
      await user.keyboard("{Enter}");
      await user.type(input, "完了タスク");
      await user.keyboard("{Enter}");

      await user.click(screen.getAllByRole("checkbox")[1]);
      await user.click(screen.getByRole("button", { name: "完了済み" }));

      expect(screen.queryByText("未完了タスク")).not.toBeInTheDocument();
      expect(screen.getByText("完了タスク")).toBeInTheDocument();
    });

    it("「すべて」フィルターで全タスクが表示される", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "タスクA");
      await user.keyboard("{Enter}");
      await user.type(input, "タスクB");
      await user.keyboard("{Enter}");

      await user.click(screen.getAllByRole("checkbox")[0]);
      await user.click(screen.getByRole("button", { name: "未完了" }));
      await user.click(screen.getByRole("button", { name: "すべて" }));

      expect(screen.getByText("タスクA")).toBeInTheDocument();
      expect(screen.getByText("タスクB")).toBeInTheDocument();
    });
  });

  describe("完了済みを削除", () => {
    it("完了済みタスクをまとめて削除できる", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "残すタスク");
      await user.keyboard("{Enter}");
      await user.type(input, "消すタスク");
      await user.keyboard("{Enter}");

      await user.click(screen.getAllByRole("checkbox")[1]);
      await user.click(screen.getByRole("button", { name: "完了済みを削除" }));

      expect(screen.getByText("残すタスク")).toBeInTheDocument();
      expect(screen.queryByText("消すタスク")).not.toBeInTheDocument();
    });

    it("完了タスクがない場合「完了済みを削除」ボタンは表示されない", async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.type(screen.getByPlaceholderText("タスクを入力して Enter"), "タスク");
      await user.keyboard("{Enter}");

      expect(screen.queryByRole("button", { name: "完了済みを削除" })).not.toBeInTheDocument();
    });
  });

  describe("件数表示", () => {
    it("未完了タスクの件数が正しく表示される", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText("タスクを入力して Enter");
      await user.type(input, "タスク1");
      await user.keyboard("{Enter}");
      await user.type(input, "タスク2");
      await user.keyboard("{Enter}");
      await user.type(input, "タスク3");
      await user.keyboard("{Enter}");

      await user.click(screen.getAllByRole("checkbox")[0]);

      expect(screen.getByText("2 件残り")).toBeInTheDocument();
    });
  });

  describe("初期表示", () => {
    it("タスクがない場合に案内メッセージが表示される", () => {
      render(<Home />);
      expect(screen.getByText("タスクを追加してください")).toBeInTheDocument();
    });

    it("フッターはタスクがない場合に表示されない", () => {
      render(<Home />);
      expect(screen.queryByText("件残り")).not.toBeInTheDocument();
    });
  });
});
