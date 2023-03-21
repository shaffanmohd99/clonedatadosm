import { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import {
  Container,
  Dropdown,
  Hero,
  Panel,
  Section,
  Tabs,
  StateDropdown,
  Button,
} from "@components/index";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { routes } from "@lib/routes";
import { AKSARA_COLOR, BREAKPOINTS, CountryAndStates } from "@lib/constants";
import { useData } from "@hooks/useData";
import { useTranslation } from "@hooks/useTranslation";
import { useWindowWidth } from "@hooks/useWindowWidth";
import AgencyBadge from "@components/AgencyBadge";
import Slider, { SliderRef } from "@components/Chart/Slider";
import {
  CakeIcon,
  IdentificationIcon,
  MagnifyingGlassIcon as SearchIcon,
} from "@heroicons/react/24/solid";
import LeftRightCard from "@components/LeftRightCard";
import { useWatch } from "@hooks/useWatch";
import Card from "@components/Card";
import { ChartJSOrUndefined } from "react-chartjs-2/dist/types";
import { get } from "@lib/api";
import { useFilter } from "@hooks/useFilter";
import { DateTimeFormatOptions } from "luxon";

/**
 * Birthday Popularity Dashboard
 * @overview Status: Live
 */

const Timeseries = dynamic(() => import("@components/Chart/Timeseries"), { ssr: false });

interface BirthdayPopularityDashboardProps {
  query: any;
  rank: any;
  timeseries: any;
}

const BirthdayPopularityDashboard: FunctionComponent<BirthdayPopularityDashboardProps> = ({
  query,
  rank,
  timeseries,
}) => {
  const { t, i18n } = useTranslation(["common", "dashboard-birthday-popularity"]);
  const chartRef = useRef(null);

  const daysOfYearInMillis: number[] = Array.from(
    { length: 366 },
    (_, i) => i * 1000 * 60 * 60 * 24 + 63072000000
  );

  const oldest_year = new Date(timeseries.data.x[0]).getFullYear();
  const diff =
    (timeseries.data.x[timeseries.data.x.length - 1] - timeseries.data.x[0]) /
    (365 * 24 * 60 * 60 * 1000);
  const yearRange: number[] = Array.from({ length: diff }, (_, i) => i + oldest_year);

  const isLeapYear = (year: number) => {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  };

  const getDayOfYear = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return isLeapYear(date.getFullYear()) ? day : day > 59 ? day + 1 : day;
  };

  const groupValuesByDayOfYear = (
    milliseconds: number[],
    values: number[],
    yearRange?: [number, number]
  ) => {
    const result: number[] = new Array(366).fill(0);
    for (let i = 0; i < milliseconds.length; i++) {
      const date = new Date(milliseconds[i]);
      const year = date.getFullYear();
      if (yearRange && (year < yearRange[0] || year > yearRange[1])) {
        continue; // Skip data point outside range
      }
      const dayOfYear = getDayOfYear(date);
      result[dayOfYear - 1] += values[i];
    }
    return result;
  };

  const getAge = (dateString: string) => {
    let years = 0;
    let months = 0;
    let days = 0;
    const birthDate = new Date(dateString);
    const currentDate = new Date();

    // Calculate years
    years = currentDate.getFullYear() - birthDate.getFullYear();

    // Calculate months and days
    const birthMonth = birthDate.getMonth();
    const currentMonth = currentDate.getMonth();
    if (currentMonth >= birthMonth) {
      months = currentMonth - birthMonth;
    } else {
      years--;
      months = 12 + currentMonth - birthMonth;
    }
    const birthDay = birthDate.getDate();
    const currentDay = currentDate.getDate();
    if (currentDay >= birthDay) {
      days = currentDay - birthDay;
    } else {
      months--;
      const daysInLastMonth = new Date(currentDate.getFullYear(), currentMonth, 0).getDate();
      days = daysInLastMonth + currentDay - birthDay;
      if (months < 0) {
        years--;
        months = 11;
      }
    }
    return { years, months };
  };
  const { years, months } = getAge(query.bday);
  const options: DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };

  const barColourArray: string[] = Array(366).fill("#71717A4D");
  const highlightBar = (bday: string, barArray: string[]) => {
    barArray[getDayOfYear(new Date(bday)) - 1] = AKSARA_COLOR.PRIMARY;
    return barArray;
  };
  const highlightedArray = highlightBar(query.bday, barColourArray);

  const { data, setData } = useData({
    state: query.state ? query.state : undefined,
    minmax: query.bday
      ? [
          Number(query.bday.substring(0, query.bday.indexOf("-"))) - oldest_year - 1,
          Number(query.bday.substring(0, query.bday.indexOf("-"))) - oldest_year + 1,
        ]
      : [0, yearRange.length - 1],
    colour: query.bday ? highlightedArray : barColourArray,
    bday: query.bday ? query.bday : undefined,
    string: query.bday ? query.bday : undefined,
  });

  const handleClick = () => {
    barColourArray[getDayOfYear(new Date(query.bday)) - 1] = AKSARA_COLOR.PRIMARY;
    setData("colour", barColourArray);
    setFilter("state", data.state);
    setFilter("bday", data.string);
  };

  const filterTimeline = () => {
    return {
      births: groupValuesByDayOfYear(timeseries.data.x, timeseries.data.births, [
        data.minmax[0] + oldest_year,
        data.minmax[1] + oldest_year,
      ]),
    };
  };
  const filtered_timeline = useCallback(filterTimeline, [data.minmax, timeseries]);

  // const sliderRef = useRef<SliderRef>(null);
  // useWatch(() => {
  //   sliderRef.current && sliderRef.current.reset();
  // }, [timeseries.data]);

  const [isLoading, setLoading] = useState(false);
  const { filter, setFilter } = useFilter({
    state: query.state,
    bday: query.bday,
  });
  return (
    <>
      <Hero
        background="bg-gradient-radial border-b dark:border-zinc-800 from-[#A1BFFF] to-background dark:from-outlineHover-dark dark:to-black"
        category={[t("nav.megamenu.categories.demography"), "text-primary"]}
        header={[t("dashboard-birthday-popularity:header")]}
        description={[t("dashboard-birthday-popularity:description")]}
        agencyBadge={
          <AgencyBadge
            agency="Jabatan Pendaftaran Negara"
            link="https://www.jpn.gov.my/en/"
            icon={
              <div className="h-8 w-8 rounded-full bg-primary">
                <IdentificationIcon className="mx-auto mt-1 h-6 w-6 text-white" />
              </div>
            }
          />
        }
      />
      <Container className="min-h-screen">
        <Section>
          <div className="flex flex-col gap-8 rounded-xl lg:flex-row">
            <Card
              className="basis-1/3 rounded-xl border border-outline p-6 dark:border-washed-dark"
              type="gray"
            >
              <p className="mb-3 text-sm font-medium text-black dark:text-white">
                {t("dashboard-birthday-popularity:enter_birthday")}
              </p>
              <input
                type="date"
                name="date"
                id="date"
                data-placeholder="Date of birth"
                value={query.bday}
                // placeholder="28 September 1993"
                // required pattern="dd Month yyyy"
                onChange={selected => {
                  setData("string", selected.target.value);
                  // setData("bday", selected.target.valueAsDate);
                }}
                className={[
                  `relative flex w-full gap-[6px] rounded-md border border-outline bg-white py-[6px] pl-3 text-left text-sm hover:border-outlineHover
                  focus:outline-none focus-visible:ring-0 active:bg-washed disabled:pointer-events-none disabled:bg-outline 
                  disabled:text-dim dark:border-washed-dark dark:border-outline/10 dark:bg-black dark:text-white dark:active:bg-washed/10 lg:items-center 
                  `,
                ].join(" ")}
              ></input>
              <p className="mt-6 mb-3 text-sm font-medium text-black dark:text-white">
                {t("dashboard-birthday-popularity:choose_state")}
              </p>
              <StateDropdown
                currentState={data.state}
                onChange={selected => {
                  setData("state", selected.value);
                }}
                exclude={["kvy", "mys"]}
                width="w-full"
              />
              <Button
                className="mt-6 bg-gradient-to-b from-primary-dark to-primary text-white"
                onClick={handleClick}
                // disabled={!}
                icon={<SearchIcon className="h-4 w-4 text-white" />}
              >
                {t("dashboard-birthday-popularity:search")}
              </Button>
              <p className="mt-6 text-sm text-dim dark:text-white">
                {t("dashboard-birthday-popularity:privacy")}
              </p>
            </Card>
            <div className="basis-2/3">
              <Card className="flex h-full flex-col gap-6 rounded-xl border border-outline dark:border-washed-dark lg:flex-row lg:p-8">
                {query.bday ? (
                  <>
                    <Card className="mx-auto flex h-auto min-w-full flex-col self-center rounded-xl border border-outline bg-background px-4 py-16 dark:border-washed-dark dark:bg-washed-dark lg:min-w-max">
                      <CakeIcon className="mx-auto h-10 w-10 text-primary" />
                      <div className="mx-auto mt-4 text-lg font-bold text-black dark:text-white">
                        {new Date(query.bday).toLocaleDateString("en-GB", options)}
                      </div>
                      <div className="mx-auto mt-3 text-sm text-dim dark:text-white">
                        {t("dashboard-birthday-popularity:section_1.age", {
                          age: `${years} years and ${months} months`,
                        })}
                      </div>
                    </Card>
                    <div className="flex flex-col gap-3 px-2 lg:py-16">
                      <p className="mx-auto text-lg font-bold text-black dark:text-white">
                        {t("dashboard-birthday-popularity:section_1.info1")}
                        <span className="mx-auto text-lg font-bold text-primary">
                          {filtered_timeline().births[
                            getDayOfYear(new Date(query.bday)) - 1
                          ].toLocaleString("en-US")}
                        </span>
                        {t("dashboard-birthday-popularity:section_1.info2")}
                        <span className="mx-auto text-lg font-bold text-primary">
                          {CountryAndStates[data.state]}
                        </span>
                        {t("dashboard-birthday-popularity:section_1.info3")}
                        <span className="mx-auto text-lg font-bold text-primary">{`${rank.data.births.toLocaleString(
                          "en-US"
                        )}`}</span>
                        {t("dashboard-birthday-popularity:section_1.info4")}
                        <span className="mx-auto text-lg font-bold text-primary">{`${rank.data.rank}th`}</span>
                        {t("dashboard-birthday-popularity:section_1.info5")}
                      </p>
                      <p className="mx-auto font-medium text-black dark:text-white">
                        {t("dashboard-birthday-popularity:section_1.info6")}
                      </p>
                    </div>
                  </>
                ) : (
                  <Card className="mx-auto flex h-min w-fit flex-row gap-2 self-center rounded-md border border-outline bg-outline py-1.5 px-3 dark:border-washed-dark dark:bg-washed-dark">
                    <SearchIcon className="mx-auto mt-1 h-4 w-4 text-black dark:text-white" />
                    <p>{t("dashboard-birthday-popularity:start_search")}</p>
                  </Card>
                )}
                <p></p>
              </Card>
            </div>
          </div>
        </Section>

        {/* Number of people born on each day of the year */}
        <Section
          title={t("dashboard-birthday-popularity:section_2.title", {
            start_year: yearRange[0],
            end_year: yearRange[yearRange.length - 1],
          })}
          date={timeseries.data_as_of}
          className={[query.bday ? "opacity-100" : "opacity-20", "py-8"].join(" ")}
        >
          <Timeseries
            className="h-[350px] w-full"
            _ref={chartRef}
            interval="day"
            round="day"
            mode="grouped"
            data={{
              labels: daysOfYearInMillis,
              datasets: [
                {
                  type: "bar",
                  data: filtered_timeline().births,
                  label: t("dashboard-birthday-popularity:section_2.births"),
                  backgroundColor: data.colour,
                  barPercentage: 0.75,
                },
              ],
            }}
          />
          <div className="pt-6">
            <Slider
              // ref={sliderRef}
              type="range"
              value={data.minmax}
              data={yearRange}
              parseAsDate={false}
              onChange={e => setData("minmax", e)}
            />
          </div>
        </Section>
      </Container>
    </>
  );
};

export default BirthdayPopularityDashboard;
