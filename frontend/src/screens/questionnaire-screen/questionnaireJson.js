const questionnaireJson = {

  elements: [
    {
      "type": "text",
      "name": "age",
      "title": "Wie alt bist du?",
      "description": "Geben Sie Ihr Alter in Zahlen ein (z. B. \"23\")",
      "inputType": "number",

    },
    {
      "type": "radiogroup",
      "name": "gender",
      "title": "Mit welchem Geschlecht identifizierst du dich?",
      "description": "Hinweis: Wir fragen dies, weil wir sicherstellen möchten, dass wir Menschen mit verschiedenen Geschlechtsidentitäten einbeziehen.",
      "choices": [
        {
          "value": "1",
          "text": "Mann"
        },
        {
          "value": "2",
          "text": "Frau"
        },
        {
          "value": "3",
          "text": "Non-binär"
        }
      ],
      "showOtherItem": true,
      "otherText": "Ich beschreibe mich anders, und zwar:",

    },
    {
      "type": "text",
      "name": "location",
      "title": "Wie lautet die Postleitzahl deines Wohnortes?",
      "description": "Hinweis: Wir fragen dies, weil wir sicherstellen möchten, dass wir Menschen aus Bochum und Umgebung einbeziehen.",
      "inputType": "number",

    },
    {
      "type": "radiogroup",
      "name": "newsConsumptionFrequency",
      "title": "Wie oft siehst, hörst, liest oder redest du normalerweise über Nachrichten aus Bochum und Umgebung?",
      "description": "Es geht hier ausdrücklich um deine persönliche Meinung, jeder und jede hat andere Interessen.",
      "choices": [
        {
          "value": "1",
          "text": "Mehr als 10 Mal täglich"
        },
        {
          "value": "2",
          "text": "Zwischen sechs und zehn Mal täglich"
        },
        {
          "value": "3",
          "text": "Zwischen zwei und fünf Mal täglich"
        },
        {
          "value": "4",
          "text": "Mehr als 11 Mal täglich"
        },
        {
          "value": "5",
          "text": "Einmal täglich"
        },
        {
          "value": "7",
          "text": "An 4 bis 6 Tagen pro Woche"
        },
        {
          "value": "8",
          "text": "An 2 bis 3 Tagen pro Woche"
        },
        {
          "value": "9",
          "text": "Seltener als einmal pro Woche"
        },
        {
          "value": "10",
          "text": "Seltener als einmal pro Monat"
        },
        {
          "value": "11",
          "text": "Niemals"
        }
      ],

    },
    {
      "type": "radiogroup",
      "name": "education",
      "title": "Welchen Abschluss hast du?",
      "description": "Wenn du derzeit in der Ausbildung bist, gib bitte den höchsten Abschluss an, den du bisher erreicht hast. Warum wir das fragen? Wir möchten sicherstellen, dass wir Menschen mit unterschiedlichen Bildungshintergründen einbeziehen.",
      "choices": [
        {
          "value": "1",
          "text": "Schule ohne Abschluss beendet"
        },
        {
          "value": "2",
          "text": "Hauptschule / Volksschule"
        },
        {
          "value": "3",
          "text": "Realschule, mittlere Reife oder gleichwertiger Abschluss"
        },
        {
          "value": "4",
          "text": "Abgeschlossene Lehre (2- bis 4-jährige Ausbildung: Berufslehre, berufliche Grundbildung)"
        },
        {
          "value": "5",
          "text": "Fachabitur / Fachhochschulreife"
        },
        {
          "value": "6",
          "text": "Abitur / Hochschulreife"
        },
        {
          "value": "7",
          "text": "Bachelorabschluss"
        },
        {
          "value": "8",
          "text": "Masterabschluss"
        },
        {
          "value": "9",
          "text": "Promotion"
        }
      ],
      "showOtherItem": true,
      "otherText": "Anderer Abschluss, und zwar:",
    },
],
"completeText": "Weiter"
};

export default questionnaireJson