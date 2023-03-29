declare namespace NodeJS {
  export interface ProcessEnv {
    APP_URL: string;
    NEXT_PUBLIC_APP_URL: string;
    REVALIDATE_TOKEN: string;
    ANALYZE: boolean;

    NEXT_PUBLIC_AUTHORIZATION_TOKEN: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_TILESERVER_URL: string;

    MIXPANEL_TOKEN: string;
    MIXPANEL_PROJECT_ID: string;
    MIXPANEL_SA_USER: string;
    MIXPANEL_SA_SECRET: string;
    NEXT_PUBLIC_MIXPANEL_TOKEN: string;
  }
}

declare module "chartjs-plugin-crosshair" {
  export const CrosshairPlugin: any;
  export const Interpolate: any;

  export interface InteractionModeMap {
    interpolate: Function;
  }
}

// canvas2svg mock typings
declare module "canvas2svg" {
  export default (width: number, height: number) => any;
  getSerializedSvg();
}

declare module "geojson-bbox" {
  export default function (geojson: GeoJSONObject): [number, number, number, number] {}
}

// Import Leaflet into L in case you want to reference Leaflet types
import * as L from "leaflet";

// Declare the leaflet module so we can modify it
declare module "leaflet" {
  export interface IEasyPrintConstructorOptions {
    title?: string;
    position?: string;
    exportOnly?: boolean;
    hideControlContainer?: boolean;
    hidden?: boolean;
    sizeModes: string[];
  }

  export interface EasyPrint extends L.Control {
    printMap: (size: string, text: string) => void;
  }

  export function easyPrint(options?: IEasyPrintConstructorOptions): EasyPrint;
}
