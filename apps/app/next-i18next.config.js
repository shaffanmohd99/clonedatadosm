const I18NextHttpBackend = require("i18next-http-backend");
const path = require("path");

const namespace = [
  "common",
  "dashboard-999-tracker",
  "dashboard-birthday-explorer",
  "dashboard-blood-donation",
  "dashboard-car-popularity",
  "dashboard-circle-of-life",
  "dashboard-civil-service",
  "dashboard-consumer-prices",
  "dashboard-covid-19",
  "dashboard-covid-vaccination",
  "dashboard-covid-currency-in-circulation",
  "dashboard-election-explorer",
  "dashboard-exchange-rates",
  "dashboard-fire-and-rescue",
  "dashboard-flood-warning",
  "dashboard-gdp",
  "dashboard-government-site-tracker",
  "dashboard-hospital-bed-utilisation",
  "dashboard-immigration",
  "dashboard-income-taxation",
  "dashboard-interest-rates",
  "dashboard-international-reserves",
  "dashboard-internet-penetration",
  "dashboard-money-supply",
  "dashboard-name-popularity",
  "dashboard-organ-donation",
  "dashboard-peka-b40",
  "dashboard-peoples-income-initiative",
  "dashboard-poverty",
  "dashboard-public-contracting",
  "dashboard-public-pension",
  "dashboard-public-transportation",
  "dashboard-reserve-money",
  "dashboard-retirement-readiness",
  "dashboard-sekolahku",
  "dashboard-social-security",
  "dashboard-weather-and-climate",
];

const config = {
  development: {
    i18n: {
      defaultLocale: "en-GB",
      locales: ["en-GB", "ms-MY"],
    },
    localePath: path.resolve("./public/locales"),
    load: "currentOnly",
    preload: ["en-GB", "ms-MY"],
    serializeConfig: false,
    reloadOnPrerender: true,
    react: {
      bindI18n: "languageChanged",
      bindI18nStore: "languageChanged",
      useSuspense: true,
    },
  },
  production: {
    i18n: {
      defaultLocale: "en-GB",
      locales: ["en-GB", "ms-MY"],
      backend: {
        loadPath: `${process.env.NEXT_PUBLIC_API_URL}/i18n?lang={{lng}}&filename={{ns}}`,
        customHeaders: {
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_TOKEN,
        },
      },
    },
    ns: namespace,
    load: "currentOnly",
    preload: ["en-GB", "ms-MY"],
    serializeConfig: false,
    reloadOnPrerender: true,
    use: [I18NextHttpBackend],
    react: {
      bindI18n: "languageChanged",
      bindI18nStore: "languageChanged",
      useSuspense: true,
    },
  },
};

// Debug line: Uncomment to see production i18n on local
// module.exports = config.production;

module.exports = config[process.env.NODE_ENV];
