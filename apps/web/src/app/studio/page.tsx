import { notFound } from "next/navigation";
import { StudioView } from "./StudioView";

export const metadata = { robots: { index: false, follow: false } };

export default async function StudioPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const params = await searchParams;
  return <StudioView glass={params.glass ?? "#8a5a3c"} name={params.name ?? "Ambra Nocturna"} caption={params.caption ?? "180 g"} view={params.view} backdrop={params.backdrop} flame={params.flame} />;
}
