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
        <p className="text-gray-600 dark:text-neutral-400 text-base leading-relaxed break-keep">
          아이디어를 코드로 실현하는 개발자입니다. <br />
          문제를 해결하고 가치 있는 사용자 경험을 만드는 것에 열정을 가지고 있습니다.
        </p>
      </div>
    </main>
  );
}
