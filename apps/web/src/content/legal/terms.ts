import type { Locale } from "@lumen/shared";
import type { LegalDocument } from "./types";

const seller = "Lumen Sp. z o.o., Aleje Jerozolimskie 34, 00-001 Warszawa, NIP 1000000001, REGON 010101010";

export const terms: Record<Locale, LegalDocument> = {
  pl: {
    title: "Regulamin sklepu",
    updatedAt: "2026-10-13",
    sections: [
      {
        id: "postanowienia-ogolne",
        heading: "1. Postanowienia ogólne",
        paragraphs: [
          `Sklep internetowy Lumen, dostępny pod adresem https://lumen.com, prowadzi ${seller}, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS 1001001001 (dalej: Sprzedawca).`,
          "Kontakt ze Sprzedawcą: e-mail kontakt@lumen.com, telefon +48 500 000 000, adres do korespondencji i zwrotów: Lumen Sp. z o.o. - Dział zwrotów, Aleje Jerozolimskie 34, 00-001 Warszawa.",
          "Regulamin określa zasady zawierania umów sprzedaży przez sklep, świadczenia usług drogą elektroniczną, odstąpienia od umowy i składania reklamacji. Regulamin jest udostępniany nieodpłatnie przed zawarciem umowy w sposób umożliwiający jego pobranie, utrwalenie i wydrukowanie.",
          "Ceny podane w sklepie są cenami brutto w złotych polskich i zawierają podatek VAT. Koszt dostawy jest podawany osobno przed złożeniem zamówienia.",
        ],
      },
      {
        id: "definicje",
        heading: "2. Definicje",
        paragraphs: [
          "Klient: osoba fizyczna, osoba prawna lub jednostka organizacyjna, która składa zamówienie w sklepie.",
          "Konsument: Klient będący osobą fizyczną, który zawiera umowę niezwiązaną bezpośrednio z jego działalnością gospodarczą lub zawodową. Przepisy o konsumentach stosuje się również do osoby fizycznej prowadzącej działalność gospodarczą, gdy umowa nie ma dla niej charakteru zawodowego (art. 38a ustawy o prawach konsumenta).",
          "Konto: bezpłatna usługa umożliwiająca zapisanie adresów i przeglądanie historii zamówień.",
        ],
      },
      {
        id: "wymagania-techniczne",
        heading: "3. Wymagania techniczne i usługi elektroniczne",
        paragraphs: [
          "Do korzystania ze sklepu potrzebne są: urządzenie z dostępem do internetu, aktualna przeglądarka z włączoną obsługą JavaScript i ciasteczek oraz aktywny adres e-mail.",
          "Sprzedawca świadczy drogą elektroniczną usługi: przeglądania oferty, koszyka, formularza zamówienia i Konta. Umowa o prowadzenie Konta zostaje zawarta na czas nieokreślony z chwilą rejestracji. Klient może ją wypowiedzieć w każdej chwili, pisząc na kontakt@lumen.com.",
          "Zakazane jest dostarczanie treści o charakterze bezprawnym oraz podejmowanie działań zakłócających działanie sklepu.",
        ],
      },
      {
        id: "zamowienia",
        heading: "4. Składanie zamówień i zawarcie umowy",
        paragraphs: [
          "Zamówienie składa się, dodając produkty do koszyka, podając dane do wysyłki, wybierając sposób dostawy i płatności oraz akceptując regulamin.",
          "Kliknięcie przycisku płatności oznacza złożenie zamówienia z obowiązkiem zapłaty. Umowa sprzedaży zostaje zawarta z chwilą otrzymania przez Klienta e-maila z potwierdzeniem przyjęcia zamówienia.",
          "Treść umowy jest utrwalana w potwierdzeniu wysyłanym e-mailem oraz, dla Klientów z Kontem, w historii zamówień.",
        ],
      },
      {
        id: "platnosci",
        heading: "5. Płatności",
        paragraphs: [
          "Dostępne metody płatności: karta płatnicza, BLIK, Przelewy24, Apple Pay i Google Pay. Płatności obsługuje Stripe Payments Europe, Ltd. Sprzedawca nie przechowuje danych kart płatniczych.",
          "Zamówienie jest realizowane po zaksięgowaniu płatności. Nieopłacone zamówienie zostaje anulowane po 24 godzinach.",
          "Dowodem zakupu jest paragon, a na żądanie faktura VAT. Oba dokumenty wysyłamy wyłącznie elektronicznie, na adres e-mail podany w zamówieniu.",
        ],
      },
      {
        id: "dostawa",
        heading: "6. Dostawa",
        paragraphs: [
          "Dostawa odbywa się na terenie Polski kurierem InPost albo do Paczkomatu InPost. Aktualny cennik wysyłek znajduje się na stronie Dostawa i zwroty, a koszt dostawy jest widoczny także na etapie składania zamówienia. Dostawa jest bezpłatna od wartości zamówienia podanej w cenniku.",
          "Zamówienie jest przekazywane przewoźnikowi w ciągu 1-2 dni roboczych od zaksięgowania płatności. Czas doręczenia zależy od przewoźnika i zwykle wynosi 1-2 dni robocze.",
          "Klient powinien sprawdzić przesyłkę przy odbiorze. W razie uszkodzenia warto spisać protokół szkody z przewoźnikiem, co ułatwi reklamację, ale nie jest jej warunkiem.",
        ],
      },
      {
        id: "odstapienie",
        heading: "7. Prawo odstąpienia od umowy",
        paragraphs: [
          "Konsument może odstąpić od umowy bez podania przyczyny w terminie 14 dni od otrzymania produktu. Wystarczy wysłać oświadczenie przed upływem terminu na kontakt@lumen.com lub na adres: Lumen Sp. z o.o. - Dział zwrotów, Aleje Jerozolimskie 34, 00-001 Warszawa. Można skorzystać z wzoru formularza z załącznika nr 2 do ustawy o prawach konsumenta.",
          "Sprzedawca zwraca wszystkie płatności, w tym najtańszy oferowany koszt dostawy, w ciągu 14 dni od otrzymania oświadczenia, tą samą metodą, której użył Konsument. Sprzedawca może wstrzymać zwrot do chwili otrzymania produktu lub dowodu jego odesłania.",
          "Konsument odsyła produkt w ciągu 14 dni od odstąpienia i ponosi bezpośredni koszt odesłania. Konsument odpowiada za zmniejszenie wartości produktu wynikające z korzystania z niego w sposób wykraczający poza konieczny do stwierdzenia jego charakteru, cech i funkcjonowania.",
          "Prawo odstąpienia nie przysługuje w przypadkach z art. 38 ustawy o prawach konsumenta, w szczególności dla produktów wykonanych według specyfikacji Konsumenta.",
        ],
      },
      {
        id: "reklamacje",
        heading: "8. Reklamacje i zgodność towaru z umową",
        paragraphs: [
          "Sprzedawca odpowiada wobec Konsumenta za brak zgodności towaru z umową istniejący w chwili dostarczenia i ujawniony w ciągu dwóch lat od tej chwili, na zasadach z rozdziału 5a ustawy o prawach konsumenta.",
          "Reklamację można zgłosić na kontakt@lumen.com lub pisemnie na adres: Lumen Sp. z o.o. - Dział zwrotów, Aleje Jerozolimskie 34, 00-001 Warszawa. Warto opisać problem, dołączyć zdjęcia i numer zamówienia.",
          "Sprzedawca odpowiada na reklamację w ciągu 14 dni od jej otrzymania. Brak odpowiedzi w tym terminie oznacza uznanie reklamacji.",
          "Wobec Klientów niebędących Konsumentami odpowiedzialność z tytułu rękojmi jest wyłączona w zakresie dopuszczonym przez prawo.",
        ],
      },
      {
        id: "bezpieczenstwo",
        heading: "9. Bezpieczne używanie świec",
        paragraphs: [
          "Świecę należy palić na stabilnej, niepalnej powierzchni, z dala od przedmiotów łatwopalnych, dzieci i zwierząt. Nie wolno zostawiać płonącej świecy bez nadzoru. Szczegółowe zalecenia znajdują się na etykiecie i na karcie produktu.",
        ],
      },
      {
        id: "spory",
        heading: "10. Pozasądowe rozwiązywanie sporów",
        paragraphs: [
          "Konsument może skorzystać z pomocy miejskiego lub powiatowego rzecznika konsumentów, organizacji konsumenckich oraz stałych polubownych sądów konsumenckich przy wojewódzkich inspektoratach Inspekcji Handlowej. Informacje są dostępne na stronie prawakonsumenta.uokik.gov.pl.",
        ],
      },
      {
        id: "postanowienia-koncowe",
        heading: "11. Postanowienia końcowe",
        paragraphs: [
          "W sprawach nieuregulowanych stosuje się przepisy prawa polskiego, w szczególności Kodeksu cywilnego, ustawy o prawach konsumenta i ustawy o świadczeniu usług drogą elektroniczną.",
          "Sprzedawca może zmienić regulamin z ważnych przyczyn, takich jak zmiana przepisów lub metod płatności. Do zamówień złożonych przed zmianą stosuje się dotychczasowy regulamin.",
          "Zasady przetwarzania danych osobowych opisuje Polityka prywatności.",
        ],
      },
    ],
  },
  en: {
    title: "Terms of sale",
    updatedAt: "2026-10-13",
    sections: [
      {
        id: "general",
        heading: "1. General provisions",
        paragraphs: [
          `The Lumen online shop at https://lumen.com is run by ${seller}, entered in the register of entrepreneurs of the National Court Register under KRS number 1001001001 (the Seller).`,
          "Contact: e-mail kontakt@lumen.com, phone +48 500 000 000, postal and returns address: Lumen Sp. z o.o. - Returns Department, Aleje Jerozolimskie 34, 00-001 Warszawa, Poland.",
          "These terms set out the rules for sales contracts, electronic services, withdrawal from contracts and complaints. They are available free of charge before the contract is concluded and can be downloaded, saved and printed.",
          "Prices are gross prices in Polish złoty including VAT. Delivery costs are shown separately before the order is placed.",
        ],
      },
      {
        id: "definitions",
        heading: "2. Definitions",
        paragraphs: [
          "Customer: a natural person, legal person or organisational unit placing an order.",
          "Consumer: a Customer who is a natural person entering into a contract not directly related to their business or profession. Consumer provisions also apply to a sole trader when the contract is not of a professional nature for them (Article 38a of the Polish Consumer Rights Act).",
          "Account: a free service for saving addresses and viewing order history.",
        ],
      },
      {
        id: "technical",
        heading: "3. Technical requirements and electronic services",
        paragraphs: [
          "To use the shop you need a device with internet access, an up-to-date browser with JavaScript and cookies enabled, and an active e-mail address.",
          "The Seller provides these electronic services: browsing the offer, the cart, the order form and the Account. The Account agreement is concluded for an indefinite period upon registration and may be terminated at any time by writing to kontakt@lumen.com.",
          "Providing unlawful content or interfering with the shop's operation is prohibited.",
        ],
      },
      {
        id: "orders",
        heading: "4. Placing orders and concluding the contract",
        paragraphs: [
          "To order, add products to the cart, enter delivery details, choose delivery and payment methods and accept these terms.",
          "Clicking the payment button means placing an order with an obligation to pay. The sales contract is concluded when the Customer receives the order confirmation e-mail.",
          "The contract is recorded in the confirmation e-mail and, for Account holders, in the order history.",
        ],
      },
      {
        id: "payments",
        heading: "5. Payments",
        paragraphs: [
          "Available payment methods: payment card, BLIK, Przelewy24, Apple Pay and Google Pay. Payments are processed by Stripe Payments Europe, Ltd. The Seller does not store card details.",
          "Orders are fulfilled once payment is received. Unpaid orders are cancelled after 24 hours.",
          "Proof of purchase is a receipt or, on request, a VAT invoice. Both are sent electronically only, to the e-mail address given in the order.",
        ],
      },
      {
        id: "delivery",
        heading: "6. Delivery",
        paragraphs: [
          "We deliver within Poland by InPost courier or to an InPost parcel locker. Current delivery rates are listed on the Shipping & returns page and shown at checkout. Delivery is free above the order value stated in the rates.",
          "Orders are handed to the carrier within 1-2 business days of payment. Delivery time depends on the carrier and usually takes 1-2 business days.",
          "Please check the parcel on receipt. If it is damaged, a damage report with the carrier helps the complaint but is not required.",
        ],
      },
      {
        id: "withdrawal",
        heading: "7. Right of withdrawal",
        paragraphs: [
          "A Consumer may withdraw from the contract without giving a reason within 14 days of receiving the product by sending a statement to kontakt@lumen.com or to Lumen Sp. z o.o. - Returns Department, Aleje Jerozolimskie 34, 00-001 Warszawa, Poland before the deadline. The model form from Annex 2 to the Consumer Rights Act may be used.",
          "The Seller refunds all payments, including the cheapest delivery option offered, within 14 days of receiving the statement, using the same payment method. The Seller may withhold the refund until the product or proof of its return is received.",
          "The Consumer returns the product within 14 days of withdrawal and bears the direct cost of return. The Consumer is liable for any reduction in value resulting from handling beyond what is needed to establish the nature, characteristics and functioning of the product.",
          "The right of withdrawal does not apply in the cases listed in Article 38 of the Consumer Rights Act, in particular for products made to the Consumer's specification.",
        ],
      },
      {
        id: "complaints",
        heading: "8. Complaints and conformity with the contract",
        paragraphs: [
          "The Seller is liable to the Consumer for any lack of conformity existing at delivery and revealed within two years, under Chapter 5a of the Consumer Rights Act.",
          "Complaints can be sent to kontakt@lumen.com or in writing to Lumen Sp. z o.o. - Returns Department, Aleje Jerozolimskie 34, 00-001 Warszawa, Poland. Please describe the issue and include photos and the order number.",
          "The Seller replies within 14 days of receiving a complaint. No reply within that time means the complaint is accepted.",
          "For Customers who are not Consumers, warranty liability is excluded to the extent permitted by law.",
        ],
      },
      {
        id: "safety",
        heading: "9. Safe candle use",
        paragraphs: [
          "Burn the candle on a stable, non-flammable surface, away from flammable objects, children and pets. Never leave a burning candle unattended. Detailed guidance is on the label and the product page.",
        ],
      },
      {
        id: "disputes",
        heading: "10. Out-of-court dispute resolution",
        paragraphs: [
          "Consumers may seek help from municipal or district consumer ombudsmen, consumer organisations and permanent consumer arbitration courts at the Trade Inspection. Information is available at prawakonsumenta.uokik.gov.pl.",
        ],
      },
      {
        id: "final",
        heading: "11. Final provisions",
        paragraphs: [
          "Matters not covered here are governed by Polish law, in particular the Civil Code, the Consumer Rights Act and the Act on Providing Services by Electronic Means.",
          "The Seller may amend these terms for important reasons such as changes in law or payment methods. Orders placed before an amendment are governed by the previous terms.",
          "Personal data processing is described in the Privacy policy.",
        ],
      },
    ],
  },
};
