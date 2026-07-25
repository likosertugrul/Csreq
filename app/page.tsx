"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Logo from "@/components/Logo";
import { LANGS, type Lang } from "@/lib/i18n";

const LT = {
  EN: {
    tryFree: "Try free →",
    dark: "Dark", light: "Light",
    heroBadge: "Couch Request",
    heroTitle: <>Write the perfect<br />CouchSurfing couch request.<br /></>,
    heroItalic: "In seconds.",
    heroSub: "Paste the host's CouchSurfing profile. Pick your dates. Get a genuine couch request letter that references things they actually care about — not AI filler.",
    heroFreeNote: "5 letters free · no credit card",
    exBadge: "See it in action",
    exTitle: "CouchSurfing requests that get replies.",
    exSub: "Click any card to read the full couch request letter.",
    exModalBadge: "Example letter",
    exCopy: "Copy", exCopied: "✓ Copied",
    howBadge: "How it works",
    howTitle: "Three steps to a better couch request.",
    howSteps: [
      { title: "Paste the host's CouchSurfing profile", body: "Copy the text from their CouchSurfing page — or just paste the URL. Works with the profile, home section, and references." },
      { title: "Pick your dates", body: "Set your arrival and departure. The couch request letter automatically mentions how long you're staying." },
      { title: "Copy and send your couch request", body: "A personalized, human-sounding letter appears in seconds. Edit it freely, then copy and paste it into CouchSurfing." },
    ],
    vsBadge: "vs. asking chatgpt to write your request",
    vsTitle: <>ChatGPT writes a couch request.<br /></>,
    vsItalic: "This one might get a reply.",
    vsSub: "You can ask ChatGPT to write a CouchSurfing request. What comes back is grammatically correct, politically inoffensive, and completely forgettable. Hosts read hundreds of requests — they recognize AI writing immediately. We built csreq specifically to solve that problem.",
    vsProblem: "The problem",
    vsCards: [
      { title: "LLMs have a writing fingerprint", body: "Every LLM reaches for the same phrases. Hosts who read a hundred requests a month recognize them immediately. A letter that reads like AI is a letter that gets archived.", listTitle: "blocked in csreq", list: ["\"vibrant local culture\"","\"tapestry of experiences\"","\"I would be honored\"","not only … but also …","em dash overuse —","\"seamless\" / \"crucial\" / \"foster\""] },
      { title: "ChatGPT doesn't know CouchSurfing's rules", body: "CouchSurfing cuts off request messages at 995 characters. A raw LLM will happily write 400 words that get silently truncated before the host ever sees your name.", badLabel: "ChatGPT output", badText: "1,340 chars — host sees first 995, letter ends mid-sentence", goodLabel: "csreq output", goodText: "874 chars — ends on a real sentence, nothing cut" },
      { title: "Generic beats specific every time — in the wrong direction", body1: "When you ask ChatGPT to write a request, it writes about \"learning from locals\" and \"exploring authentic culture.\" That's the default. It doesn't know the host spent two years building a rooftop garden or that they only host people who cook.", body2: "csreq reads the actual profile text and pulls the details that matter — a specific hobby, an unusual living situation, something the host wrote that most travelers skip over. The resulting letter is one the host can tell was written for them." },
      { title: "LLMs don't read the fine print", body: "Hosts often bury important conditions in their profile — female guests only, minimum three nights, no guests during certain months, nudist household. ChatGPT writes a cheerful letter regardless.", warnings: ["Female guests only","Minimum 3-night stay","No guests until March"], warnSuffix: "— detected from profile", warnNote: "csreq flags these conditions before you write. You won't send a perfect letter to the wrong host." },
    ],
    featBadge: "Why different",
    featTitle: <>Built for CouchSurfing,<br /></>,
    featItalic: "not generic templates.",
    pricBadge: "Pricing",
    pricTitle: "Simple and fair.",
    pricFree: { label: "Free", price: "$0", note: "No credit card required", features: ["5 letters total","All languages","Full editor","Host warnings"], cta: "Get started" },
    pricMonthly: { label: "Monthly", price: "$5", per: "/month", note: "Cancel anytime", features: ["Unlimited letters","All languages","Full editor","Host warnings","Priority support"], cta: "Start free, upgrade later" },
    pricLifetime: { label: "Lifetime", price: "$25", note: "One payment, forever", features: ["Unlimited letters","All languages","Full editor","Host warnings","Priority support","All future features"], cta: "Get lifetime access →", badge: "Best value" },
    footerText: "© 2025 csreq. Write better CouchSurfing couch requests.",
  },
  TR: {
    tryFree: "Ücretsiz Dene →",
    dark: "Koyu", light: "Açık",
    heroBadge: "Couch Request",
    heroTitle: <>Mükemmel ev sahibi<br />mesajını yaz.<br /></>,
    heroItalic: "Saniyeler içinde.",
    heroSub: "Ev sahibinin profilini yapıştır. Tarihlerini seç. Gerçekten kişisel, onların ilgi alanlarına değinen bir mektup al.",
    heroFreeNote: "5 ücretsiz mektup · kredi kartı gerekmez",
    exBadge: "Uygulamaya bak",
    exTitle: "Yanıt alan mektuplar.",
    exSub: "Tam mektubu okumak için kartlardan birine tıkla.",
    exModalBadge: "Örnek mektup",
    exCopy: "Kopyala", exCopied: "✓ Kopyalandı",
    howBadge: "Nasıl çalışır",
    howTitle: "Üç adım.",
    howSteps: [
      { title: "Ev sahibinin profilini yapıştır", body: "CouchSurfing sayfasındaki metni kopyala — ya da URL'yi yapıştır. Profil, home bölümü ve referanslarla çalışır." },
      { title: "Tarihlerini seç", body: "Varış ve ayrılış tarihlerini gir. Mektup kaç gece kalacağını otomatik olarak belirtir." },
      { title: "Mektubunu oku", body: "Saniyeler içinde kişiselleştirilmiş, insan gibi yazan bir mektup çıkar. İstediğin gibi düzenle, kopyala ve gönder." },
    ],
    vsBadge: "doğrudan llm'e sormak yerine",
    vsTitle: <>ChatGPT bir mektup yazar.<br /></>,
    vsItalic: "Bu ise yanıt alabilir.",
    vsSub: "ChatGPT'den couch request yazmasını isteyebilirsin. Geri gelen şey dilbilgisi açısından doğru, siyasi olarak güvenli ve tamamen unutulabilir bir şeydir. Ev sahipleri fark eder. Biz tam olarak bu sorunu çözmek için bir araç yaptık.",
    vsProblem: "Sorun",
    vsCards: [
      { title: "LLM'lerin bir yazı parmak izi var", body: "Her LLM aynı ifadelere uzanır. Ayda yüzlerce istek okuyan ev sahipleri anında tanır. AI gibi görünen mektup, arşive giden mektuptur.", listTitle: "csreq'te engellendi", list: ["\"canlı yerel kültür\"","\"deneyimler dokusu\"","\"onurlandırılırdım\"","yalnızca … değil aynı zamanda …","uzun çizgi kötüye kullanımı —","\"sorunsuz\" / \"hayati\" / \"geliştirmek\""] },
      { title: "ChatGPT CouchSurfing kurallarını bilmez", body: "CouchSurfing istek mesajlarını 995 karakterde keser. Saf bir LLM, ev sahibi adını bile görmeden sessizce kırpılacak 400 kelime yazar.", badLabel: "ChatGPT çıktısı", badText: "1.340 karakter — ev sahibi ilk 995'i görür, mektup cümle ortasında biter", goodLabel: "csreq çıktısı", goodText: "874 karakter — gerçek bir cümlede biter, hiçbir şey kesilmez" },
      { title: "Genellik her zaman özgünlüğü yener — ama ters yönde", body1: "ChatGPT'den istek yazmasını isteyince \"yerlilerden öğrenmek\" ve \"özgün kültürü keşfetmek\" hakkında yazar. Bu varsayılan. Ev sahibinin iki yıldır çatı bahçesi kurduğunu ya da yalnızca yemek yapan misafirlere yer verdiğini bilmez.", body2: "csreq gerçek profil metnini okur ve önemli detayları çıkarır — özel bir hobi, alışılmadık bir yaşam ortamı, ev sahibinin çoğu gezginin atlayacağı bir şeyi. Ortaya çıkan mektup, ev sahibinin kendisi için yazıldığını anlayabileceği biridir." },
      { title: "LLM'ler küçük yazıları okumaz", body: "Ev sahipleri önemli koşulları profillerine gömer — yalnızca kadın misafirler, minimum üç gece, belirli aylarda misafir yok, nudist ev. ChatGPT buna rağmen neşeli bir mektup yazar.", warnings: ["Yalnızca kadın misafirler","Minimum 3 gece konaklama","Mart'a kadar misafir yok"], warnSuffix: "— profilden tespit edildi", warnNote: "csreq bu koşulları yazmadan önce işaretler. Mükemmel bir mektup yanlış ev sahibine gitmez." },
    ],
    featBadge: "Neden farklı",
    featTitle: <>Gerçek gezginler için,<br /></>,
    featItalic: "şablonlar için değil.",
    pricBadge: "Fiyatlandırma",
    pricTitle: "Basit ve adil.",
    pricFree: { label: "Ücretsiz", price: "$0", note: "Kredi kartı gerekmez", features: ["Toplam 5 mektup","Tüm diller","Tam editör","Ev sahibi uyarıları"], cta: "Başla" },
    pricMonthly: { label: "Aylık", price: "$5", per: "/ay", note: "İstediğin zaman iptal et", features: ["Sınırsız mektup","Tüm diller","Tam editör","Ev sahibi uyarıları","Öncelikli destek"], cta: "Ücretsiz başla, sonra yükselt" },
    pricLifetime: { label: "Ömür Boyu", price: "$25", note: "Tek ödeme, sonsuza dek", features: ["Sınırsız mektup","Tüm diller","Tam editör","Ev sahibi uyarıları","Öncelikli destek","Gelecekteki tüm özellikler"], cta: "Ömür boyu erişim al →", badge: "En iyi değer" },
    footerText: "© 2025 csreq. Daha iyi couch request mektupları yaz.",
  },
  DE: {
    tryFree: "Kostenlos testen →",
    dark: "Dunkel", light: "Hell",
    heroBadge: "Couch Request",
    heroTitle: <>Schreibe die perfekte<br />CouchSurfing-Anfrage.<br /></>,
    heroItalic: "In Sekunden.",
    heroSub: "Füge das CouchSurfing-Profil des Gastgebers ein. Wähle deine Daten. Erhalte eine echte Couch-Anfrage, die auf Dinge eingeht, die dem Gastgeber wirklich wichtig sind — kein KI-Fülltext.",
    heroFreeNote: "5 Briefe gratis · keine Kreditkarte",
    exBadge: "In Aktion sehen",
    exTitle: "CouchSurfing-Anfragen, die Antworten bekommen.",
    exSub: "Klicke auf eine Karte, um die vollständige Couch-Anfrage zu lesen.",
    exModalBadge: "Beispielbrief",
    exCopy: "Kopieren", exCopied: "✓ Kopiert",
    howBadge: "So funktioniert's",
    howTitle: "Drei Schritte zu einer besseren Anfrage.",
    howSteps: [
      { title: "Füge das CouchSurfing-Profil ein", body: "Kopiere den Text von der CouchSurfing-Seite — oder füge einfach die URL ein. Funktioniert mit Profil, Home-Bereich und Referenzen." },
      { title: "Wähle deine Daten", body: "Lege Ankunft und Abreise fest. Die Anfrage erwähnt automatisch, wie lange du bleibst." },
      { title: "Kopieren und Anfrage senden", body: "In Sekunden erscheint ein persönlicher, menschlich klingender Brief. Bearbeite ihn frei, kopiere ihn und füge ihn in CouchSurfing ein." },
    ],
    vsBadge: "statt chatgpt deine anfrage schreiben zu lassen",
    vsTitle: <>ChatGPT schreibt eine Anfrage.<br /></>,
    vsItalic: "Diese hier bekommt vielleicht eine Antwort.",
    vsSub: "Du kannst ChatGPT bitten, eine CouchSurfing-Anfrage zu schreiben. Was zurückkommt, ist grammatikalisch korrekt, politisch unbedenklich und völlig vergesslich. Gastgeber lesen Hunderte von Anfragen — sie erkennen KI-Text sofort. Wir haben csreq genau für dieses Problem gebaut.",
    vsProblem: "Das Problem",
    vsCards: [
      { title: "LLMs haben einen Schreib-Fingerabdruck", body: "Jedes LLM greift zu denselben Formulierungen. Gastgeber, die hundert Anfragen im Monat lesen, erkennen sie sofort. Ein Brief, der wie KI klingt, wird archiviert.", listTitle: "in csreq blockiert", list: ["„lebendige lokale Kultur“","„ein Teppich aus Erfahrungen“","„es wäre mir eine Ehre“","nicht nur … sondern auch …","übermäßige Gedankenstriche —","„nahtlos“ / „entscheidend“ / „fördern“"] },
      { title: "ChatGPT kennt die Regeln von CouchSurfing nicht", body: "CouchSurfing schneidet Anfragen bei 995 Zeichen ab. Ein reines LLM schreibt fröhlich 400 Wörter, die stillschweigend abgeschnitten werden, bevor der Gastgeber deinen Namen sieht.", badLabel: "ChatGPT-Ausgabe", badText: "1.340 Zeichen — der Gastgeber sieht die ersten 995, der Brief endet mitten im Satz", goodLabel: "csreq-Ausgabe", goodText: "874 Zeichen — endet mit einem echten Satz, nichts wird abgeschnitten" },
      { title: "Allgemein schlägt spezifisch jedes Mal — in die falsche Richtung", body1: "Wenn du ChatGPT bittest, eine Anfrage zu schreiben, schreibt es über „von Einheimischen lernen“ und „authentische Kultur erkunden“. Das ist die Standardeinstellung. Es weiß nicht, dass der Gastgeber zwei Jahre lang einen Dachgarten angelegt hat oder nur Leute beherbergt, die kochen.", body2: "csreq liest den echten Profiltext und zieht die Details heraus, die zählen — ein bestimmtes Hobby, eine ungewöhnliche Wohnsituation, etwas, das der Gastgeber geschrieben hat und das die meisten Reisenden überspringen. Der entstehende Brief ist einer, dem der Gastgeber ansieht, dass er für ihn geschrieben wurde." },
      { title: "LLMs lesen das Kleingedruckte nicht", body: "Gastgeber verstecken wichtige Bedingungen oft in ihrem Profil — nur weibliche Gäste, mindestens drei Nächte, keine Gäste in bestimmten Monaten, FKK-Haushalt. ChatGPT schreibt trotzdem einen fröhlichen Brief.", warnings: ["Nur weibliche Gäste","Mindestens 3 Nächte","Keine Gäste bis März"], warnSuffix: "— aus dem Profil erkannt", warnNote: "csreq markiert diese Bedingungen, bevor du schreibst. Du schickst keinen perfekten Brief an den falschen Gastgeber." },
    ],
    featBadge: "Warum anders",
    featTitle: <>Für CouchSurfing gebaut,<br /></>,
    featItalic: "nicht für generische Vorlagen.",
    pricBadge: "Preise",
    pricTitle: "Einfach und fair.",
    pricFree: { label: "Kostenlos", price: "$0", note: "Keine Kreditkarte nötig", features: ["5 Briefe insgesamt","Alle Sprachen","Voller Editor","Gastgeber-Warnungen"], cta: "Loslegen" },
    pricMonthly: { label: "Monatlich", price: "$5", per: "/Monat", note: "Jederzeit kündbar", features: ["Unbegrenzte Briefe","Alle Sprachen","Voller Editor","Gastgeber-Warnungen","Priorisierter Support"], cta: "Kostenlos starten, später upgraden" },
    pricLifetime: { label: "Lebenslang", price: "$25", note: "Einmalzahlung, für immer", features: ["Unbegrenzte Briefe","Alle Sprachen","Voller Editor","Gastgeber-Warnungen","Priorisierter Support","Alle zukünftigen Funktionen"], cta: "Lebenslangen Zugang holen →", badge: "Bester Wert" },
    footerText: "© 2025 csreq. Schreibe bessere CouchSurfing-Anfragen.",
  },
  FR: {
    tryFree: "Essayer gratuitement →",
    dark: "Sombre", light: "Clair",
    heroBadge: "Couch Request",
    heroTitle: <>Rédige la demande CouchSurfing<br />parfaite.<br /></>,
    heroItalic: "En quelques secondes.",
    heroSub: "Colle le profil CouchSurfing de l'hôte. Choisis tes dates. Obtiens une vraie demande de canapé qui évoque ce qui compte vraiment pour l'hôte — pas du remplissage d'IA.",
    heroFreeNote: "5 lettres gratuites · sans carte bancaire",
    exBadge: "Voir en action",
    exTitle: "Des demandes CouchSurfing qui reçoivent des réponses.",
    exSub: "Clique sur une carte pour lire la demande complète.",
    exModalBadge: "Exemple de lettre",
    exCopy: "Copier", exCopied: "✓ Copié",
    howBadge: "Comment ça marche",
    howTitle: "Trois étapes pour une meilleure demande.",
    howSteps: [
      { title: "Colle le profil CouchSurfing de l'hôte", body: "Copie le texte de sa page CouchSurfing — ou colle simplement l'URL. Fonctionne avec le profil, la section home et les références." },
      { title: "Choisis tes dates", body: "Indique ton arrivée et ton départ. La lettre mentionne automatiquement la durée de ton séjour." },
      { title: "Copie et envoie ta demande", body: "Une lettre personnalisée, au ton humain, apparaît en quelques secondes. Modifie-la librement, puis copie-la dans CouchSurfing." },
    ],
    vsBadge: "plutôt que de demander à chatgpt d'écrire ta demande",
    vsTitle: <>ChatGPT écrit une demande.<br /></>,
    vsItalic: "Celle-ci pourrait recevoir une réponse.",
    vsSub: "Tu peux demander à ChatGPT d'écrire une demande CouchSurfing. Ce qui revient est grammaticalement correct, politiquement inoffensif et totalement oubliable. Les hôtes lisent des centaines de demandes — ils reconnaissent l'écriture d'IA immédiatement. Nous avons conçu csreq précisément pour résoudre ce problème.",
    vsProblem: "Le problème",
    vsCards: [
      { title: "Les LLM ont une empreinte d'écriture", body: "Chaque LLM recourt aux mêmes formules. Les hôtes qui lisent cent demandes par mois les reconnaissent aussitôt. Une lettre qui sonne comme de l'IA est une lettre qui finit archivée.", listTitle: "bloqué dans csreq", list: ["« culture locale vibrante »","« une tapisserie d'expériences »","« ce serait un honneur »","non seulement … mais aussi …","abus de tirets cadratins —","« fluide » / « crucial » / « favoriser »"] },
      { title: "ChatGPT ne connaît pas les règles de CouchSurfing", body: "CouchSurfing coupe les messages de demande à 995 caractères. Un LLM brut écrira volontiers 400 mots qui seront silencieusement tronqués avant même que l'hôte voie ton nom.", badLabel: "Sortie ChatGPT", badText: "1 340 caractères — l'hôte voit les 995 premiers, la lettre s'arrête en plein milieu", goodLabel: "Sortie csreq", goodText: "874 caractères — se termine sur une vraie phrase, rien n'est coupé" },
      { title: "Le générique l'emporte toujours sur le spécifique — dans le mauvais sens", body1: "Quand tu demandes à ChatGPT d'écrire une demande, il parle d'« apprendre des locaux » et d'« explorer la culture authentique ». C'est le réglage par défaut. Il ne sait pas que l'hôte a passé deux ans à construire un jardin sur le toit ou qu'il n'accueille que des gens qui cuisinent.", body2: "csreq lit le vrai texte du profil et en extrait les détails qui comptent — un loisir précis, une situation de vie inhabituelle, une chose que l'hôte a écrite et que la plupart des voyageurs ignorent. La lettre obtenue est une lettre dont l'hôte voit qu'elle a été écrite pour lui." },
      { title: "Les LLM ne lisent pas les petits caractères", body: "Les hôtes enfouissent souvent des conditions importantes dans leur profil — femmes uniquement, minimum trois nuits, pas d'invités certains mois, foyer naturiste. ChatGPT écrit une lettre enjouée malgré tout.", warnings: ["Femmes uniquement","Séjour de 3 nuits minimum","Pas d'invités avant mars"], warnSuffix: "— détecté depuis le profil", warnNote: "csreq signale ces conditions avant que tu écrives. Tu n'enverras pas une lettre parfaite au mauvais hôte." },
    ],
    featBadge: "Pourquoi c'est différent",
    featTitle: <>Conçu pour CouchSurfing,<br /></>,
    featItalic: "pas des modèles génériques.",
    pricBadge: "Tarifs",
    pricTitle: "Simple et juste.",
    pricFree: { label: "Gratuit", price: "$0", note: "Sans carte bancaire", features: ["5 lettres au total","Toutes les langues","Éditeur complet","Alertes sur l'hôte"], cta: "Commencer" },
    pricMonthly: { label: "Mensuel", price: "$5", per: "/mois", note: "Annulable à tout moment", features: ["Lettres illimitées","Toutes les langues","Éditeur complet","Alertes sur l'hôte","Support prioritaire"], cta: "Commence gratuitement, upgrade plus tard" },
    pricLifetime: { label: "À vie", price: "$25", note: "Un paiement, pour toujours", features: ["Lettres illimitées","Toutes les langues","Éditeur complet","Alertes sur l'hôte","Support prioritaire","Toutes les fonctions futures"], cta: "Obtenir l'accès à vie →", badge: "Meilleure valeur" },
    footerText: "© 2025 csreq. Rédige de meilleures demandes CouchSurfing.",
  },
  ES: {
    tryFree: "Probar gratis →",
    dark: "Oscuro", light: "Claro",
    heroBadge: "Couch Request",
    heroTitle: <>Escribe la solicitud de CouchSurfing<br />perfecta.<br /></>,
    heroItalic: "En segundos.",
    heroSub: "Pega el perfil de CouchSurfing del anfitrión. Elige tus fechas. Consigue una solicitud de sofá genuina que menciona lo que de verdad le importa al anfitrión — nada de relleno de IA.",
    heroFreeNote: "5 cartas gratis · sin tarjeta",
    exBadge: "Verlo en acción",
    exTitle: "Solicitudes de CouchSurfing que reciben respuesta.",
    exSub: "Haz clic en una tarjeta para leer la solicitud completa.",
    exModalBadge: "Carta de ejemplo",
    exCopy: "Copiar", exCopied: "✓ Copiado",
    howBadge: "Cómo funciona",
    howTitle: "Tres pasos hacia una mejor solicitud.",
    howSteps: [
      { title: "Pega el perfil de CouchSurfing del anfitrión", body: "Copia el texto de su página de CouchSurfing — o pega la URL. Funciona con el perfil, la sección home y las referencias." },
      { title: "Elige tus fechas", body: "Indica tu llegada y salida. La carta menciona automáticamente cuánto tiempo te quedas." },
      { title: "Copia y envía tu solicitud", body: "En segundos aparece una carta personalizada que suena humana. Edítala a tu gusto, luego cópiala y pégala en CouchSurfing." },
    ],
    vsBadge: "en vez de pedirle a chatgpt que escriba tu solicitud",
    vsTitle: <>ChatGPT escribe una solicitud.<br /></>,
    vsItalic: "Esta podría recibir respuesta.",
    vsSub: "Puedes pedirle a ChatGPT que escriba una solicitud de CouchSurfing. Lo que recibes es gramaticalmente correcto, políticamente inofensivo y completamente olvidable. Los anfitriones leen cientos de solicitudes — reconocen la escritura de IA de inmediato. Creamos csreq precisamente para resolver ese problema.",
    vsProblem: "El problema",
    vsCards: [
      { title: "Los LLM tienen una huella de escritura", body: "Cada LLM recurre a las mismas frases. Los anfitriones que leen cien solicitudes al mes las reconocen al instante. Una carta que suena a IA es una carta que acaba archivada.", listTitle: "bloqueado en csreq", list: ["«cultura local vibrante»","«un tapiz de experiencias»","«sería un honor»","no solo … sino también …","abuso de rayas —","«fluido» / «crucial» / «fomentar»"] },
      { title: "ChatGPT no conoce las reglas de CouchSurfing", body: "CouchSurfing corta los mensajes de solicitud a los 995 caracteres. Un LLM sin más escribirá alegremente 400 palabras que se recortan en silencio antes de que el anfitrión vea tu nombre.", badLabel: "Salida de ChatGPT", badText: "1.340 caracteres — el anfitrión ve los primeros 995, la carta termina a media frase", goodLabel: "Salida de csreq", goodText: "874 caracteres — termina en una frase real, no se corta nada" },
      { title: "Lo genérico siempre gana a lo específico — en la dirección equivocada", body1: "Cuando le pides a ChatGPT que escriba una solicitud, escribe sobre «aprender de los locales» y «explorar la cultura auténtica». Eso es lo predeterminado. No sabe que el anfitrión pasó dos años construyendo un jardín en la azotea ni que solo aloja a gente que cocina.", body2: "csreq lee el texto real del perfil y extrae los detalles que importan — una afición concreta, una situación de vivienda inusual, algo que el anfitrión escribió y que la mayoría de los viajeros pasa por alto. La carta resultante es una que el anfitrión nota que fue escrita para él." },
      { title: "Los LLM no leen la letra pequeña", body: "Los anfitriones suelen esconder condiciones importantes en su perfil — solo mujeres, mínimo tres noches, sin huéspedes ciertos meses, hogar nudista. ChatGPT escribe una carta alegre de todos modos.", warnings: ["Solo huéspedes mujeres","Estancia mínima de 3 noches","Sin huéspedes hasta marzo"], warnSuffix: "— detectado en el perfil", warnNote: "csreq marca estas condiciones antes de que escribas. No enviarás una carta perfecta al anfitrión equivocado." },
    ],
    featBadge: "Por qué es diferente",
    featTitle: <>Hecho para CouchSurfing,<br /></>,
    featItalic: "no plantillas genéricas.",
    pricBadge: "Precios",
    pricTitle: "Simple y justo.",
    pricFree: { label: "Gratis", price: "$0", note: "Sin tarjeta de crédito", features: ["5 cartas en total","Todos los idiomas","Editor completo","Avisos del anfitrión"], cta: "Empezar" },
    pricMonthly: { label: "Mensual", price: "$5", per: "/mes", note: "Cancela cuando quieras", features: ["Cartas ilimitadas","Todos los idiomas","Editor completo","Avisos del anfitrión","Soporte prioritario"], cta: "Empieza gratis, mejora después" },
    pricLifetime: { label: "De por vida", price: "$25", note: "Un pago, para siempre", features: ["Cartas ilimitadas","Todos los idiomas","Editor completo","Avisos del anfitrión","Soporte prioritario","Todas las funciones futuras"], cta: "Consigue acceso de por vida →", badge: "Mejor valor" },
    footerText: "© 2025 csreq. Escribe mejores solicitudes de CouchSurfing.",
  },
  IT: {
    tryFree: "Prova gratis →",
    dark: "Scuro", light: "Chiaro",
    heroBadge: "Couch Request",
    heroTitle: <>Scrivi la richiesta CouchSurfing<br />perfetta.<br /></>,
    heroItalic: "In pochi secondi.",
    heroSub: "Incolla il profilo CouchSurfing dell'host. Scegli le date. Ottieni una richiesta autentica che parla di ciò che all'host interessa davvero — niente riempitivo da IA.",
    heroFreeNote: "5 lettere gratis · nessuna carta",
    exBadge: "Guarda in azione",
    exTitle: "Richieste CouchSurfing che ricevono risposta.",
    exSub: "Clicca su una scheda per leggere la richiesta completa.",
    exModalBadge: "Lettera di esempio",
    exCopy: "Copia", exCopied: "✓ Copiato",
    howBadge: "Come funziona",
    howTitle: "Tre passi verso una richiesta migliore.",
    howSteps: [
      { title: "Incolla il profilo CouchSurfing dell'host", body: "Copia il testo dalla sua pagina CouchSurfing — o incolla semplicemente l'URL. Funziona con profilo, sezione home e referenze." },
      { title: "Scegli le date", body: "Imposta arrivo e partenza. La lettera indica automaticamente quanto ti fermi." },
      { title: "Copia e invia la richiesta", body: "In pochi secondi appare una lettera personalizzata dal tono umano. Modificala liberamente, poi copiala e incollala in CouchSurfing." },
    ],
    vsBadge: "invece di chiedere a chatgpt di scrivere la tua richiesta",
    vsTitle: <>ChatGPT scrive una richiesta.<br /></>,
    vsItalic: "Questa potrebbe ricevere risposta.",
    vsSub: "Puoi chiedere a ChatGPT di scrivere una richiesta CouchSurfing. Quello che torna è grammaticalmente corretto, politicamente innocuo e del tutto dimenticabile. Gli host leggono centinaia di richieste — riconoscono la scrittura dell'IA all'istante. Abbiamo creato csreq proprio per risolvere questo problema.",
    vsProblem: "Il problema",
    vsCards: [
      { title: "Gli LLM hanno un'impronta di scrittura", body: "Ogni LLM ricorre alle stesse frasi. Gli host che leggono cento richieste al mese le riconoscono subito. Una lettera che suona come IA è una lettera che finisce in archivio.", listTitle: "bloccato in csreq", list: ["«vivace cultura locale»","«un arazzo di esperienze»","«sarebbe un onore»","non solo … ma anche …","abuso di lineette —","«fluido» / «cruciale» / «promuovere»"] },
      { title: "ChatGPT non conosce le regole di CouchSurfing", body: "CouchSurfing taglia i messaggi di richiesta a 995 caratteri. Un LLM grezzo scriverà allegramente 400 parole che vengono troncate in silenzio prima ancora che l'host veda il tuo nome.", badLabel: "Output di ChatGPT", badText: "1.340 caratteri — l'host vede i primi 995, la lettera si interrompe a metà frase", goodLabel: "Output di csreq", goodText: "874 caratteri — finisce con una frase vera, non viene tagliato nulla" },
      { title: "Il generico batte lo specifico ogni volta — nella direzione sbagliata", body1: "Quando chiedi a ChatGPT di scrivere una richiesta, parla di «imparare dalla gente del posto» ed «esplorare la cultura autentica». È l'impostazione predefinita. Non sa che l'host ha passato due anni a costruire un giardino sul tetto o che ospita solo chi cucina.", body2: "csreq legge il testo reale del profilo ed estrae i dettagli che contano — un hobby preciso, una situazione abitativa insolita, qualcosa che l'host ha scritto e che la maggior parte dei viaggiatori salta. La lettera che ne esce è una in cui l'host capisce che è stata scritta per lui." },
      { title: "Gli LLM non leggono le note in fondo", body: "Gli host spesso nascondono condizioni importanti nel profilo — solo ospiti donne, minimo tre notti, niente ospiti in certi mesi, casa naturista. ChatGPT scrive comunque una lettera allegra.", warnings: ["Solo ospiti donne","Soggiorno minimo di 3 notti","Niente ospiti fino a marzo"], warnSuffix: "— rilevato dal profilo", warnNote: "csreq segnala queste condizioni prima che tu scriva. Non manderai una lettera perfetta all'host sbagliato." },
    ],
    featBadge: "Perché è diverso",
    featTitle: <>Creato per CouchSurfing,<br /></>,
    featItalic: "non modelli generici.",
    pricBadge: "Prezzi",
    pricTitle: "Semplice e giusto.",
    pricFree: { label: "Gratis", price: "$0", note: "Nessuna carta richiesta", features: ["5 lettere in totale","Tutte le lingue","Editor completo","Avvisi sull'host"], cta: "Inizia" },
    pricMonthly: { label: "Mensile", price: "$5", per: "/mese", note: "Disdici quando vuoi", features: ["Lettere illimitate","Tutte le lingue","Editor completo","Avvisi sull'host","Supporto prioritario"], cta: "Inizia gratis, passa a pro dopo" },
    pricLifetime: { label: "A vita", price: "$25", note: "Un pagamento, per sempre", features: ["Lettere illimitate","Tutte le lingue","Editor completo","Avvisi sull'host","Supporto prioritario","Tutte le funzioni future"], cta: "Ottieni l'accesso a vita →", badge: "Miglior valore" },
    footerText: "© 2025 csreq. Scrivi richieste CouchSurfing migliori.",
  },
  PT: {
    tryFree: "Testar grátis →",
    dark: "Escuro", light: "Claro",
    heroBadge: "Couch Request",
    heroTitle: <>Escreve o pedido de CouchSurfing<br />perfeito.<br /></>,
    heroItalic: "Em segundos.",
    heroSub: "Cola o perfil de CouchSurfing do anfitrião. Escolhe as tuas datas. Recebe um pedido genuíno que fala do que realmente importa ao anfitrião — nada de enchimento de IA.",
    heroFreeNote: "5 cartas grátis · sem cartão",
    exBadge: "Ver em ação",
    exTitle: "Pedidos de CouchSurfing que recebem resposta.",
    exSub: "Clica num cartão para ler o pedido completo.",
    exModalBadge: "Carta de exemplo",
    exCopy: "Copiar", exCopied: "✓ Copiado",
    howBadge: "Como funciona",
    howTitle: "Três passos para um pedido melhor.",
    howSteps: [
      { title: "Cola o perfil de CouchSurfing do anfitrião", body: "Copia o texto da página de CouchSurfing dele — ou cola apenas o URL. Funciona com o perfil, a secção home e as referências." },
      { title: "Escolhe as tuas datas", body: "Define a chegada e a partida. A carta menciona automaticamente quanto tempo ficas." },
      { title: "Copia e envia o teu pedido", body: "Em segundos surge uma carta personalizada com um tom humano. Edita-a à vontade, depois copia e cola no CouchSurfing." },
    ],
    vsBadge: "em vez de pedir ao chatgpt para escrever o teu pedido",
    vsTitle: <>O ChatGPT escreve um pedido.<br /></>,
    vsItalic: "Este pode receber resposta.",
    vsSub: "Podes pedir ao ChatGPT para escrever um pedido de CouchSurfing. O que volta é gramaticalmente correto, politicamente inofensivo e completamente esquecível. Os anfitriões leem centenas de pedidos — reconhecem a escrita de IA de imediato. Criámos o csreq exatamente para resolver esse problema.",
    vsProblem: "O problema",
    vsCards: [
      { title: "Os LLM têm uma impressão digital de escrita", body: "Cada LLM recorre às mesmas expressões. Anfitriões que leem cem pedidos por mês reconhecem-nas de imediato. Uma carta que soa a IA é uma carta que vai para o arquivo.", listTitle: "bloqueado no csreq", list: ["«cultura local vibrante»","«uma tapeçaria de experiências»","«seria uma honra»","não só … mas também …","abuso de travessões —","«fluido» / «crucial» / «fomentar»"] },
      { title: "O ChatGPT não conhece as regras do CouchSurfing", body: "O CouchSurfing corta as mensagens de pedido nos 995 caracteres. Um LLM em bruto escreve alegremente 400 palavras que são cortadas em silêncio antes de o anfitrião ver o teu nome.", badLabel: "Resultado do ChatGPT", badText: "1.340 caracteres — o anfitrião vê os primeiros 995, a carta acaba a meio da frase", goodLabel: "Resultado do csreq", goodText: "874 caracteres — acaba numa frase real, nada é cortado" },
      { title: "O genérico vence o específico sempre — na direção errada", body1: "Quando pedes ao ChatGPT para escrever um pedido, ele fala de «aprender com os locais» e «explorar a cultura autêntica». É a predefinição. Não sabe que o anfitrião passou dois anos a construir um jardim no telhado ou que só recebe quem cozinha.", body2: "O csreq lê o texto real do perfil e extrai os detalhes que importam — um passatempo específico, uma situação de habitação invulgar, algo que o anfitrião escreveu e que a maioria dos viajantes ignora. A carta que resulta é uma em que o anfitrião percebe que foi escrita para ele." },
      { title: "Os LLM não leem as letras miudinhas", body: "Os anfitriões costumam esconder condições importantes no perfil — só hóspedes mulheres, mínimo de três noites, sem hóspedes em certos meses, casa naturista. O ChatGPT escreve na mesma uma carta animada.", warnings: ["Só hóspedes mulheres","Estadia mínima de 3 noites","Sem hóspedes até março"], warnSuffix: "— detetado no perfil", warnNote: "O csreq assinala estas condições antes de escreveres. Não vais enviar uma carta perfeita ao anfitrião errado." },
    ],
    featBadge: "Porquê diferente",
    featTitle: <>Feito para o CouchSurfing,<br /></>,
    featItalic: "não modelos genéricos.",
    pricBadge: "Preços",
    pricTitle: "Simples e justo.",
    pricFree: { label: "Grátis", price: "$0", note: "Sem cartão de crédito", features: ["5 cartas no total","Todas as línguas","Editor completo","Avisos do anfitrião"], cta: "Começar" },
    pricMonthly: { label: "Mensal", price: "$5", per: "/mês", note: "Cancela quando quiseres", features: ["Cartas ilimitadas","Todas as línguas","Editor completo","Avisos do anfitrião","Suporte prioritário"], cta: "Começa grátis, faz upgrade depois" },
    pricLifetime: { label: "Vitalício", price: "$25", note: "Um pagamento, para sempre", features: ["Cartas ilimitadas","Todas as línguas","Editor completo","Avisos do anfitrião","Suporte prioritário","Todas as funções futuras"], cta: "Obter acesso vitalício →", badge: "Melhor valor" },
    footerText: "© 2025 csreq. Escreve melhores pedidos de CouchSurfing.",
  },
} as const;

const EXAMPLE_LETTERS = [
  {
    host: "Marco · Florence, Italy",
    tag: "Artist",
    preview: "Your profile stopped me — not because of the location, but because of what you wrote about watercolor and early morning light...",
    full: `Hi Marco,

Your profile stopped me — not because of the location, but because of what you wrote about watercolor and early morning light. I've been chasing that same quality of morning for two years with a camera, and there's something about how you described it that made me want to paint instead of photograph.

I'm Alex, traveling from Istanbul to Florence for a short photography project on the city's architecture and markets. I'm quiet in the mornings, keep things tidy, and genuinely enjoy conversations about how people see. Yours sounds like one worth having.

I'm hoping to stay June 12 to 15. I'd love to see your work if you're willing to share it.

Take care,
Alex`,
  },
  {
    host: "Kenji · Kyoto, Japan",
    tag: "Trail runner",
    preview: "I've been planning this Kyoto trip around the trails rather than the temples, so finding your profile felt like exactly the right kind of luck...",
    full: `Hi Kenji,

I've been planning this Kyoto trip around the trails rather than the temples, so finding your profile felt like exactly the right kind of luck. The section about your morning runs near Fushimi Inari — I've looked up those paths and I'm already mapping them in my head.

I'm Alex from Berlin, spending three weeks in the Kansai region mostly on foot. I wake up early, don't need much space, and genuinely prefer quiet evenings over going out. I think I'd be a low-maintenance guest.

I'm hoping to arrive July 8 and leave on the 10th. Happy to join you on a trail run if you're up for company that morning.

Hope to hear from you,
Alex`,
  },
  {
    host: "Claire · Lyon, France",
    tag: "Foodie",
    preview: "Your description of the Saturday market — knowing the vendors, choosing cheese by the rind — is exactly the reason I'm spending three days in Lyon...",
    full: `Hi Claire,

Your description of the Saturday market — knowing the vendors, choosing cheese by the rind — is exactly the reason I'm spending three days in Lyon and not just passing through.

I'm Alex from London, taking two weeks to travel slowly through France. I cook regularly at home and I tend to learn more about a place from its food than from anything else. Lyon has been on my list for two years.

I'm looking at September 3 to 5 if you have space. I'm quiet, keep things clean, and won't be in your way. If you happen to be cooking during the visit, I'd love to watch — no expectations beyond that.

Hope to hear from you,
Alex`,
  },
];

const FEATURES = [
  { icon: "✦", title: "Sounds human, not AI", body: "24 AI writing patterns blocked — no em dashes, no \"vibrant tapestries\", no rule of three. Your couch request reads like you wrote it." },
  { icon: "◎", title: "25 languages", body: "Write your CouchSurfing request in any language your host speaks. One click." },
  { icon: "⚑", title: "Host condition warnings", body: "Detects gender restrictions, nudism, minimum stays, and other important conditions before you write your couch request." },
  { icon: "⊡", title: "CouchSurfing character limit", body: "CouchSurfing cuts requests at 995 characters. csreq enforces this automatically — your message always arrives complete." },
];

function LetterModal({ letter, host, onClose, copyLabel, copiedLabel, badge }: { letter: string; host: string; onClose: () => void; copyLabel: string; copiedLabel: string; badge: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modal = (
    <div
      className="animate-backdrop-in"
      style={{
        position: "fixed", inset: 0, zIndex: 9990,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        background: "rgba(8,8,8,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-modal-in"
        style={{
          width: "100%", maxWidth: "560px", position: "relative",
          background: "var(--color-surface)", border: "1px solid var(--color-edge-hi)",
          borderRadius: "24px", overflow: "hidden",
          maxHeight: "90dvh", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--color-edge)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: "0.68rem", color: "var(--color-amber)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, marginBottom: "2px" }}>{badge}</p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-ink)" }}>{host}</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={copy}
              style={{
                padding: "6px 14px", fontSize: "0.75rem", borderRadius: "100px",
                border: `1px solid ${copied ? "rgba(224,120,48,0.4)" : "var(--color-edge)"}`,
                background: copied ? "var(--color-amber-dim)" : "transparent",
                color: copied ? "var(--color-amber)" : "var(--color-ink-muted)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {copied ? copiedLabel : copyLabel}
            </button>
            <button
              onClick={onClose}
              style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(255,255,255,0.06)", border: "1px solid var(--color-edge)",
                color: "var(--color-ink-muted)", fontSize: "0.85rem",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "2rem 2.5rem 2.5rem", flexGrow: 1 }}>
          {/* Ruled paper */}
          <div style={{
            background: "var(--color-paper)", borderRadius: "16px",
            padding: "2rem 2.5rem", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, var(--color-paper-line) 27px, var(--color-paper-line) 28px)",
              backgroundPosition: "0 2rem", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: "2rem",
              width: "1px", background: "var(--color-paper-line)", opacity: 0.6, pointerEvents: "none",
            }} />
            <pre style={{
              fontFamily: "var(--font-mono)", fontSize: "0.875rem", lineHeight: 1.9,
              color: "var(--color-paper-ink)", whiteSpace: "pre-wrap", wordBreak: "break-word",
              position: "relative", paddingLeft: "1rem", margin: 0,
            }}>
              {letter}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}

export default function LandingPage() {
  const [openLetter, setOpenLetter] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<Lang>("EN");
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("csreq_theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    const savedLang = localStorage.getItem("csreq_app_lang") as Lang | null;
    if (savedLang && LANGS.some(l => l.code === savedLang)) setLang(savedLang);
  }, []);

  const lt = LT[lang] ?? LT.EN;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      glowRef.current?.style.setProperty("--gx", `${e.clientX}px`);
      glowRef.current?.style.setProperty("--gy", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const toggleTheme = (m: "dark" | "light") => {
    setTheme(m);
    document.documentElement.setAttribute("data-theme", m);
    localStorage.setItem("csreq_theme", m);
  };

  const toggleLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("csreq_app_lang", l);
  };

  return (
    <>
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(700px circle at var(--gx, -999px) var(--gy, -999px), var(--glow-color, rgba(224,120,48,0.055)), transparent 60%)",
        }}
      />

      {openLetter !== null && (
        <LetterModal
          letter={EXAMPLE_LETTERS[openLetter].full}
          host={EXAMPLE_LETTERS[openLetter].host}
          onClose={() => setOpenLetter(null)}
          copyLabel={lt.exCopy}
          copiedLabel={lt.exCopied}
          badge={lt.exModalBadge}
        />
      )}

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--color-edge)",
        background: "var(--color-nav-bg)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.25rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Logo size={36} spin={false} />
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.01em" }}>csreq</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className="hide-sm" style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)", borderRadius: "8px", padding: "2px", gap: "2px" }}>
              {(["dark", "light"] as const).map(m => (
                <button key={m} onClick={() => toggleTheme(m)} style={{
                  padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600,
                  border: "none", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s",
                  background: theme === m ? "var(--color-amber)" : "transparent",
                  color: theme === m ? "#fff" : "var(--color-ink-muted)",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  {m === "dark" ? `◗ ${lt.dark}` : `◖ ${lt.light}`}
                </button>
              ))}
            </div>
            <select
              value={lang}
              onChange={e => toggleLang(e.target.value as Lang)}
              aria-label="Language"
              style={{
                padding: "4px 8px", fontSize: "0.72rem", fontWeight: 600,
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-edge)",
                borderRadius: "8px", color: "var(--color-ink-muted)", cursor: "pointer", outline: "none", flexShrink: 0,
              }}
            >
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            <Link
              href="/app"
              style={{
                padding: "7px 16px", fontSize: "0.82rem", fontWeight: 600,
                background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                color: "#fff", borderRadius: "100px", textDecoration: "none",
                boxShadow: "0 2px 10px rgba(224,120,48,0.3)", transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {lt.tryFree}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem, 8vw, 6rem) 1.25rem clamp(2.5rem, 6vw, 5rem)" }}>
        <div className="animate-fade-up">
          <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "1rem", fontWeight: 500 }}>
            {lt.heroBadge}
          </p>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
            fontWeight: 300, color: "var(--color-ink)", lineHeight: 1.05,
            letterSpacing: "-0.025em", maxWidth: "680px", marginBottom: "1.5rem",
          }}>
            {lt.heroTitle}
            <em style={{ fontStyle: "italic", color: "var(--color-ink-muted)" }}>{lt.heroItalic}</em>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--color-ink-muted)", maxWidth: "460px", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            {lt.heroSub}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/app"
              style={{
                padding: "14px 28px", fontSize: "0.95rem", fontWeight: 600,
                background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)",
                color: "#fff", borderRadius: "14px", textDecoration: "none",
                boxShadow: "0 4px 20px rgba(224,120,48,0.3)", transition: "all 0.2s", display: "inline-block",
              }}
            >
              {lt.tryFree}
            </Link>
            <span style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>
              {lt.heroFreeNote}
            </span>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* Example letters */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.exBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {lt.exTitle}
          </h2>
          <p style={{ color: "var(--color-ink-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            {lt.exSub}
          </p>
        </div>

        <div className="r-grid-3 swipe-cards">
          {EXAMPLE_LETTERS.map((ex, i) => (
            <button
              key={i}
              onClick={() => setOpenLetter(i)}
              style={{
                background: "var(--color-paper)", border: "1px solid var(--color-edge-hi)",
                borderRadius: "16px", padding: "1.5rem", textAlign: "left",
                cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; e.currentTarget.style.borderColor = "rgba(224,120,48,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "var(--color-edge-hi)"; }}
            >
              {/* Ruled lines */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "repeating-linear-gradient(transparent, transparent 22px, var(--color-paper-line) 22px, var(--color-paper-line) 23px)",
                backgroundPosition: "0 3.5rem", pointerEvents: "none", opacity: 0.6,
              }} />

              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{
                    fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "var(--color-amber)", background: "var(--color-amber-dim)",
                    border: "1px solid rgba(224,120,48,0.25)", padding: "2px 8px", borderRadius: "100px",
                  }}>{ex.tag}</span>
                  <span style={{ fontSize: "0.65rem", color: "var(--color-paper-ink)", opacity: 0.5 }}>Read →</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--color-paper-ink)", opacity: 0.7, marginBottom: "0.75rem", letterSpacing: "0.01em" }}>
                  To: {ex.host}
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", lineHeight: 1.8, color: "var(--color-paper-ink)", margin: 0 }}>
                  {ex.preview}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* How it works */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.howBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {lt.howTitle}
          </h2>
        </div>

        <div className="r-grid-steps">
          {lt.howSteps.map((step, i) => ({ ...step, n: ["01","02","03"][i] })).map(step => (
            <div key={step.n} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                border: "1px solid var(--color-edge)", background: "rgba(255,255,255,0.02)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-amber)", fontWeight: 600,
              }}>{step.n}</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 400, color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)", lineHeight: 1.7 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* Why not ChatGPT */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3.5rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.vsBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15, maxWidth: "600px" }}>
            {lt.vsTitle}
            <em style={{ fontStyle: "italic", color: "var(--color-ink-muted)" }}>{lt.vsItalic}</em>
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--color-ink-muted)", maxWidth: "520px", lineHeight: 1.75, marginTop: "1rem" }}>
            {lt.vsSub}
          </p>
        </div>

        <div className="r-grid-2 swipe-cards">
          {/* Card 1 */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{lt.vsProblem}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)" }}>{lt.vsCards[0].title}</h3>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{lt.vsCards[0].body}</p>
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--color-edge)", borderRadius: "12px", padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 0.4rem", color: "var(--color-ink-muted)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{lt.vsCards[0].listTitle}</p>
              {lt.vsCards[0].list.map(phrase => (
                <div key={phrase} style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(220,80,80,0.75)" }}>
                  <span style={{ fontSize: "0.6rem" }}>✕</span>
                  <span style={{ textDecoration: "line-through", opacity: 0.7 }}>{phrase}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{lt.vsProblem}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)" }}>{lt.vsCards[1].title}</h3>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{lt.vsCards[1].body}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(220,60,60,0.06)", border: "1px solid rgba(220,60,60,0.15)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                <span style={{ fontSize: "1.1rem" }}>✕</span>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "rgba(220,80,80,0.8)", fontWeight: 600, margin: "0 0 1px" }}>{lt.vsCards[1].badLabel}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", margin: 0 }}>{lt.vsCards[1].badText}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--color-amber-dim)", border: "1px solid rgba(224,120,48,0.2)", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                <span style={{ color: "var(--color-amber)", fontSize: "1.1rem" }}>✓</span>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "var(--color-amber)", fontWeight: 600, margin: "0 0 1px" }}>{lt.vsCards[1].goodLabel}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", margin: 0 }}>{lt.vsCards[1].goodText}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{lt.vsProblem}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)" }}>{lt.vsCards[2].title}</h3>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{lt.vsCards[2].body1}</p>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7 }}>{lt.vsCards[2].body2}</p>
          </div>

          {/* Card 4 */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>{lt.vsProblem}</p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--color-ink)" }}>{lt.vsCards[3].title}</h3>
            </div>
            <p style={{ fontSize: "0.83rem", color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{lt.vsCards[3].body}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {lt.vsCards[3].warnings.map(w => (
                <div key={w} style={{ display: "flex", gap: "10px", alignItems: "center", background: "rgba(224,120,48,0.06)", border: "1px solid rgba(224,120,48,0.15)", borderRadius: "8px", padding: "0.6rem 0.9rem" }}>
                  <span style={{ color: "var(--color-amber)", fontSize: "0.85rem" }}>⚑</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)" }}>{w} {lt.vsCards[3].warnSuffix}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginTop: "1rem", lineHeight: 1.6 }}>{lt.vsCards[3].warnNote}</p>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* Features */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.featBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {lt.featTitle}
            <em style={{ fontStyle: "italic", color: "var(--color-ink-muted)" }}>{lt.featItalic}</em>
          </h2>
        </div>

        <div className="r-grid-2">
          {FEATURES.map(f => (
            <div key={f.title} style={{
              border: "1px solid var(--color-edge)", borderRadius: "16px",
              padding: "1.5rem", background: "rgba(255,255,255,0.015)",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-edge-hi)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-edge)")}
            >
              <div style={{ fontSize: "1.1rem", color: "var(--color-amber)", marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-ink)", marginBottom: "0.4rem" }}>{f.title}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)", lineHeight: 1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "var(--color-edge)", margin: "0 1.25rem" }} />

      {/* Pricing */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.25rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-amber)", marginBottom: "0.6rem", fontWeight: 500 }}>
            {lt.pricBadge}
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--color-ink)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {lt.pricTitle}
          </h2>
        </div>

        <div className="r-grid-pricing swipe-cards">
          {/* Free */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{lt.pricFree.label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.35rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--color-ink)" }}>{lt.pricFree.price}</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginBottom: "1.5rem" }}>{lt.pricFree.note}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
              {lt.pricFree.features.map(f => (
                <div key={f} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-amber)", fontSize: "0.7rem" }}>✓</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/app" style={{ display: "block", textAlign: "center", padding: "0.75rem", border: "1px solid var(--color-edge-hi)", borderRadius: "12px", color: "var(--color-ink)", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}>
              {lt.pricFree.cta}
            </Link>
          </div>

          {/* Monthly */}
          <div style={{ border: "1px solid var(--color-edge)", borderRadius: "20px", padding: "1.75rem" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--color-ink-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{lt.pricMonthly.label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.35rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--color-ink)" }}>{lt.pricMonthly.price}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--color-ink-muted)" }}>{lt.pricMonthly.per}</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginBottom: "1.5rem" }}>{lt.pricMonthly.note}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
              {lt.pricMonthly.features.map(f => (
                <div key={f} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-amber)", fontSize: "0.7rem" }}>✓</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/app" style={{ display: "block", textAlign: "center", padding: "0.75rem", border: "1px solid var(--color-edge-hi)", borderRadius: "12px", color: "var(--color-ink)", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}>
              {lt.pricMonthly.cta}
            </Link>
          </div>

          {/* Lifetime */}
          <div style={{ border: "1px solid rgba(224,120,48,0.45)", borderRadius: "20px", padding: "1.75rem", background: "var(--color-amber-dim)", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)", color: "#fff", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 12px", borderRadius: "100px", boxShadow: "0 2px 8px rgba(224,120,48,0.4)", whiteSpace: "nowrap" }}>
              {lt.pricLifetime.badge}
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--color-amber)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>{lt.pricLifetime.label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.35rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--color-ink)" }}>{lt.pricLifetime.price}</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-muted)", marginBottom: "1.5rem" }}>{lt.pricLifetime.note}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
              {lt.pricLifetime.features.map(f => (
                <div key={f} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-amber)", fontSize: "0.7rem" }}>✓</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/app" style={{ display: "block", textAlign: "center", padding: "0.75rem", background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-hi) 100%)", borderRadius: "12px", color: "#fff", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 3px 12px rgba(224,120,48,0.3)", transition: "all 0.2s" }}>
              {lt.pricLifetime.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--color-edge)", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 500, color: "var(--color-ink-muted)" }}>csreq</span>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <a
              href="https://likosertugrul.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ink)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ink-muted)")}
            >
              by likosertugrul.com
            </a>
            <p style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)", margin: 0 }}>{lt.footerText}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
