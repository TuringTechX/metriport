/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as Metriport from "../../../../api";
import * as core from "../../../../core";

export const ConnectedUserInfo: core.serialization.ObjectSchema<
    serializers.devices.ConnectedUserInfo.Raw,
    Metriport.devices.ConnectedUserInfo
> = core.serialization.object({
    metriportUserId: core.serialization.string(),
    appUserId: core.serialization.string(),
    connectedProviders: core.serialization.list(core.serialization.string()).optional(),
});

export declare namespace ConnectedUserInfo {
    interface Raw {
        metriportUserId: string;
        appUserId: string;
        connectedProviders?: string[] | null;
    }
}