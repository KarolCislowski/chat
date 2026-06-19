"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ApiHealth = {
  status: string;
  database: string;
};

type Message = {
  id: number;
  author: "Ty" | "System";
  text: string;
  time: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    author: "System",
    text: "Frontend jest gotowy. Podlacz endpoint wiadomosci w API, gdy model danych bedzie gotowy.",
    time: "teraz",
  },
];

export default function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHealth() {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = (await response.json()) as ApiHealth;

        if (isMounted) {
          setHealth(data);
          setHealthError(null);
        }
      } catch (error) {
        if (isMounted) {
          setHealth(null);
          setHealthError(error instanceof Error ? error.message : "API unavailable");
        }
      }
    }

    void loadHealth();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  const apiStatus = useMemo(() => {
    if (health?.status === "ok" && health.database === "connected") {
      return "API i MongoDB dzialaja";
    }

    if (health?.status === "ok") {
      return "API dziala, MongoDB nie jest polaczone";
    }

    return "API niedostepne";
  }, [health]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        author: "Ty",
        text,
        time: new Intl.DateTimeFormat("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      },
    ]);
    setDraft("");
  }

  return (
    <main className="shell">
      <section className="sidebar" aria-label="Lista rozmow">
        <div>
          <p className="eyebrow">Chat</p>
          <h1>Rozmowy</h1>
        </div>

        <button className="new-chat-button" type="button">
          Nowa rozmowa
        </button>

        <nav className="conversation-list" aria-label="Aktywne rozmowy">
          <a className="conversation active" href="#current">
            <span className="conversation-title">Development</span>
            <span className="conversation-meta">lokalnie</span>
          </a>
          <a className="conversation" href="#api">
            <span className="conversation-title">API</span>
            <span className="conversation-meta">{apiStatus}</span>
          </a>
        </nav>
      </section>

      <section className="chat-panel" id="current" aria-label="Aktywna rozmowa">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>Development Chat</h2>
          </div>
          <div className={health?.database === "connected" ? "status ok" : "status warning"}>
            <span aria-hidden="true" />
            {apiStatus}
          </div>
        </header>

        <div className="messages" aria-live="polite">
          {messages.map((message) => (
            <article className={`message ${message.author === "Ty" ? "own" : ""}`} key={message.id}>
              <div className="message-meta">
                <span>{message.author}</span>
                <time>{message.time}</time>
              </div>
              <p>{message.text}</p>
            </article>
          ))}

          {healthError ? <p className="connection-note">Szczegoly polaczenia API: {healthError}</p> : null}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <label htmlFor="message">Wiadomosc</label>
          <div className="composer-row">
            <input
              id="message"
              name="message"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Napisz wiadomosc..."
              value={draft}
            />
            <button type="submit">Wyslij</button>
          </div>
        </form>
      </section>
    </main>
  );
}
