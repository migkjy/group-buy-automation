import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl font-bold text-gray-400">404</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-gray-500 mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/deals"
          className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          공구 목록 보기
        </Link>
      </div>
    </div>
  );
}
