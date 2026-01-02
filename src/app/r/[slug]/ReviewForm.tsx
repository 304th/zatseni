"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ReviewFormProps {
  businessId: string;
  yandexUrl: string | null;
  gisUrl: string | null;
}

export default function ReviewForm({ businessId, yandexUrl, gisUrl }: ReviewFormProps) {
  const searchParams = useSearchParams();
  const [rating, setRating] = useState(0);

  const requestId = searchParams.get("rid");

  // Track open on page load
  useEffect(() => {
    if (requestId) {
      fetch(`/api/requests/${requestId}/open`, { method: "POST" }).catch(() => {});
    }
  }, [requestId]);

  const [hoveredRating, setHoveredRating] = useState(0);
  const [step, setStep] = useState<"rate" | "positive" | "negative" | "thanks">("rate");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (selectedRating: number) => {
    setRating(selectedRating);

    // Track the rating
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, rating: selectedRating, requestId }),
      });
    } catch (e) {
      console.error("Failed to track rating", e);
    }

    if (selectedRating >= 4) {
      setStep("positive");
    } else {
      setStep("negative");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;

    setSubmitting(true);
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, rating, feedback, requestId }),
      });
      setStep("thanks");
    } catch (e) {
      console.error("Failed to submit feedback", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExternalClick = (platform: "yandex" | "gis") => {
    if (requestId) {
      fetch(`/api/requests/${requestId}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      }).catch(() => {});
    }
  };

  if (step === "rate") {
    return (
      <div>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-4xl transition-transform hover:scale-110 focus:outline-none"
            >
              {star <= (hoveredRating || rating) ? "⭐" : "☆"}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">Нажмите на звезду для оценки</p>
      </div>
    );
  }

  if (step === "positive") {
    return (
      <div className="space-y-4">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-xl font-semibold">Спасибо за высокую оценку!</h2>
        <p className="text-gray-600">
          Будем очень благодарны за отзыв на карте — это поможет другим найти нас
        </p>

        <div className="flex flex-col gap-3 mt-6">
          {yandexUrl && (
            <a
              href={`${yandexUrl.replace(/\/$/, "")}${yandexUrl.includes("?") ? "&" : "?"}add-review=true`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleExternalClick("yandex")}
              className="flex items-center justify-center gap-2 bg-yellow-400 text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-500 transition"
            >
              <span>📍</span> Оставить отзыв на Яндекс Картах
            </a>
          )}
          {gisUrl && (
            <a
              href={gisUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleExternalClick("gis")}
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition"
            >
              <span>📍</span> Оставить отзыв на 2ГИС
            </a>
          )}
        </div>

        {!yandexUrl && !gisUrl && (
          <p className="text-gray-500 text-sm">Спасибо за оценку!</p>
        )}
      </div>
    );
  }

  if (step === "negative") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Что пошло не так?</h2>
        <p className="text-gray-600 text-sm">
          Расскажите, что нам улучшить. Ваш отзыв останется конфиденциальным.
        </p>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Напишите ваши замечания..."
          className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <button
          onClick={handleFeedbackSubmit}
          disabled={submitting || !feedback.trim()}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {submitting ? "Отправка..." : "Отправить"}
        </button>
      </div>
    );
  }

  // thanks
  return (
    <div className="space-y-4">
      <div className="text-5xl mb-2">🙏</div>
      <h2 className="text-xl font-semibold">Спасибо за отзыв!</h2>
      <p className="text-gray-600">
        Мы обязательно учтём ваши замечания и станем лучше.
      </p>
    </div>
  );
}
