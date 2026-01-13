import ImageUpload from "./components/ImageUpload";
import { notFound } from "next/navigation";

export default async function ImageTransformPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const allowedPageId = process.env.ALLOWED_PAGE_ID;

  if (id !== allowedPageId) {
    notFound();
  }

  return <ImageUpload pageId={id} />;
}
