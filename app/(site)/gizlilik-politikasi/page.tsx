import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { getResolvedSite } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
  description:
    "Öztürk Güvenlik Sistemleri olarak kişisel verilerinizi hangi amaçla, nasıl işlediğimizi ve haklarınızı bu sayfada açıklıyoruz.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/gizlilik-politikasi" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ink/8 pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="mt-2.5 space-y-3 text-sm leading-relaxed text-ink/65">{children}</div>
    </div>
  );
}

export default async function GizlilikPolitikasiPage() {
  const site = await getResolvedSite();

  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Kurumsal"
          title="Gizlilik Politikası ve KVKK Aydınlatma Metni"
          subtitle="6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, bu internet sitesi üzerinden topladığımız kişisel verileri hangi amaçla ve nasıl işlediğimizi aşağıda açıklıyoruz."
        />

        <div className="mt-10 space-y-6 rounded-3xl border border-ink/8 bg-white p-6 shadow-sm sm:p-10">
          <Section title="1. Veri Sorumlusu">
            <p>
              Bu internet sitesi (<strong>{site.domain}</strong>) kapsamında kişisel verileriniz,
              veri sorumlusu sıfatıyla <strong>{site.name}</strong> (&quot;Şirket&quot;,
              &quot;biz&quot;) tarafından, aşağıda açıklanan kapsam ve amaçlarla, KVKK&apos;ya
              uygun olarak işlenmektedir.
            </p>
            <p>
              Adres: {site.address}
              <br />
              E-posta: {site.email}
              <br />
              Telefon: {site.phoneDisplay}
            </p>
          </Section>

          <Section title="2. Hangi Kişisel Verileri Topluyoruz">
            <p>Sitemizi kullanırken bizimle paylaştığınız veya bize ulaştığı ölçüde:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Kimlik ve iletişim bilgileri:</strong> Ad-soyad, telefon numarası — &quot;Ücretsiz
                Keşif&quot; formu, teklif sayfaları veya WhatsApp/telefon üzerinden bize ulaştığınızda.
              </li>
              <li>
                <strong>Talep/işlem bilgileri:</strong> Mekân türü, ilgilendiğiniz güvenlik sistemleri,
                formda belirttiğiniz notlar.
              </li>
              <li>
                <strong>Teknik/kullanım verileri:</strong> IP adresi, tarayıcı/cihaz bilgisi, site içi
                gezinme verileri — Google Analytics ve (etkinse) Google Ads dönüşüm takibi aracılığıyla,
                yalnızca site istatistikleri ve reklam performansını ölçmek amacıyla.
              </li>
            </ul>
            <p>Kimlik numarası, sağlık verisi gibi özel nitelikli kişisel veri talep etmiyor ve işlemiyoruz.</p>
          </Section>

          <Section title="3. İşleme Amaçlarımız">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Ücretsiz keşif/teklif talebinizi değerlendirmek, sizinle iletişime geçmek ve randevu planlamak</li>
              <li>Talep ettiğiniz hizmetin teklif, kurulum ve sonrasındaki destek süreçlerini yürütmek</li>
              <li>Yasal yükümlülüklerimizi (fatura, garanti kayıtları vb.) yerine getirmek</li>
              <li>Site performansını ölçmek, hizmet kalitesini iyileştirmek</li>
              <li>İzniniz dahilinde pazarlama/reklam faaliyetlerinin etkinliğini ölçmek</li>
            </ul>
          </Section>

          <Section title="4. Toplama Yöntemi ve Hukuki Sebep">
            <p>
              Kişisel verileriniz, sitemizdeki formları doldurmanız, WhatsApp veya telefon ile bize
              ulaşmanız yoluyla, elektronik ortamda doğrudan sizden toplanır. İşleme, KVKK
              m.5/2&apos;de yer alan &quot;bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya
              ilgili olma&quot;, &quot;hukuki yükümlülüğün yerine getirilmesi&quot; ve &quot;ilgili
              kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru
              menfaati&quot; hukuki sebeplerine dayanmaktadır.
            </p>
          </Section>

          <Section title="5. Kişisel Verilerin Aktarılması">
            <p>
              Kişisel verileriniz, hizmetin gerektirdiği ölçüde aşağıdaki taraflarla paylaşılabilir:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Talebinizi iletmek ve sizinle hızlıca iletişim kurmak için <strong>WhatsApp (Meta
                Platforms, Inc.)</strong> üzerinden mesaj gönderdiğinizde, o mesajın içeriği WhatsApp
                aracılığıyla iletilir.
              </li>
              <li>
                Site kullanım istatistikleri için <strong>Google Analytics</strong> ve reklam dönüşüm
                ölçümü için <strong>Google Ads</strong> (Google LLC) — yalnızca etkinleştirilmişse,
                anonim/istatistiksel düzeyde.
              </li>
              <li>Yasal olarak yetkili kamu kurum ve kuruluşları, talep etmeleri hâlinde.</li>
            </ul>
            <p>Kişisel verileriniz hiçbir şekilde üçüncü kişilere satılmaz veya pazarlanmaz.</p>
          </Section>

          <Section title="6. Çerezler (Cookies)">
            <p>
              Sitemiz, Google Analytics ve Google Ads tarafından yerleştirilen çerezleri
              kullanabilir; bu çerezler site trafiğini ölçmek ve reklamlarımızın etkinliğini takip
              etmek amacıyla kullanılır. Tarayıcı ayarlarınızdan çerezleri her zaman
              engelleyebilir veya silebilirsiniz; bu durum sitenin bazı işlevlerini
              etkileyebilir ancak sitenin temel kullanımını engellemez.
            </p>
          </Section>

          <Section title="7. Saklama Süresi">
            <p>
              Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta
              öngörülen zamanaşımı süreleri (özellikle Türk Ticaret Kanunu ve vergi mevzuatı
              kapsamındaki belgeler için 10 yıla kadar) saklanır; bu sürelerin sonunda silinir,
              yok edilir veya anonim hâle getirilir.
            </p>
          </Section>

          <Section title="8. KVKK Kapsamındaki Haklarınız">
            <p>KVKK m.11 uyarınca bize başvurarak:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Kişisel verinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
              <li>KVKK&apos;da öngörülen şartlarda silinmesini/yok edilmesini isteme</li>
              <li>İşlemenin sadece otomatik sistemlerle yapılması nedeniyle aleyhinize bir
                sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı işleme nedeniyle zarara uğramışsanız zararın giderilmesini talep etme</li>
            </ul>
            <p>haklarına sahipsiniz.</p>
          </Section>

          <Section title="9. Başvuru Yöntemi">
            <p>
              Yukarıdaki haklarınızı kullanmak için talebinizi, kimliğinizi tevsik edici bilgilerle
              birlikte <strong>{site.email}</strong> adresine e-posta yoluyla veya{" "}
              {site.address} adresine yazılı olarak iletebilirsiniz. Başvurunuz, niteliğine göre en
              geç 30 gün içinde sonuçlandırılır.
            </p>
          </Section>

          <Section title="10. Değişiklikler">
            <p>
              Bu metin, yasal mevzuattaki veya iş süreçlerimizdeki değişikliklere göre güncellenebilir;
              güncel hâli her zaman bu sayfada yayımlanır.
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}
