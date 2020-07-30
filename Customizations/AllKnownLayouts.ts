import {Groen} from "./Layouts/Groen";
import {GRB} from "./Layouts/GRB";
import {Artworks} from "./Layouts/Artworks";
import {Bookcases} from "./Layouts/Bookcases";
import Cyclofix from "./Layouts/Cyclofix";
import {WalkByBrussels} from "./Layouts/WalkByBrussels";
import {All} from "./Layouts/All";
import {Layout} from "./Layout";
import {MetaMap} from "./Layouts/MetaMap";
import {StreetWidth} from "./Layouts/StreetWidth";
import {Natuurpunt} from "./Layouts/Natuurpunt";
import {ClimbingTrees} from "./Layouts/ClimbingTrees";
import {Smoothness} from "./Layouts/Smoothness";

export class AllKnownLayouts {
    public static allSets = AllKnownLayouts.AllLayouts();

    private static AllLayouts(): Map<string, Layout> {
        const layouts: Layout[] = [
            new Groen(),
            new GRB(),
            new Cyclofix(),
            new Bookcases(),
            new WalkByBrussels(),
            new MetaMap(),
            new StreetWidth(),
            new Natuurpunt(),
            new ClimbingTrees(),
            new Artworks(),
            new Smoothness()
            /*new Toilets(),
            */
        ];


        const all = new All();
        const knownKeys = []
        for (const layout of layouts) {
            for (const layer of layout.layers) {
                const key = layer.overpassFilter.asOverpass().join("");
                if (knownKeys.indexOf(key) >= 0) {
                    continue;
                }
                knownKeys.push(key);
                all.layers.push(layer);
            }
        }
        layouts.push(all)

        const allSets: Map<string, Layout> = new Map();
        for (const layout of layouts) {
            allSets[layout.name] = layout;
        }
        return allSets;
    }

    public static GetSets(layoutNames): any {
        const all = new All();
        for (const name of layoutNames) {
            all.layers = all.layers.concat(AllKnownLayouts.allSets[name].layers);
        }

        return all;
    }
}
