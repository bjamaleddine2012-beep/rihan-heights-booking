import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// GET /api/analytics — Return booking analytics data
export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb.collection("bookings").get();
    const bookings = snapshot.docs.map((doc) => doc.data());

    // Status breakdown
    const statusCounts = { pending: 0, approved: 0, rejected: 0 };
    const nationalityMap: Record<string, number> = {};
    const dailyMap: Record<string, { total: number; approved: number; rejected: number; pending: number }> = {};
    const hourMap: Record<number, number> = {};
    const guestDistribution: Record<number, number> = {};
    let totalGuests = 0;

    for (const b of bookings) {
      // Status
      const status = b.status as keyof typeof statusCounts;
      if (statusCounts[status] !== undefined) statusCounts[status]++;

      // Nationality
      if (b.nationality) {
        nationalityMap[b.nationality] = (nationalityMap[b.nationality] || 0) + 1;
      }

      // Daily bookings (last 30 days)
      if (b.createdAt) {
        const day = b.createdAt.slice(0, 10); // "YYYY-MM-DD"
        if (!dailyMap[day]) dailyMap[day] = { total: 0, approved: 0, rejected: 0, pending: 0 };
        dailyMap[day].total++;
        if (dailyMap[day][status] !== undefined) dailyMap[day][status]++;
      }

      // Time distribution
      if (b.time) {
        const hour = parseInt(b.time.split(":")[0]);
        if (!isNaN(hour)) hourMap[hour] = (hourMap[hour] || 0) + 1;
      }

      // Guest count
      const guests = Number(b.guests) || 1;
      totalGuests += guests;
      guestDistribution[guests] = (guestDistribution[guests] || 0) + 1;
    }

    // Top nationalities (top 10)
    const topNationalities = Object.entries(nationalityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Daily data sorted by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

    const dailyData = Object.entries(dailyMap)
      .filter(([date]) => date >= cutoff)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({ date, ...data }));

    // Busiest hours
    const busiestHours = Object.entries(hourMap)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([hour, count]) => ({ hour: Number(hour), count }));

    // Approval rate
    const decided = statusCounts.approved + statusCounts.rejected;
    const approvalRate = decided > 0 ? Math.round((statusCounts.approved / decided) * 100) : 0;

    return NextResponse.json({
      total: bookings.length,
      statusCounts,
      approvalRate,
      averageGuests: bookings.length > 0 ? Math.round((totalGuests / bookings.length) * 10) / 10 : 0,
      topNationalities,
      dailyData,
      busiestHours,
      guestDistribution: Object.entries(guestDistribution)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([guests, count]) => ({ guests: Number(guests), count })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
