export type Review = {
  name: string;
  time: string;
  text: string;
  color: string;
};

export const reviews: Review[] = [
  {
    name: "Furkan Pamuk",
    time: "4 ay önce",
    text: "Kentsel dönüşüm kapsamında yaptırdığımız yeni binamıza kamera sistemi kurulumu için Öztürk Güvenlik ile çalıştık ve gerçekten çok memnun kaldık. Hem keşif sürecinde hem montaj aşamasında son derece ilgili ve profesyonel davrandılar. Kullanılan ekipmanlar kaliteli, görüntü netliği çok iyi. Kurulum hızlı ve temiz şekilde yapıldı. Gönül rahatlığıyla tavsiye ederim. Özkan beye teşekkürler.",
    color: "bg-[#1B7FE0]",
  },
  {
    name: "Abdulsamed Çolak",
    time: "4 ay önce",
    text: "Instagramdan denk gelip aradık, gün içinde ücretsiz keşif yapıp 3 gün içinde montajımızı tamamlayıp teslim ettiler. Gerçekten işlerini başarıyla, titizlikle yapan bir firma. Keşif için sadece araştırma aşamasındaydım, gelen Özkan Bey ihtiyacım olduğunu hissettirdi, gerçekten de öyleymiş. Emeğine sağlık.",
    color: "bg-[#0E9F8C]",
  },
  {
    name: "Muhammed",
    time: "4 ay önce",
    text: "Öztürk Güvenlik Kamera firmasıyla çalışmaktan memnun kaldık. Kurulum hızlı ve sorunsuzdu, ekip hem ilgili hem de işinde profesyoneldi. İletişimleri samimi, hizmetleri güven verici. Tavsiye ederim.",
    color: "bg-[#8A5CF0]",
  },
  {
    name: "Halil Güler",
    time: "8 ay önce",
    text: "Öztürk Kamera Güvenlik Sistemlerinden hizmet aldım, işlerini temiz ve düzgün yapıyorlar. Kurulum hızlı oldu, kameraların görüntü kalitesi iyi. Sorularımda da yardımcı oldular, memnun kaldım. Tavsiye ederim.",
    color: "bg-[#D97726]",
  },
  {
    name: "Berat Kaya",
    time: "2 yıl önce",
    text: "Ofisimize parmak okuyucu sistemi taktırdım, personel takibim çok kolaylaştı. Çalışma saatine göre ücret takibi dahi yaptırabiliyorum. Özkan beye teşekkürler.",
    color: "bg-[#B04A8C]",
  },
];