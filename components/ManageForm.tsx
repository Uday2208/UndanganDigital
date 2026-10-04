"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Plus, Save, Trash2 } from "lucide-react";
import type { PublicFamily, PublicGalleryItem, PublicWedding } from "@/lib/types";

interface ManageFormProps {
  secretKey: string;
  wedding: PublicWedding;
  initialGallery: PublicGalleryItem[];
  initialFamilies: PublicFamily[];
}

export function ManageForm({ secretKey, wedding, initialGallery, initialFamilies }: ManageFormProps) {
  const [formData, setFormData] = useState({
    groomName: wedding.groomName,
    groomFullName: wedding.groomFullName,
    groomParents: wedding.groomParents,
    groomPhoto: wedding.groomPhoto || "",
    brideName: wedding.brideName,
    brideFullName: wedding.brideFullName,
    brideParents: wedding.brideParents,
    bridePhoto: wedding.bridePhoto || "",
    coverImage: wedding.coverImage || "",
    quote: wedding.quote || "",
    quoteSource: wedding.quoteSource || "",
    weddingDate: wedding.weddingDate,
    akadDate: wedding.akadDate,
    receptionDate: wedding.receptionDate,
    akadTime: wedding.akadTime,
    receptionTime: wedding.receptionTime,
    receptionEndTime: wedding.receptionEndTime || "",
    timezone: wedding.timezone || "Asia/Jakarta",
    familyTitle: wedding.familyTitle || "Turut Mengundang",
    venueName: wedding.venueName,
    venueAddress: wedding.venueAddress,
    mapsUrl: wedding.mapsUrl || "",
    bankName: wedding.bankName || "",
    bankAccountNumber: wedding.bankAccountNumber || "",
    bankAccountHolder: wedding.bankAccountHolder || "",
    ewalletName: wedding.ewalletName || "",
    ewalletNumber: wedding.ewalletNumber || "",
    ewalletHolder: wedding.ewalletHolder || "",
    qrisImage: wedding.qrisImage || "",
    musicUrl: wedding.musicUrl || "",
    musicTitle: wedding.musicTitle || "",
  });

  const [gallery, setGallery] = useState<PublicGalleryItem[]>(initialGallery);
  const [families, setFamilies] = useState<PublicFamily[]>(initialFamilies);
  const [newImage, setNewImage] = useState({ imageUrl: "", altText: "" });
  const [newFamily, setNewFamily] = useState<{ side: "pria" | "wanita"; name: string; role: string }>({
    side: "pria",
    name: "",
    role: "",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/manage/wedding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: secretKey, ...formData }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setStatus({ kind: "success", text: "Data berhasil disimpan ke database!" });
      } else {
        setStatus({ kind: "error", text: json.message || "Gagal menyimpan data." });
      }
    } catch {
      setStatus({ kind: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddGallery(e: FormEvent) {
    e.preventDefault();
    if (!newImage.imageUrl.trim() || !newImage.altText.trim()) return;

    try {
      const response = await fetch("/api/manage/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: secretKey,
          imageUrl: newImage.imageUrl.trim(),
          altText: newImage.altText.trim(),
        }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setGallery((prev) => [...prev, json.data]);
        setNewImage({ imageUrl: "", altText: "" });
      } else {
        alert(json.message || "Gagal menambah gambar.");
      }
    } catch {
      alert("Gagal koneksi server.");
    }
  }

  async function handleDeleteGallery(id: number) {
    if (!confirm("Hapus gambar ini dari galeri?")) return;

    try {
      const response = await fetch("/api/manage/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: secretKey, id }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setGallery((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(json.message || "Gagal menghapus.");
      }
    } catch {
      alert("Gagal koneksi server.");
    }
  }

  async function handleAddFamily(e: FormEvent) {
    e.preventDefault();
    if (!newFamily.name.trim() || !newFamily.role.trim()) return;

    try {
      const response = await fetch("/api/manage/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: secretKey,
          side: newFamily.side,
          name: newFamily.name.trim(),
          role: newFamily.role.trim(),
        }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setFamilies((prev) => [...prev, json.data]);
        setNewFamily({ side: "pria", name: "", role: "" });
      } else {
        alert(json.message || "Gagal menambah anggota keluarga.");
      }
    } catch {
      alert("Gagal koneksi server.");
    }
  }

  async function handleDeleteFamily(id: number) {
    if (!confirm("Hapus anggota keluarga ini?")) return;

    try {
      const response = await fetch("/api/manage/family", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: secretKey, id }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setFamilies((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(json.message || "Gagal menghapus.");
      }
    } catch {
      alert("Gagal koneksi server.");
    }
  }

  const fieldClass =
    "mt-1.5 block w-full rounded-sm border border-mist/30 bg-ink px-4 py-2.5 text-sm text-cream placeholder:text-mist/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section Mempelai Pria */}
        <fieldset className="border border-gold/30 p-6 rounded-sm space-y-4">
          <legend className="px-2 font-serif text-xl text-gold-light">Mempelai Pria</legend>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Nama Panggilan</label>
            <input
              type="text"
              value={formData.groomName}
              onChange={(e) => handleChange("groomName", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Nama Lengkap</label>
            <input
              type="text"
              value={formData.groomFullName}
              onChange={(e) => handleChange("groomFullName", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Nama Orang Tua</label>
            <input
              type="text"
              value={formData.groomParents}
              onChange={(e) => handleChange("groomParents", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Foto Mempelai Pria (URL/Path)</label>
            <input
              type="text"
              value={formData.groomPhoto}
              onChange={(e) => handleChange("groomPhoto", e.target.value)}
              className={fieldClass}
              placeholder="/images/groom.jpg"
            />
          </div>
        </fieldset>

        {/* Section Mempelai Wanita */}
        <fieldset className="border border-gold/30 p-6 rounded-sm space-y-4">
          <legend className="px-2 font-serif text-xl text-gold-light">Mempelai Wanita</legend>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Nama Panggilan</label>
            <input
              type="text"
              value={formData.brideName}
              onChange={(e) => handleChange("brideName", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Nama Lengkap</label>
            <input
              type="text"
              value={formData.brideFullName}
              onChange={(e) => handleChange("brideFullName", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Nama Orang Tua</label>
            <input
              type="text"
              value={formData.brideParents}
              onChange={(e) => handleChange("brideParents", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Foto Mempelai Wanita (URL/Path)</label>
            <input
              type="text"
              value={formData.bridePhoto}
              onChange={(e) => handleChange("bridePhoto", e.target.value)}
              className={fieldClass}
              placeholder="/images/bride.jpg"
            />
          </div>
        </fieldset>

        {/* Section Waktu & Lokasi Acara */}
        <fieldset className="border border-gold/30 p-6 rounded-sm space-y-4">
          <legend className="px-2 font-serif text-xl text-gold-light">Tanggal & Waktu Acara</legend>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-mist">Tanggal Akad Nikah</label>
              <input
                type="date"
                value={formData.akadDate}
                onChange={(e) => handleChange("akadDate", e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-mist">Tanggal Resepsi</label>
              <input
                type="date"
                value={formData.receptionDate}
                onChange={(e) => handleChange("receptionDate", e.target.value)}
                className={fieldClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Jam Akad</label>
              <input
                type="text"
                value={formData.akadTime}
                onChange={(e) => handleChange("akadTime", e.target.value)}
                className={fieldClass}
                placeholder="08:00"
                required
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Jam Resepsi</label>
              <input
                type="text"
                value={formData.receptionTime}
                onChange={(e) => handleChange("receptionTime", e.target.value)}
                className={fieldClass}
                placeholder="11:00"
                required
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Jam Selesai</label>
              <input
                type="text"
                value={formData.receptionEndTime}
                onChange={(e) => handleChange("receptionEndTime", e.target.value)}
                className={fieldClass}
                placeholder="14:00"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Nama Tempat / Gedung</label>
            <input
              type="text"
              value={formData.venueName}
              onChange={(e) => handleChange("venueName", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={formData.venueAddress}
              onChange={(e) => handleChange("venueAddress", e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Link Google Maps (https://...)</label>
            <input
              type="url"
              value={formData.mapsUrl}
              onChange={(e) => handleChange("mapsUrl", e.target.value)}
              className={fieldClass}
            />
          </div>
        </fieldset>

        {/* Section Judul Keluarga */}
        <fieldset className="border border-gold/30 p-6 rounded-sm space-y-4">
          <legend className="px-2 font-serif text-xl text-gold-light">Section &quot;Turut Mengundang&quot;</legend>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Judul Section Keluarga</label>
            <input
              type="text"
              value={formData.familyTitle}
              onChange={(e) => handleChange("familyTitle", e.target.value)}
              className={fieldClass}
              placeholder="Turut Mengundang"
              required
            />
          </div>
        </fieldset>

        {/* Section Rekening & Hadiah */}
        <fieldset className="border border-gold/30 p-6 rounded-sm space-y-4">
          <legend className="px-2 font-serif text-xl text-gold-light">Hadiah & Rekening</legend>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Nama Bank</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                className={fieldClass}
                placeholder="BCA"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">No Rekening</label>
              <input
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Atas Nama</label>
              <input
                type="text"
                value={formData.bankAccountHolder}
                onChange={(e) => handleChange("bankAccountHolder", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">E-Wallet</label>
              <input
                type="text"
                value={formData.ewalletName}
                onChange={(e) => handleChange("ewalletName", e.target.value)}
                className={fieldClass}
                placeholder="GoPay"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">No E-Wallet</label>
              <input
                type="text"
                value={formData.ewalletNumber}
                onChange={(e) => handleChange("ewalletNumber", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Atas Nama</label>
              <input
                type="text"
                value={formData.ewalletHolder}
                onChange={(e) => handleChange("ewalletHolder", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">QRIS Image Path (Opsional)</label>
            <input
              type="text"
              value={formData.qrisImage}
              onChange={(e) => handleChange("qrisImage", e.target.value)}
              className={fieldClass}
              placeholder="/images/qris.jpg"
            />
          </div>
        </fieldset>

        {/* Section Cover & Quote */}
        <fieldset className="border border-gold/30 p-6 rounded-sm space-y-4">
          <legend className="px-2 font-serif text-xl text-gold-light">Sampul & Kutipan</legend>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Cover Image Path</label>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => handleChange("coverImage", e.target.value)}
              className={fieldClass}
              placeholder="/images/cover.jpg"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Kutipan / Ayat Quote</label>
            <textarea
              rows={3}
              value={formData.quote}
              onChange={(e) => handleChange("quote", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mist">Sumber Kutipan (QS. ...)</label>
            <input
              type="text"
              value={formData.quoteSource}
              onChange={(e) => handleChange("quoteSource", e.target.value)}
              className={fieldClass}
            />
          </div>
        </fieldset>

        {status ? (
          <div
            className={`p-4 text-center text-sm font-medium rounded-sm ${
              status.kind === "success" ? "bg-gold/20 text-gold-light border border-gold" : "bg-red-900/30 text-red-300 border border-red-800"
            }`}
          >
            {status.text}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-gold bg-gold px-7 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-light disabled:opacity-50"
        >
          {saving ? (
            "Menyimpan..."
          ) : (
            <>
              <Save className="size-4" /> Simpan Perubahan Utama
            </>
          )}
        </button>
      </form>

      {/* Section Kelola Anggota Keluarga */}
      <div className="border border-gold/30 p-6 rounded-sm space-y-6">
        <h3 className="font-serif text-2xl text-gold-light">Kelola Anggota Keluarga (&quot;{formData.familyTitle}&quot;)</h3>

        <div className="space-y-3">
          {families.map((item) => (
            <div key={item.id} className="flex items-center justify-between border border-gold/20 p-3 rounded bg-ink">
              <div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-gold/20 text-gold-light mr-2">
                  {item.side === "pria" ? "Pria" : "Wanita"}
                </span>
                <span className="font-medium text-cream">{item.name}</span>
                <span className="text-xs text-mist block sm:inline sm:ml-2">({item.role})</span>
              </div>
              <button
                type="button"
                onClick={() => void handleDeleteFamily(item.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs text-red-400 border border-red-900/50 hover:bg-red-900/30 rounded"
              >
                <Trash2 className="size-3.5" /> Hapus
              </button>
            </div>
          ))}
        </div>

        {/* Form Tambah Anggota Keluarga */}
        <form onSubmit={handleAddFamily} className="border-t border-gold/20 pt-6 space-y-3">
          <h4 className="text-sm uppercase tracking-wider text-gold">Tambah Anggota Keluarga Baru</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Pihak</label>
              <select
                value={newFamily.side}
                onChange={(e) => setNewFamily((p) => ({ ...p, side: e.target.value as "pria" | "wanita" }))}
                className={fieldClass}
              >
                <option value="pria">Pria</option>
                <option value="wanita">Wanita</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Bapak Ahmad"
                value={newFamily.name}
                onChange={(e) => setNewFamily((p) => ({ ...p, name: e.target.value }))}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mist">Peran / Hubungan</label>
              <input
                type="text"
                placeholder="Paman Mempelai Pria"
                value={newFamily.role}
                onChange={(e) => setNewFamily((p) => ({ ...p, role: e.target.value }))}
                className={fieldClass}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs uppercase tracking-wider font-semibold rounded border border-gold/60 text-gold-light hover:bg-gold hover:text-ink transition-colors"
          >
            <Plus className="size-4" /> Tambah Ke Daftar Keluarga
          </button>
        </form>
      </div>

      {/* Section Kelola Galeri */}
      <div className="border border-gold/30 p-6 rounded-sm space-y-6">
        <h3 className="font-serif text-2xl text-gold-light">Kelola Galeri Foto</h3>

        <div className="grid grid-cols-2 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="relative group border border-gold/20 p-2 rounded bg-ink">
              <div className="relative aspect-square w-full overflow-hidden rounded">
                <Image src={item.imageUrl} alt={item.altText} fill className="object-cover" />
              </div>
              <p className="mt-2 text-xs text-mist truncate">{item.altText}</p>
              <button
                type="button"
                onClick={() => void handleDeleteGallery(item.id)}
                className="mt-2 flex items-center justify-center gap-1 w-full py-1 text-xs text-red-400 border border-red-900/50 hover:bg-red-900/30 rounded"
              >
                <Trash2 className="size-3.5" /> Hapus
              </button>
            </div>
          ))}
        </div>

        {/* Form Tambah Galeri */}
        <form onSubmit={handleAddGallery} className="border-t border-gold/20 pt-6 space-y-3">
          <h4 className="text-sm uppercase tracking-wider text-gold">Tambah Foto Baru</h4>
          <input
            type="text"
            placeholder="URL Gambar (mis: /images/gallery-5.jpg)"
            value={newImage.imageUrl}
            onChange={(e) => setNewImage((p) => ({ ...p, imageUrl: e.target.value }))}
            className={fieldClass}
            required
          />
          <input
            type="text"
            placeholder="Deskripsi / Alt Text"
            value={newImage.altText}
            onChange={(e) => setNewImage((p) => ({ ...p, altText: e.target.value }))}
            className={fieldClass}
            required
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs uppercase tracking-wider font-semibold rounded border border-gold/60 text-gold-light hover:bg-gold hover:text-ink transition-colors"
          >
            <Plus className="size-4" /> Tambah Foto Ke Galeri
          </button>
        </form>
      </div>
    </div>
  );
}
