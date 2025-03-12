"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
// import { ThemeToggle } from "@/components/theme-toggle";

// Shop 型を定義
interface Shop {
  id: number;
  name: string;
  address: string;
  // genre: string;
}

export default function ShopList() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
//   const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // APIから店舗一覧を取得
  const fetchShops = async (page = 1): Promise<void> => {
    setLoading(true);
    setError(null);

    // page の値に基づいて start を計算する (例: 1ページあたり5件)
    const start: number = page * 10;
    console.log("page:", page, "start:", start);

    try {
      // APIルートへのリクエスト
      const response = await fetch(`/api/shops?page=${page}&count=10&start=${start}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data = await response.json();
      // サーバー側で返したオブジェクトを想定 ( { shops, total, currentPage, nextPage, nextUrl } )
      setShops(data.shops);
      setCurrentPage(data.currentPage);
    //   setNextUrl(data.nextUrl);
    } catch (err: any) {
      console.error("fetchShops error: ", err);
      setError(err.message ?? "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時に1ページ目を取得
  useEffect(() => {
    fetchShops();
  }, []);

  // 次へボタン押下時の動作
  const handleNext = () => {
    fetchShops(currentPage + 1);
  };
  const [keyword, setKeyword] = useState("");
 
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKeyword(value);
    // console.log(event);
    console.log(keyword);
  };
 
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log("button click", keyword);
  };
  return (
    <div className="mx-auto max-w-3xl p-4">
          <div className="flex items-start justify-center pt-36">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <form className="flex items-center space-x-4">
        <Input
          type="search"
          placeholder="検索..."
          onChange={handleInputChange}
          className="max-w-sm w-full"
        />
        <Button type="submit" onClick={handleButtonClick} className="max-w-sm">
          検索
        </Button>
      </form>
    </div>
      {/* <h2 className="text-2xl font-bold mb-6 text-center">
        店舗一覧 (現在のページ: {currentPage})
      </h2> */}

      {loading && <p className="text-blue-500">読み込み中...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
            {shops.map((shop) => (
              <li
                key={shop.id}
                className="flex flex-col justify-between rounded-lg bg-white shadow p-4"
              >
                <div>
                  <p className="text-gray-600 text-lg font-semibold mb-1">{shop.name}</p>
                  <p className="text-gray-600 text-sm">{shop.address}</p>
                  {/* <p className="text-gray-600 text-sm">{shop.genre}</p> */}
                </div>
              </li>
            ))}
          </ul>

          {/* ページ移動ボタン */}
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="rounded-md bg-blue-500 px-5 py-2 font-medium text-white hover:bg-blue-600 transition-colors"
            >
              次へ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
