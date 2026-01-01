import Logo, { Logo1, Logo2, Logo3, Logo4 } from "@/components/Logo";
import Link from "next/link";

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-indigo-600 hover:underline mb-8 inline-block">
          ← Назад
        </Link>

        <h1 className="text-3xl font-bold mb-8">Варианты логотипа Отзовик</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Option 1 */}
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-600">Вариант 1: Облачко + звезда</h2>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                <Logo variant={1} size={48} />
              </div>
              <div className="flex items-center gap-4 p-4 bg-indigo-600 rounded-lg">
                <Logo variant={1} size={48} showText={false} />
                <span className="font-bold text-white text-xl">Отзовик</span>
              </div>
              <div className="flex gap-4 items-center">
                <Logo1 size={64} />
                <Logo1 size={48} />
                <Logo1 size={32} />
                <Logo1 size={24} />
                <Logo1 size={16} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Облачко диалога со звездой внутри — отзывы + рейтинг
            </p>
          </div>

          {/* Option 2 */}
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-600">Вариант 2: О со звёздами</h2>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                <Logo variant={2} size={48} />
              </div>
              <div className="flex items-center gap-4 p-4 bg-indigo-600 rounded-lg">
                <Logo variant={2} size={48} showText={false} />
                <span className="font-bold text-white text-xl">Отзовик</span>
              </div>
              <div className="flex gap-4 items-center">
                <Logo2 size={64} />
                <Logo2 size={48} />
                <Logo2 size={32} />
                <Logo2 size={24} />
                <Logo2 size={16} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Буква О как орбита с вращающимися звёздами рейтинга
            </p>
          </div>

          {/* Option 3 */}
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-600">Вариант 3: Галочка + звезда</h2>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                <Logo variant={3} size={48} />
              </div>
              <div className="flex items-center gap-4 p-4 bg-indigo-600 rounded-lg">
                <Logo variant={3} size={48} showText={false} />
                <span className="font-bold text-white text-xl">Отзовик</span>
              </div>
              <div className="flex gap-4 items-center">
                <Logo3 size={64} />
                <Logo3 size={48} />
                <Logo3 size={32} />
                <Logo3 size={24} />
                <Logo3 size={16} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Галочка проверки + звезда — доверие и качество
            </p>
          </div>

          {/* Option 4 */}
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-600">Вариант 4: Бейдж</h2>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                <Logo variant={4} size={48} />
              </div>
              <div className="flex items-center gap-4 p-4 bg-indigo-600 rounded-lg">
                <Logo variant={4} size={48} showText={false} />
                <span className="font-bold text-white text-xl">Отзовик</span>
              </div>
              <div className="flex gap-4 items-center">
                <Logo4 size={64} />
                <Logo4 size={48} />
                <Logo4 size={32} />
                <Logo4 size={24} />
                <Logo4 size={16} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Компактный бейдж с буквой О и звездой
            </p>
          </div>
        </div>

        {/* Color palette */}
        <div className="mt-12 bg-white rounded-xl shadow p-8">
          <h2 className="text-lg font-semibold mb-4">Цветовая палитра</h2>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="w-20 h-20 rounded-lg bg-indigo-600 mb-2"></div>
              <div className="text-sm font-mono">#4F46E5</div>
              <div className="text-xs text-gray-500">Primary</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-lg bg-yellow-400 mb-2"></div>
              <div className="text-sm font-mono">#FBBF24</div>
              <div className="text-xs text-gray-500">Star</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-lg bg-gray-900 mb-2"></div>
              <div className="text-sm font-mono">#111827</div>
              <div className="text-xs text-gray-500">Text</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-lg bg-white border mb-2"></div>
              <div className="text-sm font-mono">#FFFFFF</div>
              <div className="text-xs text-gray-500">Background</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
