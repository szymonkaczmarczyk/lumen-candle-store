import type { Locale } from "@lumen/shared";
import type { LegalDocument } from "./types";

const controller = "Lumen Sp. z o.o., Aleje Jerozolimskie 34, 00-001 Warszawa, NIP 1000000001, KRS 1001001001";

export const privacy: Record<Locale, LegalDocument> = {
  pl: {
    title: "Polityka prywatności",
    updatedAt: "2026-10-12",
    sections: [
      {
        id: "administrator",
        heading: "1. Administrator danych",
        paragraphs: [
          `Administratorem Twoich danych osobowych jest ${controller} (dalej: Administrator).`,
          "W sprawach danych osobowych napisz na kontakt@lumen.com albo na adres siedziby.",
        ],
      },
      {
        id: "cele",
        heading: "2. Cele i podstawy przetwarzania",
        paragraphs: [
          "Zawarcie i wykonanie umowy sprzedaży, w tym obsługa płatności, wysyłka i kontakt w sprawie zamówienia: art. 6 ust. 1 lit. b RODO.",
          "Prowadzenie Konta: art. 6 ust. 1 lit. b RODO.",
          "Rozpatrywanie reklamacji i odstąpień od umowy oraz wystawianie dokumentów księgowych: art. 6 ust. 1 lit. c RODO w związku z przepisami o prawach konsumenta i przepisami podatkowymi.",
          "Ustalenie, dochodzenie i obrona roszczeń oraz zapewnienie bezpieczeństwa sklepu, w tym ochrona przed nadużyciami i atakami: art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes Administratora).",
          "Podanie danych jest dobrowolne, ale niezbędne do złożenia zamówienia lub założenia Konta.",
        ],
      },
      {
        id: "zakres",
        heading: "3. Jakie dane przetwarzamy",
        paragraphs: [
          "Imię i nazwisko, adres e-mail, numer telefonu, adres dostawy lub kod paczkomatu, historię zamówień, a dla Konta również zaszyfrowany skrót hasła (argon2id). Nie przetwarzamy pełnych danych kart płatniczych, obsługuje je operator płatności.",
          "Technicznie przetwarzamy adres IP i dane o przeglądarce w logach serwera w celu zapewnienia bezpieczeństwa.",
        ],
      },
      {
        id: "odbiorcy",
        heading: "4. Odbiorcy danych",
        paragraphs: [
          "Stripe Payments Europe, Ltd. (obsługa płatności), InPost sp. z o.o. (dostawa), Resend (wysyłka e-maili transakcyjnych) oraz Vercel Inc. (hosting).",
          "Niektórzy odbiorcy mają siedzibę poza Europejskim Obszarem Gospodarczym, głównie w USA. Przekazanie odbywa się na podstawie decyzji Komisji Europejskiej o odpowiednim stopniu ochrony (EU-US Data Privacy Framework) albo standardowych klauzul umownych.",
        ],
      },
      {
        id: "okres",
        heading: "5. Jak długo przechowujemy dane",
        paragraphs: [
          "Dane zamówień: przez okres przedawnienia roszczeń oraz przez 5 lat od końca roku podatkowego ze względu na obowiązki podatkowe.",
          "Dane Konta: do czasu jego usunięcia, a potem przez okres przedawnienia ewentualnych roszczeń.",
          "Logi bezpieczeństwa: 90 dni.",
        ],
      },
      {
        id: "prawa",
        heading: "6. Twoje prawa",
        paragraphs: [
          "Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz prawo sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie.",
          "Masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.",
          "Nie podejmujemy decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowaniu, które wywoływałyby wobec Ciebie skutki prawne.",
        ],
      },
      {
        id: "cookies",
        heading: "7. Pliki cookies i pamięć przeglądarki",
        paragraphs: [
          "Używamy wyłącznie plików niezbędnych do działania sklepu: lumen_session (utrzymanie zalogowania, do 30 dni), NEXT_LOCALE (zapamiętanie wersji językowej) oraz pamięci przeglądarki lumen-cart (zawartość koszyka). Na etapie płatności Stripe może zapisać własne pliki niezbędne do zapobiegania oszustwom.",
          "Nie używamy plików analitycznych ani marketingowych. Jeśli to się zmieni, zapytamy o zgodę przed ich zapisaniem.",
          "Pliki możesz usunąć w ustawieniach przeglądarki. Zablokowanie plików niezbędnych może uniemożliwić złożenie zamówienia.",
        ],
      },
      {
        id: "zmiany",
        heading: "8. Zmiany polityki",
        paragraphs: ["O istotnych zmianach poinformujemy na tej stronie. Data ostatniej aktualizacji jest podana na górze dokumentu."],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    updatedAt: "2026-10-12",
    sections: [
      {
        id: "controller",
        heading: "1. Data controller",
        paragraphs: [
          `Your personal data is controlled by ${controller} (the Controller).`,
          "For data protection matters, write to kontakt@lumen.com or to the registered address.",
        ],
      },
      {
        id: "purposes",
        heading: "2. Purposes and legal bases",
        paragraphs: [
          "Concluding and performing the sales contract, including payments, shipping and order communication: Article 6(1)(b) GDPR.",
          "Running your Account: Article 6(1)(b) GDPR.",
          "Handling complaints and withdrawals and issuing accounting documents: Article 6(1)(c) GDPR in connection with consumer and tax law.",
          "Establishing, pursuing and defending claims and keeping the shop secure, including fraud and attack prevention: Article 6(1)(f) GDPR (the Controller's legitimate interest).",
          "Providing data is voluntary but necessary to place an order or create an Account.",
        ],
      },
      {
        id: "scope",
        heading: "3. What data we process",
        paragraphs: [
          "Name, e-mail address, phone number, delivery address or locker code, order history and, for Accounts, a hashed password (argon2id). We do not process full card details, they are handled by the payment provider.",
          "For security we process IP addresses and browser data in server logs.",
        ],
      },
      {
        id: "recipients",
        heading: "4. Recipients",
        paragraphs: [
          "Stripe Payments Europe, Ltd. (payments), InPost sp. z o.o. (delivery), Resend (transactional e-mail) and Vercel Inc. (hosting).",
          "Some recipients are based outside the European Economic Area, mainly in the USA. Transfers rely on the European Commission adequacy decision (EU-US Data Privacy Framework) or standard contractual clauses.",
        ],
      },
      {
        id: "retention",
        heading: "5. Retention",
        paragraphs: [
          "Order data: for the limitation period of claims and for 5 years from the end of the tax year due to tax obligations.",
          "Account data: until the Account is deleted, then for the limitation period of any claims.",
          "Security logs: 90 days.",
        ],
      },
      {
        id: "rights",
        heading: "6. Your rights",
        paragraphs: [
          "You have the right to access, rectify, erase, restrict and port your data and to object to processing based on legitimate interest.",
          "You may lodge a complaint with the President of the Personal Data Protection Office (UODO), ul. Stawki 2, 00-193 Warsaw, Poland.",
          "We do not make decisions based solely on automated processing, including profiling, that produce legal effects for you.",
        ],
      },
      {
        id: "cookies",
        heading: "7. Cookies and browser storage",
        paragraphs: [
          "We only use what the shop needs to work: lumen_session (keeps you signed in, up to 30 days), NEXT_LOCALE (remembers the language) and the lumen-cart browser storage entry (cart contents). During payment Stripe may set its own cookies needed for fraud prevention.",
          "We do not use analytics or marketing cookies. If that changes, we will ask for consent before setting them.",
          "You can delete cookies in your browser settings. Blocking essential cookies may prevent you from placing an order.",
        ],
      },
      {
        id: "changes",
        heading: "8. Changes",
        paragraphs: ["We will announce significant changes on this page. The last update date is shown at the top."],
      },
    ],
  },
};
