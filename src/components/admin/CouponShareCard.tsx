"use client";

import { useEffect, useRef, useState } from "react";
import { X, Copy, Download, Share2, Check, ImageDown } from "lucide-react";

interface CouponShareCardProps {
  coupon: {
    code: string;
    percent_off: number;
    min_order_value: number;
    max_uses: number | null;
    expires_at: string | null;
  };
  onClose: () => void;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "pakauraa.com").replace(/^https?:\/\//, "").replace(/\/$/, "");
const SIZE = 1080;

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCard(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, coupon: CouponShareCardProps["coupon"]) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  // Background
  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, "#0a0908");
  bg.addColorStop(1, "#171009");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const glow = ctx.createRadialGradient(SIZE / 2, SIZE * 0.35, 40, SIZE / 2, SIZE * 0.35, SIZE * 0.7);
  glow.addColorStop(0, "rgba(201,168,76,0.14)");
  glow.addColorStop(1, "rgba(201,168,76,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Outer frame
  ctx.strokeStyle = "rgba(201,168,76,0.35)";
  ctx.lineWidth = 2;
  roundedRect(ctx, 36, 36, SIZE - 72, SIZE - 72, 4);
  ctx.stroke();
  ctx.strokeStyle = "rgba(201,168,76,0.15)";
  ctx.lineWidth = 1;
  roundedRect(ctx, 52, 52, SIZE - 104, SIZE - 104, 4);
  ctx.stroke();

  // Logo
  let cursorY = 130;
  if (logo) {
    const lw = 130;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, SIZE / 2 - lw / 2, cursorY, lw, lh);
    cursorY += lh + 22;
  } else {
    ctx.fillStyle = "#d4af37";
    ctx.font = "600 34px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("PakAuraa", SIZE / 2, cursorY + 20);
    cursorY += 60;
  }

  ctx.fillStyle = "rgba(212,175,55,0.7)";
  ctx.font = "13px Arial";
  ctx.textAlign = "center";
  ctx.save();
  ctx.letterSpacing = "6px";
  ctx.fillText("LUXURY PERFUMES", SIZE / 2 + 3, cursorY);
  ctx.restore();

  // Eyebrow
  ctx.fillStyle = "rgba(232,226,212,0.55)";
  ctx.font = "15px Arial";
  ctx.save();
  ctx.letterSpacing = "5px";
  ctx.fillText("EXCLUSIVE OFFER", SIZE / 2 + 2, 400);
  ctx.restore();

  // Big percent
  const gold = ctx.createLinearGradient(SIZE / 2 - 260, 0, SIZE / 2 + 260, 0);
  gold.addColorStop(0, "#a8893a");
  gold.addColorStop(1, "#f0d78c");
  ctx.fillStyle = gold;
  ctx.font = "600 150px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(`${coupon.percent_off}% OFF`, SIZE / 2, 520);

  ctx.fillStyle = "rgba(232,226,212,0.75)";
  ctx.font = "26px Georgia, serif";
  ctx.fillText("on your next order", SIZE / 2, 565);

  // Coupon code ticket
  const boxW = 700;
  const boxH = 120;
  const boxX = SIZE / 2 - boxW / 2;
  const boxY = 630;
  ctx.strokeStyle = "rgba(212,175,55,0.6)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  roundedRect(ctx, boxX, boxY, boxW, boxH, 6);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#f5f0e6";
  ctx.font = "600 58px Georgia, serif";
  ctx.textAlign = "center";
  ctx.save();
  ctx.letterSpacing = "6px";
  ctx.fillText(coupon.code, SIZE / 2 + 6, boxY + 78);
  ctx.restore();

  // Conditions
  const parts: string[] = [];
  if (coupon.min_order_value > 0) parts.push(`Min. order PKR ${coupon.min_order_value.toLocaleString()}`);
  if (coupon.expires_at) parts.push(`Valid until ${new Date(coupon.expires_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`);
  if (coupon.max_uses) parts.push(`Limited to ${coupon.max_uses} uses`);
  ctx.fillStyle = "rgba(232,226,212,0.6)";
  ctx.font = "20px Arial";
  ctx.fillText(parts.length ? parts.join("   ·   ") : "No minimum order required", SIZE / 2, boxY + boxH + 60);

  // Footer
  ctx.strokeStyle = "rgba(212,175,55,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SIZE / 2 - 60, SIZE - 150);
  ctx.lineTo(SIZE / 2 + 60, SIZE - 150);
  ctx.stroke();

  ctx.fillStyle = "#d4af37";
  ctx.font = "22px Arial";
  ctx.save();
  ctx.letterSpacing = "3px";
  ctx.fillText(`SHOP NOW AT ${SITE_URL.toUpperCase()}`, SIZE / 2 + 2, SIZE - 105);
  ctx.restore();
}

export default function CouponShareCard({ coupon, onClose }: CouponShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logo = new Image();
    logo.onload = () => drawCard(ctx, logo, coupon);
    logo.onerror = () => drawCard(ctx, null, coupon);
    logo.src = "/logo.png";
  }, [coupon]);

  useEffect(() => {
    setCanShareFiles(typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [new File([], "test.png", { type: "image/png" })] }));
  }, []);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus((cur) => (cur === msg ? null : cur)), 2200);
  };

  const getBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => canvasRef.current?.toBlob((b) => resolve(b), "image/png"));

  const copyCode = async () => {
    await navigator.clipboard.writeText(coupon.code);
    flash("Code copied!");
  };

  const downloadImage = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pakauraa-coupon-${coupon.code}.png`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Downloaded!");
  };

  const copyImage = async () => {
    try {
      const blob = await getBlob();
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flash("Image copied!");
    } catch {
      flash("Copy not supported — try Download instead.");
    }
  };

  const shareImage = async () => {
    try {
      const blob = await getBlob();
      if (!blob) return;
      const file = new File([blob], `pakauraa-coupon-${coupon.code}.png`, { type: "image/png" });
      await navigator.share({
        files: [file],
        title: `${coupon.percent_off}% off at PakAuraa`,
        text: `Use code ${coupon.code} for ${coupon.percent_off}% off at PakAuraa!`,
      });
    } catch {
      // User cancelled the share sheet — not an error worth surfacing.
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] border border-gold/25 bg-charcoal p-6 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-muted hover:text-cream transition-colors">
          <X size={18} strokeWidth={1.5} />
        </button>

        <p className="text-[10px] text-gold tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
          Share Coupon
        </p>

        <canvas ref={canvasRef} className="w-full h-auto border border-gold/15 mb-5" />

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={copyCode} className="flex items-center justify-center gap-2 text-[11px] text-cream border border-gold/25 px-3 py-2.5 tracking-wider uppercase hover:bg-gold/10 transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
            <Copy size={13} strokeWidth={1.5} /> Copy Code
          </button>
          <button onClick={downloadImage} className="flex items-center justify-center gap-2 text-[11px] text-cream border border-gold/25 px-3 py-2.5 tracking-wider uppercase hover:bg-gold/10 transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
            <Download size={13} strokeWidth={1.5} /> Download
          </button>
          <button onClick={copyImage} className="flex items-center justify-center gap-2 text-[11px] text-cream border border-gold/25 px-3 py-2.5 tracking-wider uppercase hover:bg-gold/10 transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
            <ImageDown size={13} strokeWidth={1.5} /> Copy Image
          </button>
          {canShareFiles ? (
            <button onClick={shareImage} className="flex items-center justify-center gap-2 text-[11px] text-obsidian bg-gold px-3 py-2.5 tracking-wider uppercase hover:bg-gold/90 transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
              <Share2 size={13} strokeWidth={1.5} /> Share
            </button>
          ) : (
            <button onClick={downloadImage} className="flex items-center justify-center gap-2 text-[11px] text-obsidian bg-gold px-3 py-2.5 tracking-wider uppercase hover:bg-gold/90 transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
              <Download size={13} strokeWidth={1.5} /> Save Card
            </button>
          )}
        </div>

        {status && (
          <p className="flex items-center gap-1.5 text-[11px] text-green-400 mt-3" style={{ fontFamily: "var(--font-body-family)" }}>
            <Check size={12} strokeWidth={2} /> {status}
          </p>
        )}
      </div>
    </div>
  );
}
