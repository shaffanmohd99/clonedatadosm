import type { GeoChoroplethRef } from "@components/Chart/Choropleth/geochoropleth";
import { CloudArrowDownIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import type { Color } from "@hooks/useColor";
import { useExport } from "@hooks/useExport";
import { useTranslation } from "@hooks/useTranslation";
import { download } from "@lib/helpers";
import type { DownloadOptions } from "@lib/types";
import { track } from "mixpanel-browser";
import { default as dynamic } from "next/dynamic";
import { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";

const Choropleth = dynamic(() => import("@components/Chart/Choropleth/geochoropleth"), {
  ssr: false,
});

type ChoroPoint = {
  id: string;
  value: number;
};

interface CatalogueChoroplethProps {
  config: {
    color: Color;
    geojson: "state" | "dun" | "parlimen" | "district";
    precision: number;
  };
  dataset: {
    chart: Array<ChoroPoint>; // ChoroplethData
    meta: {
      en: {
        title: string;
      };
      bm: {
        title: string;
      };
      unique_id: string;
    };
  };
  lang: "en" | "bm";
  urls: {
    [key: string]: string;
  };
  onDownload?: (prop: DownloadOptions) => void;
}

const CatalogueChoropleth: FunctionComponent<CatalogueChoroplethProps> = ({
  dataset,
  config,
  lang,
  urls,
}) => {
  const { t } = useTranslation();
  const ref = useRef<GeoChoroplethRef>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const { onRefChange, png, svg } = useExport(mounted, "#map");

  //   useEffect(() => {
  //     onDownload && onDownload(availableDownloads());
  //   }, [svg, png, mounted]);

  //   const availableDownloads = useCallback(
  //     () => ({
  //       chart: [
  //         {
  //           key: "png",
  //           image: png,
  //           title: t("catalogue.image.title"),
  //           description: t("catalogue.image.desc"),
  //           icon: <CloudArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
  //           href: () => {
  //             if (png) {
  //               download(png, dataset.meta.unique_id.concat(".png"), () =>
  //                 track("file_download", {
  //                   uid: dataset.meta.unique_id.concat("_png"),
  //                   id: dataset.meta.unique_id,
  //                   ext: "svg",
  //                   name_en: dataset.meta.en.title,
  //                   name_bm: dataset.meta.bm.title,
  //                   type: "image",
  //                 })
  //               );
  //             }
  //           },
  //         },
  //         {
  //           key: "svg",
  //           image: png,
  //           title: t("catalogue.vector.title"),
  //           description: t("catalogue.vector.desc"),
  //           icon: <CloudArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
  //           href: () => {
  //             if (svg) {
  //               download(svg, dataset.meta.unique_id.concat(".svg"), () =>
  //                 track("file_download", {
  //                   uid: dataset.meta.unique_id.concat("_svg"),
  //                   id: dataset.meta.unique_id,
  //                   ext: "svg",
  //                   name_en: dataset.meta.en.title,
  //                   name_bm: dataset.meta.bm.title,
  //                   type: "image",
  //                 })
  //               );
  //             }
  //           },
  //         },
  //       ],
  //       data: [
  //         {
  //           key: "csv",
  //           image: "/static/images/icons/csv.png",
  //           title: t("catalogue.csv.title"),
  //           description: t("catalogue.csv.desc"),
  //           icon: <DocumentArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
  //           href: urls.csv,
  //         },
  //         {
  //           key: "parquet",
  //           image: "/static/images/icons/parquet.png",
  //           title: t("catalogue.parquet.title"),
  //           description: t("catalogue.parquet.desc"),
  //           icon: <DocumentArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
  //           href: urls.parquet,
  //         },
  //       ],
  //     }),
  //     [ref]
  //   );

  return (
    <>
      <div ref={onRefChange} id="#map">
        <Choropleth
          ref={ref}
          className="h-[350px] w-full lg:h-[600px]"
          data={{
            labels: dataset.chart.map(({ id }: ChoroPoint) => id),
            values: dataset.chart.map(({ value }: ChoroPoint) => value),
          }}
          color={config.color}
          type={config.geojson}
        />
      </div>
    </>
  );
};

export default CatalogueChoropleth;
