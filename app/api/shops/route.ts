import { NextResponse } from "next/server";
import { Shop } from "@/types";

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchHotpepperData(url: string): Promise<any> {
  const response = await fetch(url);
  console.log(url);
  if (!response.ok) {
    throw new APIError(
      response.status,
      `API request failed: ${response.statusText}`
    );
  }
  const data = await response.json();
  if (!data.results?.shop) {
    throw new APIError(404, "No shops found");
  }
  return data;
}

function handleError(error: unknown): NextResponse {
  console.error("Error:", error);
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }
  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = process.env.HOTPEPPER_API_KEY;
    if (!key) {
      throw new APIError(500, "API key is not set");
    }

    // クエリパラメータからページ番号と1ページあたりの件数を取得（デフォルトは1ページ、5件）
    const page = parseInt(searchParams.get("page") || "1", 10);
    const count = parseInt(searchParams.get("count") || "10", 10);
    const start = (page - 1) * count;

    const query = new URLSearchParams({
      key,
      format: "json",
      large_area: searchParams.get("large_area") || "Z098",
      count: count.toString(),
      start: start.toString(),
    });

    const keyword = searchParams.get("keyword");
    if (keyword) query.set("keyword", keyword);

    const url = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${query.toString()}`;
    const data = await fetchHotpepperData(url);

    // 全件数（available）の取得。レスポンスに含まれる場合
    const available = parseInt(data.results.available, 10) || 0;
    const nextPage = (start + count) < available ? page + 1 : null;

    // 次ページのURLを生成
    const baseUrl = request.url.split('?')[0];
    const nextUrl = nextPage
      ? `${baseUrl}?${new URLSearchParams({
          ...Object.fromEntries(searchParams),
          page: nextPage.toString(),
        }).toString()}`
      : null;

    return NextResponse.json({
      shops: data.results.shop as Shop[],
      total: available,
      currentPage: page,
      nextPage,
      nextUrl,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
