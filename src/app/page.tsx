export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 transition-all">
        {/* 아바타 아이콘 */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold shadow-md">
          신
        </div>

        {/* 이름 */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          신예헌
        </h1>

        {/* 소개글 */}
        <p className="text-gray-600 dark:text-neutral-400 text-base leading-relaxed">
          안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다.
        </p>
      </div>
    </main>
  );
}
