import { Merchant } from "@/types/merchant";

export async function fetchMerchants(token?: string): Promise<Merchant[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/merchants`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Erreur lors du chargement des commerçants");
  return await res.json();
}
