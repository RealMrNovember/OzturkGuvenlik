"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { Icon } from "@/components/icons";
import { Badge, Btn, Card, ErrorBox, Field, Input, Loading, Modal } from "@/components/panel/ui";

type Account = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialty: string;
  twoFactorEnabled: boolean;
};

export default function ProfilPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", specialty: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<Account>("/api/account");
      setAccount(data);
      setProfileForm({ name: data.name, email: data.email, phone: data.phone, specialty: data.specialty });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSaved(false);
    try {
      await api("/api/account", { method: "PATCH", body: JSON.stringify(profileForm) });
      setProfileSaved(true);
      await load();
    } catch (err) {
      setProfileError((err as Error).message);
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSaved(false);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Yeni şifreler eşleşmiyor");
      return;
    }
    setPwSaving(true);
    try {
      await api("/api/account/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      setPwSaved(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError((err as Error).message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-ink">
          <Icon name="users" className="h-5 w-5 text-brand" />
          Profilim
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Kendi hesap bilgilerinizi, şifrenizi ve iki adımlı doğrulama ayarınızı buradan yönetin.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      <Card title="Kişisel Bilgiler">
        <form onSubmit={saveProfile} className="space-y-4 p-5">
          {profileError && <ErrorBox message={profileError} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad Soyad">
              <Input
                required
                value={profileForm.name}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, name: e.target.value });
                  setProfileSaved(false);
                }}
              />
            </Field>
            <Field label="E-posta">
              <Input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, email: e.target.value });
                  setProfileSaved(false);
                }}
              />
            </Field>
            <Field label="Telefon">
              <Input
                value={profileForm.phone}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, phone: e.target.value });
                  setProfileSaved(false);
                }}
                placeholder="05XX XXX XX XX"
              />
            </Field>
            <Field label="Uzmanlık alanı">
              <Input
                value={profileForm.specialty}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, specialty: e.target.value });
                  setProfileSaved(false);
                }}
                placeholder="Örn: Kamera, Alarm"
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <Btn type="submit" disabled={profileSaving}>
              {profileSaving ? "Kaydediliyor…" : "Kaydet"}
            </Btn>
            {profileSaved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <Icon name="check" className="h-4 w-4" />
                Kaydedildi
              </span>
            )}
            {account && (
              <Badge tone={account.role === "admin" ? "brand" : "gray"}>
                {account.role === "admin" ? "Yönetici" : "Personel"}
              </Badge>
            )}
          </div>
        </form>
      </Card>

      <Card title="Şifre Değiştir">
        <form onSubmit={savePassword} className="space-y-4 p-5">
          {pwError && <ErrorBox message={pwError} />}
          <Field label="Mevcut şifre">
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Yeni şifre">
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
            </Field>
            <Field label="Yeni şifre (tekrar)">
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <Btn type="submit" disabled={pwSaving}>
              {pwSaving ? "Değiştiriliyor…" : "Şifreyi Değiştir"}
            </Btn>
            {pwSaved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <Icon name="check" className="h-4 w-4" />
                Şifre değiştirildi
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card title="İki Adımlı Doğrulama (2FA)">
        <div className="space-y-4 p-5">
          <p className="text-sm text-ink/60">
            Etkinleştirildiğinde, giriş yaparken şifrenize ek olarak telefonunuzdaki bir
            doğrulama uygulamasından (Google Authenticator, Authy vb.) alınan 6 haneli kod
            istenir — hesabınız şifreniz ele geçirilse bile korunur.
          </p>
          <div className="flex items-center gap-3">
            {account?.twoFactorEnabled ? (
              <>
                <Badge tone="green">Aktif</Badge>
                <Btn variant="ghost" onClick={() => setDisableOpen(true)}>
                  Devre Dışı Bırak
                </Btn>
              </>
            ) : (
              <>
                <Badge tone="gray">Kapalı</Badge>
                <Btn onClick={() => setSetupOpen(true)}>
                  <Icon name="shield" className="h-4 w-4" />
                  Etkinleştir
                </Btn>
              </>
            )}
          </div>
        </div>
      </Card>

      {setupOpen && (
        <TwoFactorSetupModal
          onClose={() => setSetupOpen(false)}
          onEnabled={() => {
            setSetupOpen(false);
            load();
          }}
        />
      )}
      {disableOpen && (
        <TwoFactorDisableModal
          onClose={() => setDisableOpen(false)}
          onDisabled={() => {
            setDisableOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function TwoFactorSetupModal({ onClose, onEnabled }: { onClose: () => void; onEnabled: () => void }) {
  const [step, setStep] = useState<"loading" | "scan" | "codes">("loading");
  const [error, setError] = useState("");
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    api<{ secret: string; qrDataUrl: string }>("/api/account/2fa/setup", { method: "POST" })
      .then((data) => {
        setSecret(data.secret);
        setQrDataUrl(data.qrDataUrl);
        setStep("scan");
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  const confirm = async (e: FormEvent) => {
    e.preventDefault();
    setConfirming(true);
    setError("");
    try {
      const data = await api<{ backupCodes: string[] }>("/api/account/2fa/confirm", {
        method: "POST",
        body: JSON.stringify({ secret, code }),
      });
      setBackupCodes(data.backupCodes);
      setStep("codes");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="İki Adımlı Doğrulamayı Etkinleştir">
      <div className="space-y-4">
        {error && <ErrorBox message={error} />}

        {step === "loading" && <Loading />}

        {step === "scan" && (
          <form onSubmit={confirm} className="space-y-4">
            <p className="text-sm text-ink/60">
              Google Authenticator, Microsoft Authenticator veya Authy gibi bir uygulamayla
              aşağıdaki QR kodu tarayın.
            </p>
            {qrDataUrl && (
              <div className="flex justify-center rounded-2xl border border-ink/8 bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="2FA QR kodu" className="h-48 w-48" />
              </div>
            )}
            <p className="text-center text-xs text-ink/45">
              QR okutamıyorsanız bu kodu elle girin:{" "}
              <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono">{secret}</code>
            </p>
            <Field label="Uygulamadaki 6 haneli kod">
              <Input
                required
                autoFocus
                inputMode="numeric"
                maxLength={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </Field>
            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={onClose}>
                Vazgeç
              </Btn>
              <Btn type="submit" disabled={confirming}>
                {confirming ? "Doğrulanıyor…" : "Doğrula ve Etkinleştir"}
              </Btn>
            </div>
          </form>
        )}

        {step === "codes" && (
          <div className="space-y-4">
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              2FA etkinleştirildi. Aşağıdaki yedek kodları güvenli bir yere kaydedin — telefonunuza
              erişemediğinizde her biri yalnızca bir kez kullanılmak üzere giriş yapmanızı sağlar.
              Bu kodlar bir daha gösterilmeyecek.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-ink/8 bg-surface p-4 font-mono text-sm">
              {backupCodes.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="flex justify-end border-t border-ink/8 pt-4">
              <Btn onClick={onEnabled}>Kaydettim, Kapat</Btn>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function TwoFactorDisableModal({ onClose, onDisabled }: { onClose: () => void; onDisabled: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/api/account/2fa/disable", { method: "POST", body: JSON.stringify({ password }) });
      onDisabled();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="İki Adımlı Doğrulamayı Kapat">
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBox message={error} />}
        <p className="text-sm text-ink/60">
          Hesabınızın güvenliği için, 2FA'yı kapatmadan önce şifrenizi tekrar girin.
        </p>
        <Field label="Şifreniz">
          <Input
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
          <Btn variant="ghost" onClick={onClose}>
            Vazgeç
          </Btn>
          <Btn variant="danger" type="submit" disabled={saving}>
            {saving ? "Kapatılıyor…" : "2FA'yı Kapat"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
