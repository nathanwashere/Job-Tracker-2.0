import { useEffect, useRef, useState } from "react";
import { getResumeFile } from "../api/resume";
import type { Resume } from "../types/resumeType";
import "../styles/ResumeLibrary.css";

const PDF_TYPE = "application/pdf";
const THUMBNAIL_WIDTH = 640; // px, wide enough to stay sharp on high-DPI screens

const BADGES: Record<string, { label: string; className: string }> = {
  [PDF_TYPE]: { label: "PDF", className: "pdf" },
  "application/msword": { label: "DOC", className: "word" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    label: "DOCX",
    className: "word",
  },
};

// pdfjs is a big library: only download it when a thumbnail is actually needed
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfjs() {
  pdfjsPromise ??= Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.mjs?url"),
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  });
  return pdfjsPromise;
}

async function renderFirstPage(resumeId: string) {
  const file = await getResumeFile(resumeId, "preview");
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });

  try {
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const scale = THUMBNAIL_WIDTH / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvas, viewport }).promise;

    const image = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!image) throw new Error("Could not create the thumbnail image");
    return URL.createObjectURL(image);
  } finally {
    await loadingTask.destroy();
  }
}

// A resume's file never changes, so each one is only downloaded and drawn once
const thumbnails = new Map<string, Promise<string>>();

function getThumbnail(resumeId: string) {
  let thumbnail = thumbnails.get(resumeId);
  if (!thumbnail) {
    thumbnail = renderFirstPage(resumeId).catch((error) => {
      thumbnails.delete(resumeId); // try again next time
      throw error;
    });
    thumbnails.set(resumeId, thumbnail);
  }
  return thumbnail;
}

export default function ResumeThumbnail({ resume }: { resume: Resume }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const isPdf = resume.mimeType === PDF_TYPE;
  const badge = BADGES[resume.mimeType];

  useEffect(() => {
    const container = containerRef.current;
    if (!isPdf || !container) return;

    let cancelled = false;
    // Wait until the card is close to the screen before downloading its file
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        getThumbnail(resume._id)
          .then((url) => {
            if (!cancelled) setImageUrl(url);
          })
          // The placeholder stays, so the card still looks fine
          .catch(console.error);
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [resume._id, isPdf]);

  return (
    <div ref={containerRef} className="resume-thumb">
      {badge && (
        <div className={`resume-thumb-badge ${badge.className}`}>
          {badge.label}
        </div>
      )}
      <div className={`resume-thumb-page${imageUrl ? " has-image" : ""}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`First page of ${resume.name}`}
            className="resume-thumb-image"
          />
        ) : (
          <>
            <div className="resume-thumb-title" />
            <div className="resume-thumb-subtitle" />
            <div className="resume-thumb-divider" />
            {/* Line widths vary per line, so they stay inline */}
            {[100, 93, 87, 100, 78, 100, 90, 72].map((w, i) => (
              <div
                key={i}
                className="resume-thumb-line"
                style={{ width: `${w}%` }}
              />
            ))}
            <div className="resume-thumb-gap" />
            {[100, 88, 95].map((w, i) => (
              <div
                key={i}
                className="resume-thumb-line"
                style={{ width: `${w}%` }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
