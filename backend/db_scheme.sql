--- Add pgvector extension
CREATE EXTENSION vector;

-- Create Participants Table
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Ratings Table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    participant_id INT REFERENCES participants(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE news_articles_flexible (
    id SERIAL PRIMARY KEY,
    message_id TEXT,
    title TEXT,
    sender TEXT,
    link TEXT,
    created_date TEXT,
    text TEXT,
    image_url TEXT,
    embedding VECTOR(1536)
);


CREATE TABLE chat_contexts (
    id SERIAL PRIMARY KEY,
    screen_name VARCHAR(255) UNIQUE NOT NULL,
    system_prompt TEXT NOT NULL,
    news_for_rating TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO chat_contexts (screen_name, system_prompt, news_for_rating)
VALUES
('rating_screen', 'This GPT sequentially presents news articles to the user. Each of the 54 articles is presented in German and includes a title, a brief summary (1-2 sentences), and a source link. Always provide the articles in the following format:\n\nTitle of the Article\nBrief Summary (1-2 sentences)\nSource: linked [URL]\n\nAt the start of the session, the GPT loads all 54 articles from the provided file into a list and shuffles them randomly. The GPT tracks which articles have been shown to ensure all 54 articles are presented without repetition. If the session is interrupted, it saves the current state to allow continuation from the last shown article.\n\nAfter presenting an article, the GPT asks the user: \"Auf einer Skala von 1 bis 5, wie stark interessierst du dich für diese Art von Nachricht? (1 = überhaupt nicht, 2 = nicht sehr interessiert, 3 = einigermaßen interessiert, 4 = sehr interessiert, 5 = äußerst interessiert).\" Once the user rates the article, the GPT moves to the next one until all 54 articles have been shown and rated. The GPT notifies the user when all articles have been presented and optionally provides a summary of their ratings and preferences.\n\nThe GPT refrains from providing additional information or repeating articles already presented. It ensures seamless session management and handles errors gracefully to maintain progress through the article list. Format responses using Markdown with proper spacing.  Use double line breaks (`\n\n`) between paragraphs for readability.  Bold important sections using **bold text**. * Format lists with - Item 1\n- Item 2.  Format links as [Text](https://example.com).', '
Label: Politik / Wirtschaft(REGIONAL)
Belegschaftsversammlung bei Thyssenkrupp: "Die Leute haben geweint"
Auf einer Belegschaftsversammlung bei Thyssenkrupp Steel in Bochum wurde es laut. Die Stahlarbeiter sind sauer und enttÃ¤uscht.
Mehr Infos: https://www1.wdr.de/nachrichten/ruhrgebiet/belegschaftsversammlung-thyssen-krupp-bochum-100.html

Label: Politik / Wirtschaft(REGIONAL)
â€žDas passtâ€œ: Nachfolge fÃ¼r beliebtes Bochumer CafÃ© gesichert
Bochum-Langendreer. Das CafÃ© Ana in Bochum-Langendreer hat zwei neue PÃ¤chterinnen. Warum es zum Wechsel kommt, was die beiden planen und wann sie starten.
Mehr Infos: https://www.waz.de/lokales/bochum/article407863245/das-passt-nachfolge-fuer-beliebtes-bochumer-cafC3A9-gesichert.html

Label: Politik / Wirtschaft(NOTREGIONAL)
Kompromisssuche: WÃ¤hlt ThÃ¼ringens Linke CDU-Chef Voigt?
Die Koalition von CDU, BSW und SPD in ThÃ¼ringen steht - doch bei der MinisterprÃ¤sidentenwahl am Donnerstag fehlt ihr in den ersten DurchgÃ¤ngen eine Stimme. Nun gibt es ein Angebot an die Linke.
Mehr Infos: https://www.ruhrnachrichten.de/dpa-infoline-zvr/kompromisssuche-waehlt-thueringens-linke-cdu-chef-voigt-w971928-2001475229/

Label: Politik / Wirtschaft(NOTREGIONAL)
Die beliebtesten Reise-StÃ¤dte der Welt â€“ Deutschland abgeschlagen
Die beliebtesten Orte fÃ¼r einen StÃ¤dtetrip liegen in Europa, doch Deutschland ist nicht dabei und eine Weltregion holt auf.
Mehr Infos: https://www.waz.de/panorama/article407833916/die-beliebtesten-reise-staedte-der-welt-deutschland-abgeschlagen.html

Label: Panorama / Freizeit (REGIONAL)
â€žHÃ¶hle der LÃ¶wenâ€œ: 250.000 Euro fÃ¼r Wasserkocher aus Bochum?
Bochum. Der â€žKezzelâ€œ soll elektrische Wasserkocher ablÃ¶sen â€“ erfunden hat ihn eine Bochumer Firma. In der â€žHÃ¶hle der LÃ¶wenâ€œ sucht sie einen Investor.
Mehr Infos: https://www.waz.de/lokales/bochum/article407850887/bochumer-mit-spontanerfindung-in-der-hoehle-der-loewen.html

Label: Panorama / Freizeit (REGIONAL)
Sterbebegleiterin: â€žDer Tod ist nicht nur ein schweres Themaâ€œ
Hospizverein Wattenscheid: 50 Ehrenamtliche helfen Todkranken. Sie besuchen sie im Krankenhaus, Altenheim oder zu Hause. Oft entstehen Bindungen.
Mehr Infos: https://www.waz.de/lokales/bochum/article407445821/sterbebegleiterin-der-tod-ist-nicht-nur-ein-schweres-thema.html

Label: Panorama / Freizeit (NOTREGIONAL)
Zweite Staffel von â€žSquid Gameâ€œ fÃ¼r Golden Globe nominiert
Berlin. Noch vor dem Erscheinen hat sich â€žSquid Game 2â€œ die erste Nominierung geholt. Unterdessen bricht die erste Staffel einen Netflix-Rekord.
Mehr Infos: https://www.waz.de/panorama/article407868145/zweite-staffel-von-squid-game-fuer-golden-globe-nominiert.html

Label: Panorama / Freizeit (NOTREGIONAL)
Hurricane Hunters fliegen mitten in Sturm: Ihr Job rettet Leben
hr Job hÃ¶rt sich gefÃ¤hrlich an, ist aber Ã¼berlebenswichtig: Hurricane Hunters fliegen regelmÃ¤ÃŸig mitten in StÃ¼rme wie â€žMiltonâ€œ hinein.
Mehr Infos: https://www.waz.de/panorama/article407446384/hurricane-hunters-fliegen-mitten-in-sturm-ihr-job-rettet-leben.html

Label: Lifestyle & Kultur (REGIONAL)
Stadtarchiv-Vortrag: â€žVon Dr. Kortums LandstÃ¤dtchen bis zur Industrie-GroÃŸstadtâ€œ
Bei der Reihe zur Bochumer Stadtgeschichte prÃ¤sentiert das Stadtarchiv â€“ Bochumer Zentrum fÃ¼r Stadtgeschichte, Wittener StraÃŸe 47, den Vortrag â€žBochumer Stadtansichten - von Dr. Kortums LandstÃ¤dtchen bis zur Industrie-GroÃŸstadtâ€œ.  Am Mittwoch, 11. Dezember, um 19 Uhr referiert Markus Lutter zu diesem Thema. Der Eintritt ist frei.
Mehr Infos: https://www.bochum.de/Pressemeldungen/5-Dezember-2024/Stadtarchiv-Vortrag--Von-Dr.-Kortums-Landstaedtchen-bis-zur-Industrie-Grossstadt-

Label: Lifestyle & Kultur (REGIONAL)
Umstrittener SchlagersÃ¤nger Michael Wendler tritt in Bochum auf
Bochum. Michael Wendler wird 2025 in Bochum ein Konzert spielen. Die Location wollte sich erst nicht Ã¤uÃŸern. Nun gibt es die BestÃ¤tigung - und Kritik.
Mehr Infos: https://www.waz.de/lokales/bochum/article407606590/tritt-michael-wendler-in-bochum-auf-disco-prater-schweigt.html

Label: Lifestyle & Kultur (NOTREGIONAL)
Schauspielerin Lilly ForgÃ¡ch mit 58 Jahren gestorben
MÃ¼nchen/Berlin. ForgÃ¡ch war vor allem aus dem Fernsehen bekannt, stand aber auch auf der TheaterbÃ¼hne. Nun starb die Schauspielerin nach kurzer Krankheit.
Mehr Infos: https://www.waz.de/kultur/tv-streaming/article407868503/schauspielerin-lilly-forgC3A1ch-mit-58-jahren-gestorben.html

Label: Lifestyle & Kultur (NOTREGIONAL)
Kino-Kritik zum Donald-Trump-Film: Unterhaltsam, aber flach
Der Regisseur Ali Abbasi hat dem Mann mit der Tolle ein Filmdrama gewidmet. Warum â€žThe Apprenticeâ€œ unterm Strich nicht Ã¼berzeugen kann.
Mehr Infos: https://www.waz.de/kultur/article407461908/donald-trumps-aufstieg-im-kino-immerhin-nicht-langweilig.html

Label: Ratgeber & Wissen (REGIONAL)
Interaktive Gesundheitskarte fÃ¼r Bochum
Das Gesundheitsamt der Stadt Bochum hat eine neue interaktive Gesundheitskarte verÃ¶ffentlicht. Sie bietet den BÃ¼rgerinnen und BÃ¼rgern eine umfassende Ãœbersicht Ã¼ber die wichtigsten Einrichtungen im Gesundheits- und Sozialwesen. Auf der Karte sind Standorte wie Arztpraxen, Kliniken, Apotheken, Pflegeeinrichtungen sowie soziale Beratungsdienste Ã¼bersichtlich markiert.
Mehr Infos: https://www.bochum.de/Pressemeldungen/9-Dezember-2024/Interaktive-Gesundheitskarte-fuer-Bochum

Label: Ratgeber & Wissen (REGIONAL)
SchnÃ¤ppchenjÃ¤ger aufgepasst: Versteigerung von Fundsachen
Das FundbÃ¼ro rÃ¤umt seinen Bestand auf und lÃ¤dt wieder zur Versteigerung von Fundsachen ein. Am Mittwoch, 11. Dezember, kommt ab 9 Uhr im Bildungs- und  Verwaltungszentrum (BVZ), Lore-Agnes-Raum, Gustav-Heinemann-Platz 2â€“6, ein Sammelsurium von Dingen unter den Hammer, die im FundbÃ¼ro von ihren Vorbesitzerinnen und Vorbesitzern nicht abgeholt wurden
Mehr Infos: https://www.bochum.de/Pressemeldungen/4-Dezember-2024/Schnaeppchenjaeger-aufgepasst-Versteigerung-von-Fundsachen

Label: Ratgeber & Wissen (NOTREGIONAL)
Beziehungsexperte enthÃ¼llt: Drei Merkmale begÃ¼nstigen Untreue
Was steckt wirklich hinter einem Seitensprung? Ein Paartherapeut erklÃ¤rt, welche Eigenschaften dabei eine Rolle spielen.
Mehr Infos: https://www.waz.de/ratgeber-wissen/article407806579/beziehungsexperte-enthuellt-drei-merkmale-beguenstigen-untreue.html

Label: Ratgeber & Wissen (NOTREGIONAL)
Angst vor der Probezeit? Wichtige Regeln erklÃ¤rt
Viele empfinden die Probezeit als eine stressige Phase - und setzen sich selbst stark unter Druck. Wer wichtige rechtliche Regeln kennt, kann Unsicherheiten aus dem Weg rÃ¤umen.
Quelle: https://www.ruhrnachrichten.de/dpa-infoline-zvr/angst-vor-der-probezeit-wichtige-regeln-erklaert-w971916-2001475196/

Label: Sport & Lokalsport (REGIONAL)
FÃ¼nf-Meter-Werfen entscheidet: Bochum verpasst Finalturnier knapp
Bochum. Bochums Wasserballerinnen Ã¼berzeugen in Serbien in der zweiten Runde des Challenger-Cups. Trainer ist stolz auf sein junges Team.
Mehr Infos: https://www.waz.de/sport/lokalsport/bochum/article407864419/fuenf-meter-werfen-entscheidet-bochum-verpasst-finalturnier-knapp.html

Label: Sport & Lokalsport (REGIONAL)
TuS Harpen dreht auf: Trainer mit guter Hand bei der Spielerwahl
Bochum. Der TuS Harpen galt in der Landesliga als einer der Abstiegskandidaten. Das Team von Trainer LÃ¼bbehusen aber Ã¼berrascht derzeit.
Mehr Infos: https://www.waz.de/sport/lokalsport/bochum/article407787337/tus-harpen-dreht-auf-trainer-mit-guter-hand-bei-der-spielerwahl.html

Label: Sport & Lokalsport (NOTREGIONAL)
FC Schalke zurÃ¼ck im Krisenmodus
Nach drei Spielen ohne Niederlage wÃ¤hnte sich der FC Schalke 04 im Aufwind. Das Spiel gegen den 1. Kaiserslautern hat jedoch gezeigt, dass es eher ein AuflÃ¼ftchen war.
Mehr Infos: https://www1.wdr.de/sport/fussball/zweite-bundesliga/fc-schalke-erster-fc-kaiserslautern-100.html

Label: Sport & Lokalsport (NOTREGIONAL)
Rafael Nadal: Ein ganz GroÃŸer geht, eine groÃŸe Ã„ra endet
Rafael Nadal hÃ¶rt zum Saisonende auf. Obwohl anfangs die verdiente Anerkennung fehlte, geht er als Legende des Sports. Ein Kommentar.
Mehr Infos: https://www.waz.de/sport/article407441315/rafael-nadal-ein-ganz-grosser-geht-eine-grosse-aera-endet.html

Label: KriminalitÃ¤t und persÃ¶nliche Sicherheit (REGIONAL)
Polizeihubschrauber sucht in Bochum nach S-Bahn-Surfern
Bochum. Ein Fahrgast in der S1 hat zwei unbekannte Personen am Zugende gemeldet. Sie wÃ¼rden schreien. Die Bundespolizei schickte viele KrÃ¤fte raus.
Mehr Infos: https://www.waz.de/lokales/bochum/article407853545/polizeihubschrauber-sucht-in-bochum-nach-s-bahn-surfern.html

Label: KriminalitÃ¤t und persÃ¶nliche Sicherheit (REGIONAL)
BPOL NRW: Mann mit blutverschmierten HÃ¤nden greift Bundespolizisten an
Gestern Morgen (8. Dezember) weigerte sich ein verletzter Mann am Bochumer Hauptbahnhof seine IdentitÃ¤t preiszugeben. WÃ¤hrend der Durchsuchung attackierte er die Bundespolizisten mit SchlÃ¤gen und Tritten.
Mehr Infos: https://hallobo.de/bpol-nrw-mann-mit-blutverschmierten-haenden-greiftbundespolizisten-an/

Label: KriminalitÃ¤t und persÃ¶nliche Sicherheit(NOTREGIONAL)
"Das ist unser Auto!": Unfallopfer der Lkw-Chaosfahrt berichtet
Mit diesem blauen Opel Meriva wurden ein Remscheider und seine Frau am Samstag zu Opfern der Chaosfahrt eines Lkw auf der A1. So erlebten sie den Unfall.
Mehr Infos: https://www1.wdr.de/nachrichten/lkw-chaosfahrt-unfall-opfer-bericht-100.html

Label: KriminalitÃ¤t und persÃ¶nliche Sicherheit(NOTREGIONAL)
Manhattan-Mord: Wurde der VerdÃ¤chtige vom â€žUnabomberâ€œ inspiriert?
Berlin/New York. Der Mord am Konzernchef in New York weist Parallelen zum Unabomber auf. Der kÃ¶nnte ein Vorbild fÃ¼r den HauptverdÃ¤chtigen gewesen sein.
Mehr Infos: https://www.waz.de/panorama/article407865565/moerder-von-brian-thompson-wurde-er-vom-unabomber-inspiriert.html

Label: Verkehr(REGIONAL)
Spatenstich fÃ¼r den neuen Radweg Opeltrasse
Das Radwegenetz in Bochum wÃ¤chst â€“ und erhÃ¤lt bald eine weitere wichtige West-Ost-Verbindung. Dank des FÃ¶rderprogramms â€žNahmobilitÃ¤tâ€œ mit dem Sonderprogramm â€žStadt und Landâ€œ kann nun die insgesamt 4,1 Kilometer lange Opeltrasse realisiert werden. Die Strecke verlÃ¤uft von der Alten Wittener StraÃŸe bis zur Springorumallee.
Mehr Infos: https://www.bochum.de/Pressemeldungen/6-Dezember-2024/Spatenstich-fuer-den-neuen-Radweg-Opeltrasse

Label: Verkehr(REGIONAL)
Sperrung bei Bochum: A40 ab Donnerstag wieder frei
Aus 15 wurden 18 Wochen Baustelle. Jetzt hat die Autobahn GmbH bekanntgegeben: in dieser Woche wird die A40-Baustelle aufgehoben.
Mehr Infos: https://www1.wdr.de/nachrichten/ruhrgebiet/a40-vollsperrung-ende-in-sicht-100.html

Label: Verkehr(NOTREGIONAL)
Ticketpreise steigen: Luftfahrt-PrÃ¤sident sagt, was jetzt droht
Reihenweise streichen Airlines FlÃ¼ge. LuftfahrtprÃ¤sident Bischof sagt, was sich in Deutschland Ã¤ndern muss â€“ auch bei EntschÃ¤digungen.
Mehr Infos: https://www.waz.de/wirtschaft/article407826569/fliegen-flug-airlines-lufthansa-eurowings-ryanair-bdl-verspaetungen-entschaedigung-standort.html

Label: Verkehr(NOTREGIONAL)
Bei der Bahn Ã¼berholt Italien Deutschland deutlich
SpÃ¤t, spÃ¤ter, Deutsche Bahn: Im europÃ¤ischen Ranking landet sie nur im unteren Mittelfeld. Mit der Trenitalia kann sie lÃ¤ngst nicht mithalten.
Mehr Infos: https://www.waz.de/panorama/article407862827/deutsche-bahn-studie-deckt-ueberraschende-staerken-auf.html

Label: Umwelt und Klimawandel (REGIONAL)
Volkshochschule bietet facettenreiches Programm beim â€žWochenende fÃ¼rs Klimaâ€œ
Die Volkshochschule (vhs) bietet bei der Aktion â€žJetzt! Ein Wochenende fÃ¼rs Klimaâ€œ am Samstag, 23. November, von 11 bis 15 Uhr im Bildungs- und Verwaltungszentrum, Gustav-Heinemann-Platz 2â€“6, ein facettenreiches Programm an: eine KleidertauschbÃ¶rse, ein Repair-CafÃ©, VortrÃ¤ge und Austausch zu nachhaltigem Konsum. Alle Veranstaltungen sind kostenlos. Anmeldungen sind unter der Rufnummer 0234 910 â€“ 15 55 oder Ã¼ber die Webseite vhs.bochum.de mÃ¶glich, aber nicht zwingend notwendig.
Mehr Infos: https://www.bochum.de/Pressemeldungen/8-November-2024/Volkshochschule-bietet-facettenreiches-Programm-beim--Wochenende-fuers-Klima-

Label: Umwelt und Klimawandel (REGIONAL)
Puppentheater reist mit StÃ¼ck zum Thema Umweltschutz durch Kitas
FrÃ¼h die Bedeutung von Umwelt- und Klimaschutz zu erklÃ¤ren: Das ist das Ziel des Kindertheaters â€žPapiermondâ€œ. Im Auftrag der stÃ¤dtischen Stabsstelle fÃ¼r Klimaschutz und Nachhaltigkeit besucht das Theater derzeit 25 KindertagesstÃ¤tten in Bochum.
Mehr Infos: https://www.bochum.de/Pressemeldungen/31-Oktober-2024/Puppentheater-reist-mit-Stueck-zum-Thema-Umweltschutz-durch-Kitas

Label: Umwelt und Klimawandel (NOTREGIONAL)
Warum Hurrikans auch in Europa wahrscheinlicher werden
Warmes Meerwasser befeuert die Hurrikan-Saison, mit Ãœberschwemmungen und VerwÃ¼stungen. Drohen StÃ¼rme wie Milton jetzt auch in Europa?
Mehr Infos: https://www.waz.de/ratgeber-wissen/article404839055/wetter-hurrikan-atlantik-stuerme-unwetter-risiko-spanien.html

Label: Umwelt und Klimawandel (NOTREGIONAL)
Heftige SonnenstÃ¼rme: Nasa macht Hoffnung auf mehr Polarlichter
Farbenfrohe Nordlichter sind jÃ¼ngst in weiten Teilen der Welt am Himmel erstrahlt. Warum es noch eine Weile lang so weitergehen kann.
Mehr Infos: https://www.waz.de/panorama/article407484605/heftige-sonnenstuerme-nasa-macht-hoffnung-auf-mehr-polarlichter.html

Label: Wissenschaft / Technologie (REGIONAL)
Vortrag im Planetarium: Geheimnisvolle Neutrinos
Im Bochumer Planetarium, Castroper StraÃŸe 67, ist am Mittwoch, 11. Dezember, um 20 Uhr Jonas Hellrung von der Ruhr-UniversitÃ¤t Bochum zu Gast. Er nimmt das Publikum mit zu einem ungewÃ¶hnlichen Observatorium am SÃ¼dpol der Erde, das die rÃ¤tselhaften Neutrinos beobachtet â€“ geisterhafte Teilchen, die nur sehr selten Ã¼berhaupt mit Materie wechselwirken und entsprechend schwer zu fangen sind.
Mehr Infos: https://www.bochum.de/Pressemeldungen/4-Dezember-2024/Vortrag-im-Planetarium-Geheimnisvolle-Neutrinos

Label: Wissenschaft / Technologie (REGIONAL)
Das Ruhrgebiet kann Strukturwandel: Kanzler Scholz besucht auf Einladung des RVR das Bochumer Innovationsquartier Mark 51Â°7
So geht Transformation im Ruhrgebiet: Regionaldirektor Garrelt Duin und Bochums OberbÃ¼rgermeister Thomas Eiskirch haben heute (26. August) Bundeskanzler Olaf Scholz die Entwicklung und Ansiedlungserfolge im Innovationsquartier Mark 51Â°7 in Bochum prÃ¤sentiert. Auf dem ehemaligen Opel-GelÃ¤nde haben sich wenige Jahre nach der SchlieÃŸung des Autowerks zahlreiche technologieorientierte Unternehmen, Start-ups und Forschungseinrichtungen angesiedelt. Scholz kam auf Einladung des Regionalverbandes Ruhr (RVR) nach Bochum.
Mehr Infos: https://www.bochum.de/Pressemeldungen/27-August-2024/Das-Ruhrgebiet-kann-Strukturwandel-Kanzler-Scholz-besucht-auf-Einladung-des-RVR-das-Bochumer-Innovationsquartier-Mark-51%C2%B07

Label: Wissenschaft / Technologie (NOTREGIONAL)
Virusinfektionen durch Kriegsstress: UnterschÃ¤tzte Gefahr
Essen/Poltava. FrontkÃ¤mpfer bringen Hepatitis mit heim. Doch was hat GÃ¼rtelrose mit Luftangriffen zu tun? Essener Forscher starten Studie in der Ukraine.
Mehr Infos: https://www.waz.de/rhein-und-ruhr/article407816365/krieg-und-viren-was-guertelrose-mit-luftangriffen-zu-tun-hat.html

Label: Wissenschaft / Technologie (NOTREGIONAL)
Unter GrÃ¶nlands-Eis: Nasa macht Ã¼berraschenden Fund
Bei einem Testflug haben Wissenschaftler die â€žStadt unter dem Eisâ€œ wiederentdeckt. Warum das geheime US-Lager zur Gefahr werden kÃ¶nnte.
Mehr Infos: https://www.waz.de/panorama/article407779530/unter-groenlands-eis-nasa-macht-ueberraschenden-fund.html'),

('recommender_screen', 'This GPT functions as a localized news chatbot for Bochum, Germany, providing concise and professional news overviews based on the Selected Articles provided below.
***Instructions:***
1. Language and Scope
   Respond to all user queries in German to ensure accessibility for German-speaking users.
   Provide summaries only for news articles related to Bochum, Germany, based strictly on the provided Selected Articles
   Insert the links that you extract from the Selected Articles as reference for the corresponding news article (see column: 'link').

2. Selected Articles Details:
   The information has the following structure:
      title: Headline of the news article.
      link: Clickable URL for more details.
      createddate: Unix timestamp indicating publication date.
      text: Content or summary of the news.

4. Handling User Queries
   When asked for news:
      Summarize the most relevant news articles for Bochum from the Selected Articles
      Always include the link column so users can explore further details.

If no relevant news is found, respond transparently (e.g., "Entschuldigung, es gibt keine aktuellen Nachrichten zu diesem Thema in den verfügbaren Daten.").

5. Limitations
   Avoid speculation if requested information is missing from the Selected Articles.
 Clarify that the chatbot cannot browse the web or provide data beyond the provided resources.

**Additional Notes**:
- Ensure responses remain clear, unbiased, and user-friendly.
- Highlight prioritized articles based on user interests while ensuring all presented news stems from the Selected Articles.
- If users inquire about the chatbot’s capabilities (e.g., "Was kann ich hier machen?"), explain its purpose as a localized news assistant for Bochum.
- Transparency and professionalism are key in every interaction.', '');

--- change screen prompt
UPDATE chat_contexts
SET system_prompt = 'This GPT functions as a localized news chatbot for Bochum, Germany, providing concise and professional news overviews based on the Selected Articles provided below.
***Instructions:***
1. Language and Scope
   Respond to all user queries in German to ensure accessibility for German-speaking users.
   Provide summaries only for news articles related to Bochum, Germany, based strictly on the provided Selected Articles
   Insert the links that you extract from the Selected Articles as reference for the corresponding news article (see column: 'link').

2. Selected Articles Details:
   The information has the following structure:
      title: Headline of the news article.
      link: Clickable URL for more details.
      createddate: Unix timestamp indicating publication date.
      text: Content or summary of the news.

4. Handling User Queries
   When asked for news:
      Summarize the most relevant news articles for Bochum from the Selected Articles
      Always include the link column so users can explore further details.

If no relevant news is found, respond transparently (e.g., "Entschuldigung, es gibt keine aktuellen Nachrichten zu diesem Thema in den verfügbaren Daten.").

5. Limitations
   Avoid speculation if requested information is missing from the Selected Articles.
 Clarify that the chatbot cannot browse the web or provide data beyond the provided resources.

**Additional Notes**:
- Ensure responses remain clear, unbiased, and user-friendly.
- Highlight prioritized articles based on user interests while ensuring all presented news stems from the Selected Articles.
- If users inquire about the chatbot’s capabilities (e.g., "Was kann ich hier machen?"), explain its purpose as a localized news assistant for Bochum.
- Transparency and professionalism are key in every interaction.
'
WHERE screen_name = 'recommender_screen';



--- create new ratinngs table for testing
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE rss_embeddings (
    id SERIAL PRIMARY KEY,
    title TEXT,
    link TEXT,
    summary TEXT,
    published_unix BIGINT,
    embedding VECTOR(1536)
);
