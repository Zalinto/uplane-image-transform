import ImageUpload from "../../../components/ImageUpload";
import ImageGallery from "../../../components/ImageGallery";
import { notFound } from "next/navigation";

export default async function ImageTransformPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const allowedPageId = process.env.ALLOWED_PAGE_ID;

  if (id !== allowedPageId) {
    notFound();
  }

  return (
    <main className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden flex flex-col lg:flex-row">
      <div className="w-full lg:w-[40%] h-full border-b lg:border-b-0 lg:border-r border-white/10 bg-black/20 overflow-y-auto">
        <div className="p-6">
          <ImageGallery />
        </div>
      </div>

      <div className="w-full lg:w-[60%] h-full overflow-y-auto relative">
        <div className="min-h-full flex items-center justify-center p-6">
          <ImageUpload pageId={id} />
        </div>
      </div>
    </main>
  );
}
