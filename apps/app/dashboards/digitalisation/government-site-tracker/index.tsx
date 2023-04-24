import AgencyBadge from "@components/AgencyBadge";
import { Hero } from "@components/index";
import { useTranslation } from "@hooks/useTranslation";
import { FunctionComponent } from "react";
import Container from "@components/Container";
import { MAMPUIcon } from "@components/Icon/agency";

/**
 * Government Site Tracker Dashboard
 * @overview Status: In-development
 */

interface GovernmentSiteTrackerProps {}

const GovernmentSiteTracker: FunctionComponent<GovernmentSiteTrackerProps> = ({}) => {
  const { t, i18n } = useTranslation(["common", "dashboard-government-site-tracker"]);

  return (
    <>
      <Hero
        background="blue"
        category={[
          t("common:nav.megamenu.categories.digitalisation"),
          "text-primary dark:text-primary-dark",
        ]}
        header={[t("dashboard-government-site-tracker:header")]}
        description={[t("dashboard-government-site-tracker:description")]}
        agencyBadge={
          <AgencyBadge agency={"MAMPU"} link="https://www.mampu.gov.my/" icon={<MAMPUIcon />} />
        }
      />
      {/* Rest of page goes here */}
      <Container className="min-h-screen"></Container>
    </>
  );
};

export default GovernmentSiteTracker;
