import ElectionCard from "@components/Card/ElectionCard";
import ComboBox from "@components/Combobox";
import { SPRIcon, SPRIconSolid } from "@components/Icon/agency";
import ImageWithFallback from "@components/ImageWithFallback";
import ContainerTabs from "@components/Tabs/ContainerTabs";
import {
  AgencyBadge,
  Container,
  Hero,
  Panel,
  Section,
  StateDropdown,
  Tabs,
} from "@components/index";
import type { OptionType } from "@components/types";
import { FlagIcon, MapIcon, UserIcon } from "@heroicons/react/24/solid";
import { useData } from "@hooks/useData";
import { useTranslation } from "@hooks/useTranslation";
import { get } from "@lib/api";
import { CountryAndStates } from "@lib/constants";
import { toDate } from "@lib/helpers";
import { routes } from "@lib/routes";
import { generateSchema } from "@lib/schema/election-explorer";
import { Trans } from "next-i18next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FunctionComponent, useMemo } from "react";
import type { BaseResult, ElectionResource, Party, PartyResult } from "./types";

/**
 * Election Explorer Dashboard - Political Parties Tab
 * @overview Status: In-development
 */

const ElectionTable = dynamic(() => import("@components/Chart/Table/ElectionTable"), {
  ssr: false,
});

interface ElectionPartiesProps extends ElectionResource<Party> {
  selection: string[];
}

const ElectionPartiesDashboard: FunctionComponent<ElectionPartiesProps> = ({
  params,
  selection,
  elections,
}) => {
  const { t, i18n } = useTranslation(["dashboard-election-explorer", "common"]);
  const { push } = useRouter();

  const { data, setData } = useData({
    tab_index: 0, // parlimen = 0; dun = 1
    party: params.party_name,
    state: params.state,

    loading: false,
  });

  const party_schema = generateSchema<Party>([
    {
      key: "election_name",
      id: "election_name",
      header: t("election_name"),
    },
    {
      key: "seats",
      id: "seats",
      header: t("seats_won"),
    },
    {
      key: "votes",
      id: "votes",
      header: t("votes_won"),
    },
    {
      key: item => item,
      id: "full_result",
      header: "",
      cell: ({ row, getValue }) => {
        const selection = data.tab_index === 0 ? elections.parlimen : elections.dun;
        const item = getValue() as Party;

        return (
          <ElectionCard
            defaultParams={item}
            onChange={(option: Party) => fetchResult(option.election_name, option.state)}
            columns={generateSchema<PartyResult[number]>([
              {
                key: "party",
                id: "party",
                header: t("party_name"),
              },
              {
                key: "seats",
                id: "seats",
                header: t("seats_won"),
              },
              {
                key: "votes",
                id: "votes",
                header: t("votes_won"),
              },
            ])}
            title={
              <div className="flex flex-row gap-2 uppercase">
                <h5>{item.election_name}</h5>
              </div>
            }
            options={selection}
            // highlightedRow={data.full_results.findIndex((r: Result) => r.name === data.candidate)}
            page={row.index}
          />
        );
      },
    },
  ]);

  const PARTY_OPTIONS: Array<OptionType> = selection.map(option => ({
    label: t(`${option}`),
    value: option,
  }));

  const navigateToParty = (name?: string, state?: string) => {
    if (!name) return;
    setData("loading", true);
    setData("party", name);

    const route = state
      ? `${routes.ELECTION_EXPLORER}/parties/${encodeURIComponent(name)}/${state}`
      : `${routes.ELECTION_EXPLORER}/parties/${encodeURIComponent(name)}`;

    push(route, undefined, {
      scroll: false,
      locale: i18n.language,
    }).then(() => setData("loading", false));
  };

  const fetchResult = async (election: string, state: string) => {
    return get("/explorer", {
      explorer: "ELECTIONS",
      chart: "full_result",
      type: "party",
      election,
      state,
    })
      .then(({ data }: { data: PartyResult }) => {
        return {
          data: data.sort(
            (a: PartyResult[number], b: PartyResult[number]) => b.votes.abs - a.votes.abs
          ),
        };
      })
      .catch(e => {
        console.error(e);
      });
  };

  return (
    <>
      <Hero
        background="red"
        category={[t("common:categories.democracy"), "text-danger"]}
        header={[t("header")]}
        description={[t("description")]}
        agencyBadge={
          <AgencyBadge
            agency={"Election Comission (EC)"}
            link="https://www.spr.gov.my/"
            icon={<SPRIcon />}
          />
        }
      />

      <Container className="min-h-fit">
        <ContainerTabs.List
          options={[
            {
              name: t("elections"),
              icon: <SPRIconSolid className="-mb-1" />,
              url: routes.ELECTION_EXPLORER.concat("/elections"),
            },
            {
              name: t("candidates"),
              icon: <UserIcon className="m-1 h-5 w-5" />,
              url: routes.ELECTION_EXPLORER.concat("/candidates"),
            },
            {
              name: t("parties"),
              icon: <FlagIcon className="m-1 h-5 w-5" />,
            },
            {
              name: t("seats"),
              icon: <MapIcon className="m-1 h-5 w-5" />,
              url: routes.ELECTION_EXPLORER.concat("/seats"),
            },
          ]}
          current={2}
        />
        <Section>
          <div className="lg:grid lg:grid-cols-12">
            <div className="lg:col-span-10 lg:col-start-2">
              {/* Explore any party's entire electoral history */}
              <h4 className="text-center">{t("party.header")}</h4>
              <div className="grid grid-cols-12 pb-12 pt-6 lg:grid-cols-10">
                <div className="col-span-10 col-start-2 sm:col-span-8 sm:col-start-3 md:col-span-6 md:col-start-4 lg:col-span-4 lg:col-start-4">
                  <ComboBox
                    placeholder={t("party.search_party")}
                    options={PARTY_OPTIONS}
                    selected={data.party ? PARTY_OPTIONS.find(e => e.value === data.party) : null}
                    onChange={selected => navigateToParty(selected?.value, data.state)}
                    enableFlag
                  />
                </div>
              </div>
              <Tabs
                title={
                  <Trans>
                    <span className="text-lg font-normal leading-9">
                      <ImageWithFallback
                        className="border-outline dark:border-washed-dark mr-2 inline-flex items-center rounded border"
                        src={`/static/images/parties/${data.party}.png`}
                        width={32}
                        height={18}
                        alt={t(`${data.party}`)}
                      />
                      {t("party.title", {
                        party: `$t(dashboard-election-explorer:${data.party})`,
                      })}
                      <StateDropdown
                        currentState={data.state}
                        onChange={selected => {
                          setData("state", selected.value);
                          navigateToParty(data.party, selected.value);
                        }}
                        width="inline-block pl-1 min-w-max"
                        anchor="left"
                      />
                    </span>
                  </Trans>
                }
                current={data.tab_index}
                onChange={(index: number) => setData("tab_index", index)}
                className="pb-6"
              >
                <Panel name={t("parliament_elections")}>
                  <ElectionTable
                    data={elections.parlimen}
                    columns={party_schema}
                    isLoading={data.loading}
                    empty={
                      <Trans>
                        {t("party.no_data", {
                          party: `$t(dashboard-election-explorer:${data.party})`,
                          context: "parliament",
                        })}
                      </Trans>
                    }
                  />
                </Panel>
                <Panel name={t("state_elections")}>
                  <ElectionTable
                    data={elections.dun} // TODO: Replace with DUN later
                    columns={party_schema}
                    isLoading={data.loading}
                    empty={
                      <Trans>
                        {t("party.no_data", {
                          party: `$t(dashboard-election-explorer:${data.party})`,
                          state: CountryAndStates[data.state],
                          context: data.state === "mys" ? "dun_mys" : "dun",
                        })}
                      </Trans>
                    }
                  />
                </Panel>
              </Tabs>
            </div>
          </div>
        </Section>
      </Container>
    </>
  );
};

export default ElectionPartiesDashboard;
