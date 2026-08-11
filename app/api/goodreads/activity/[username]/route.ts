import { NextResponse } from "next/server";
import { cacheControlHeader } from "@/lib/cache";
import { parsePeriod } from "@/lib/period";
import {
  CACHE_REVALIDATE,
  getGoodreadsActivity,
  isValidGoodreadsUserId,
  ProviderError,
} from "@/providers/goodreads";
import type { ApiErrorBody } from "@/types";

/** 24 hours — must be a literal for Next.js segment config. */
export const revalidate = 86400;

type RouteContext = {
  params: Promise<{ username: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { username } = await context.params;
  const period = parsePeriod(new URL(request.url).searchParams.get("period"), "goodreads");

  if (!username || !isValidGoodreadsUserId(username)) {
    const body: ApiErrorBody = {
      error: "USER_NOT_FOUND",
      message: "Invalid Goodreads user ID.",
    };
    return NextResponse.json(body, { status: 404 });
  }

  try {
    const data = await getGoodreadsActivity(username, period);
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": cacheControlHeader(CACHE_REVALIDATE),
      },
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      const body: ApiErrorBody = {
        error: error.code,
        message: error.message,
      };
      return NextResponse.json(body, {
        status: error.status,
        headers: {
          "Cache-Control":
            error.code === "USER_NOT_FOUND" || error.code === "PRIVATE_PROFILE"
              ? cacheControlHeader(3600)
              : "no-store",
        },
      });
    }

    const body: ApiErrorBody = {
      error: "UNKNOWN",
      message: "An unexpected error occurred.",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
