import { InferGetStaticPropsType, GetStaticProps, GetStaticPaths } from "next";
import { Layout, Metadata, StateDropdown, StateModal } from "@components/index";
import { get } from "@lib/api";
import type { Page } from "@lib/types";
import { CountryAndStates, STATES } from "@lib/constants";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "@hooks/useTranslation";
import { routes } from "@lib/routes";
import { useRouter } from "next/router";
import Fonts from "@config/font";
import OrganDonationDashboard from "@dashboards/healthcare/organ-donation";
import { DateTime } from "luxon";

const OrganDonationState: Page = ({
  last_updated,
  timeseries,
  state,
  choropleth,
  barchart_age,
  barchart_time,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["dashboard-organ-donation", "common"]);

  return (
    <>
      <Metadata
        title={CountryAndStates[state].concat(" - ", t("header"))}
        description={t("description")}
        keywords={""}
      />
      <OrganDonationDashboard
        last_updated={last_updated}
        timeseries={timeseries}
        choropleth={choropleth}
        barchart_age={barchart_age}
        barchart_time={barchart_time}
      />
    </>
  );
};

OrganDonationState.layout = page => (
  <Layout
    className={[Fonts.body.variable, "font-sans"].join(" ")}
    stateSelector={
      <StateDropdown
        url={routes.ORGAN_DONATION}
        currentState={(useRouter().query.state as string) ?? "mys"}
        exclude={["kvy"]}
        hideOnScroll
      />
    }
  >
    <StateModal url={routes.ORGAN_DONATION} exclude={["kvy"]} />
    {page}
  </Layout>
);

export const getStaticPaths: GetStaticPaths = async () => {
  let paths: Array<any> = [];
  STATES.filter(item => !["kvy"].includes(item.key)).forEach(state => {
    paths = paths.concat([
      {
        params: {
          state: state.key,
        },
      },
      {
        params: {
          state: state.key,
        },
        locale: "ms-MY",
      },
    ]);
  });
  return {
    paths: paths,
    fallback: false, // can also be true or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const i18n = await serverSideTranslations(locale!, ["dashboard-organ-donation", "common"]);
  const { data } = await get("/dashboard", { dashboard: "organ_donation", state: params?.state });

  // transform:
  data.barchart_time.data.monthly.x = data.barchart_time.data.monthly.x.map((item: any) => {
    const period = DateTime.fromFormat(item, "yyyy-MM-dd");
    return period.monthShort !== "Jan" ? period.monthShort : period.year.toString();
  });

  return {
    props: {
      ...i18n,
      last_updated: new Date().valueOf(),
      timeseries: data.timeseries,
      state: params?.state,
      choropleth: data.choropleth_malaysia,
      barchart_age: data.barchart_age,
      barchart_time: data.barchart_time,
    },
    revalidate: 60 * 60 * 24,
  };
};

export default OrganDonationState;
