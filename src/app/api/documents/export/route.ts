import { NextResponse } from "next/server";
import { exportToDocx, exportToHtml, exportToMarkdown } from "@/lib/export";

export async function POST(req: Request) {
  try {
    const { documentId, title, content, format } = await req.json();

    if (!title || !content || !format) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "DOCX":
        buffer = await exportToDocx(title, content);
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
        break;

      case "HTML":
        const html = exportToHtml(title, content);
        return new NextResponse(html, {
          headers: {
            "Content-Type": "text/html",
            "Content-Disposition": `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, "_")}.html"`,
          },
        });

      case "MARKDOWN":
        const md = exportToMarkdown(title, content);
        return new NextResponse(md, {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, "_")}.md"`,
          },
        });

      case "PDF":
      default:
        const htmlContent = exportToHtml(title, content);
        return new NextResponse(
          `<script>window.print()</script>${htmlContent}`,
          {
            headers: {
              "Content-Type": "text/html",
              "Content-Disposition": `inline; filename="${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
            },
          }
        );
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export document" },
      { status: 500 }
    );
  }
}
