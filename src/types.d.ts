import type { FeatureCollection, Geometry } from 'geojson';

type LocationsFeatureCollection = FeatureCollection<
  Geometry,
  {
    name: string;
    auroraId: string;
    height?: number;
    colour?: string;
    temp?: number | null;
  }
>;

type TimeSeriesData = {
  timestamps: string[];
  series: Record<string, (number | null)[]>;
};
