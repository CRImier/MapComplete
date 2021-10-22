import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import Loc from "../../../Models/Loc";
import DynamicTileSource from "./DynamicTileSource";
import {Utils} from "../../../Utils";
import GeoJsonSource from "../Sources/GeoJsonSource";

export default class DynamicGeoJsonTileSource extends DynamicTileSource {
    constructor(layer: FilteredLayer,
                registerLayer: (layer: FeatureSourceForLayer & Tiled) => void,
                state: {
                    locationControl: UIEventSource<Loc>
                    leafletMap: any
                }) {
        const source = layer.layerDef.source
        if (source.geojsonZoomLevel === undefined) {
            throw "Invalid layer: geojsonZoomLevel expected"
        }
        if (source.geojsonSource === undefined) {
            throw "Invalid layer: geojsonSource expected"
        }
        
        const whitelistUrl = source.geojsonSource
            .replace("{z}", ""+source.geojsonZoomLevel)
            .replace("{x}_{y}.geojson", "overview.json")
            .replace("{layer}",layer.layerDef.id)
        
        let whitelist = undefined
        Utils.downloadJson(whitelistUrl).then(
            json => {
                const data = new Map<number, Set<number>>();
                for (const x in json) {
                    data.set(Number(x), new Set(json[x]))
                }
                whitelist = data
            }
        ).catch(err => {
            console.warn("No whitelist found for ", layer.layerDef.id, err)
        })

        const seenIds = new Set<string>();
        const blackList = new UIEventSource(seenIds)
        super(
            layer,
            source.geojsonZoomLevel,
            (zxy) => {
                if(whitelist !== undefined){
                    const isWhiteListed = whitelist.get(zxy[1])?.has(zxy[2])
                    if(!isWhiteListed){
                        console.log("Not downloading tile", ...zxy, "as it is not on the whitelist")
                        return undefined;
                    }
                }
                
                const src = new GeoJsonSource(
                    layer,
                    zxy,
                    {
                        featureIdBlacklist: blackList
                    }
                )
                src.features.addCallbackAndRunD(feats => {
                    feats.forEach(feat => seenIds.add(feat.feature.properties.id))
                    blackList.ping();
                })
                registerLayer(src)
                return src
            },
            state
        );

    }

}