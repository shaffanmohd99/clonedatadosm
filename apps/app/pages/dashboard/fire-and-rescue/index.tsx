import { GetStaticProps } from "next";
import type { InferGetStaticPropsType } from "next";
import { get } from "@lib/api";
import type { Page } from "@lib/types";
import Metadata from "@components/Metadata";
import { useTranslation } from "@hooks/useTranslation";
import FireandRescueDashboard from "@dashboards/public-safety/fire-and-rescue";
import { withi18n } from "@lib/decorators";

const FireandRescue: Page = ({}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["dashboard-fire-and-rescue", "common"]);

  return (
    <>
      <Metadata title={t("header")} description={t("description")} keywords={""} />
      <FireandRescueDashboard />
    </>
  );
};
// Disabled
export const getStaticProps: GetStaticProps = withi18n("dashboard-fire-and-rescue", async () => {
  //   const { data } = await get("/dashboard", { dashboard: "currency" });

  return {
    notFound: false,
    props: {},
    revalidate: 60 * 60 * 24, // 1 day (in seconds)
  };
});

export default FireandRescue;
