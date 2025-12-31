"use client";

import { useState } from "react";

const StarButton = ({ filled, onClick }: { filled: boolean; onClick: () => void }) => (
  <button onClick={onClick} className="text-4xl transition-transform hover:scale-110">
    {filled ? "⭐" : "☆"}
  </button>
);

export default function ReviewPage() {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState<"rate" | "redirect" | "feedback">("rate");
  const [feedback, setFeedback] = useState("");

  const handleRate = (stars: number) => {
    setRating(stars);
    if (stars >= 4) {
      setStep("redirect");
    } else {
      setStep("feedback");
    }
  };

  const businessName = "Кофейня «Бодрое утро»";

  if (step === "redirect") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Спасибо!</h1>
          <p className="text-gray-600 mb-6">
            Мы рады, что вам понравилось! Поделитесь своим опытом на Яндекс Картах — это поможет другим найти нас.
          </p>

          <div className="space-y-3">
            <a
              href="https://yandex.ru/maps"
              target="_blank"
              className="block w-full bg-yellow-400 text-gray-900 px-6 py-4 rounded-xl font-semibold hover:bg-yellow-500 transition"
            >
              🗺️ Оставить отзыв на Яндекс Картах
            </a>
            <a
              href="https://2gis.ru"
              target="_blank"
              className="block w-full bg-green-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-600 transition"
            >
              📍 Оставить отзыв на 2ГИС
            </a>
          </div>

          <p className="text-gray-400 text-sm mt-6">
            Это займёт всего 30 секунд ❤️
          </p>
        </div>
      </div>
    );
  }

  if (step === "feedback") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">💬</div>
            <h1 className="text-xl font-bold text-gray-900">Расскажите, что пошло не так</h1>
            <p className="text-gray-600 text-sm">
              Мы хотим стать лучше. Ваш отзыв поможет нам исправить ситуацию.
            </p>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Опишите, что вам не понравилось..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 resize-none mb-4"
          />

          <button
            onClick={() => alert("Спасибо за обратную связь!")}
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Отправить
          </button>

          <p className="text-gray-400 text-sm mt-4 text-center">
            Ваш отзыв получит только руководство
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">☕</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{businessName}</h1>
        <p className="text-gray-600 mb-8">Как вам наш сервис?</p>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarButton
              key={star}
              filled={star <= rating}
              onClick={() => handleRate(star)}
            />
          ))}
        </div>

        <p className="text-gray-400 text-sm">Нажмите на звёздочку для оценки</p>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Сервис сбора отзывов{" "}
            <a href="/" className="text-indigo-600 hover:underline">Зацени</a>
          </p>
        </div>
      </div>
    </div>
  );
}
